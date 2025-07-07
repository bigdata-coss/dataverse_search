/**
 * Dataverse 검색 API 엔드포인트
 * 실제 Dataverse Search API를 호출하여 결과 반환
 * SSE(Server-Sent Events) 지원으로 실시간 검색 진행상황 제공
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { DataverseClient } from '$lib/api/dataverse.js';
import type { DataverseSearchResult } from '$lib/types/dataverse.js';
import { getActiveInstances, getInstancesByCountry } from '$lib/data/dataverse-instances.js';
import { dev } from '$app/environment';

interface SearchRequest {
	query: string;
	instance?: string;
	country?: string;
	per_page?: number;
	start?: number;
	type?: 'dataset' | 'file' | 'dataverse';
	specific_instance?: {
		id: number;
		url: string;
		apiUrl: string;
		platformName: string;
		country: string;
		organization: string;
	};
}

interface SearchResult {
	id: string;
	title: string;
	description: string;
	url: string;
	type: string;
	authors?: string[];
	instance: string;
	instanceUrl: string;
	country: string;
	publishedAt?: string;
	persistentId?: string;
	subjects?: string[];
}

interface SSEEvent {
	event: string;
	data: any;
	timestamp: number;
}

function debugLog(message: string, data?: any) {
	if (dev) {
		console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
	}
}

function debugError(message: string, error?: any) {
	if (dev) {
		console.error(`[DEBUG ERROR] ${message}`, error);
	}
}

/**
 * 단일 인스턴스에서 검색 수행
 */
async function searchSingleInstance(
	instanceUrl: string,
	query: string,
	options: {
		per_page?: number;
		start?: number;
		type?: 'dataset' | 'file' | 'dataverse';
	} = {}
): Promise<{results: SearchResult[], totalCount: number}> {
	debugLog(`=== 단일 인스턴스 검색 시작 ===`);
	debugLog(`인스턴스 URL: ${instanceUrl}`);
	debugLog(`검색어: ${query}`);
	debugLog(`옵션:`, options);
	
	try {
		const client = new DataverseClient(instanceUrl);
		debugLog(`DataverseClient 생성 완료`);
		
		const searchParams = {
			q: query,
			type: 'dataset' as const,
			sort: 'date' as const,
			per_page: options.per_page || 10,
			start: options.start || 0,
			fq: []
		};
		
		debugLog(`검색 파라미터:`, searchParams);
		debugLog(`API 호출 시작...`);
		
		const response = await client.searchDatasets(searchParams);
		
		debugLog(`API 응답 받음:`, {
			status: response.status,
			hasData: !!response.data,
			dataKeys: response.data ? Object.keys(response.data) : null
		});

		if (response.status !== 'OK') {
			debugError(`API 응답 실패:`, {
				status: response.status,
				message: response.message,
				fullResponse: response
			});
			return { results: [], totalCount: 0 };
		}

		const responseData = response.data as any; // 임시 타입 캐스팅
		
		if (!responseData?.items) {
			debugLog(`응답 데이터 구조 확인:`, responseData);
			throw new Error('응답에서 검색 결과를 찾을 수 없습니다');
		}

		const totalCount = responseData.total_count || responseData.items.length;
		debugLog(`검색 성공: ${totalCount}개 결과 발견`);

		// 상세한 결과 로깅
		if (dev) {
			debugLog(`검색 결과 처리 시작. 총 ${responseData.items.length}개 아이템`);
		}

		const instance = getActiveInstances().find(inst => inst.url === instanceUrl || inst.apiUrl === instanceUrl);
		const instanceInfo = {
			name: instance?.platformName || 'Unknown',
			url: instance?.url || instanceUrl,
			country: instance?.country || 'Unknown'
		};
		
		debugLog(`인스턴스 정보:`, instanceInfo);

		const results = responseData.items.map((item: any, index: number) => {
			debugLog(`아이템 ${index + 1} 처리:`, {
				name: item.name,
				type: item.type,
				hasUrl: !!item.url,
				hasGlobalId: !!item.global_id
			});
			
			return {
				id: item.global_id || item.id || `${instanceUrl}-${index}`,
				title: item.name || 'Untitled',
				url: item.url || '',
				description: item.description || 'No description available',
				type: item.type || 'dataset',
				published_at: item.published_at || '',
				authors: item.authors || [],
				global_id: item.global_id || '',
				instance: instanceInfo.name,
				instanceUrl: instanceInfo.url,
				country: instanceInfo.country,
				persistentId: item.global_id || item.id,
				subjects: item.subjects || []
			};
		});
		
		debugLog(`총 ${results.length}개 결과 반환`, { instanceUrl: instanceInfo.url, totalCount });
		debugLog(`=== 단일 인스턴스 검색 완료 ===`);
		
		return { results, totalCount };
		
	} catch (err) {
		debugError(`단일 인스턴스 검색 오류 - ${instanceUrl}:`, err);
		debugLog(`=== 단일 인스턴스 검색 실패 ===`);
		
		// 오류 유형별 로깅
		if (err instanceof Error) {
			if (err.message.includes('XML') || err.message.includes('HTML')) {
				debugError(`${instanceUrl}: 비JSON 응답 (XML/HTML) - 지원되지 않는 Dataverse 버전이거나 서버 설정 문제`);
			} else if (err.message.includes('JSON')) {
				debugError(`${instanceUrl}: JSON 파싱 오류 - 응답 형식 문제`);
			} else if (err.message.includes('HTTP')) {
				debugError(`${instanceUrl}: HTTP 오류 - 서버 접근 불가`);
			} else {
				debugError(`${instanceUrl}: 알 수 없는 오류 - ${err.message}`);
			}
		}
		
		return { results: [], totalCount: 0 };
	}
}

/**
 * 여러 인스턴스에서 병렬 검색 수행
 */
async function searchMultipleInstances(
	instanceUrls: string[],
	query: string,
	options: {
		per_page?: number;
		start?: number;
		type?: 'dataset' | 'file' | 'dataverse';
		maxConcurrent?: number;
	} = {}
): Promise<{results: SearchResult[], totalCount: number}> {
	debugLog(`=== 다중 인스턴스 검색 시작 ===`);
	debugLog(`인스턴스 개수: ${instanceUrls.length}`);
	debugLog(`인스턴스 URLs:`, instanceUrls);
	
	const { maxConcurrent = 5 } = options;
	const results: SearchResult[] = [];
	let totalCount = 0;
	
	// 인스턴스들을 배치로 나누어 처리
	for (let i = 0; i < instanceUrls.length; i += maxConcurrent) {
		const batch = instanceUrls.slice(i, i + maxConcurrent);
		debugLog(`배치 ${Math.floor(i / maxConcurrent) + 1} 처리: ${batch.length}개 인스턴스`);
		debugLog(`배치 URLs:`, batch);
		
		const batchPromises = batch.map((url, index) => {
			debugLog(`배치 ${Math.floor(i / maxConcurrent) + 1}-${index + 1}: ${url} 검색 시작`);
			return searchSingleInstance(url, query, options);
		});
		
		const batchResults = await Promise.all(batchPromises);
		debugLog(`배치 ${Math.floor(i / maxConcurrent) + 1} 완료:`, batchResults.map(r => r.results.length));
		
		// 배치 결과를 전체 결과에 추가
		for (const batchResult of batchResults) {
			results.push(...batchResult.results);
			totalCount += batchResult.totalCount;
		}
		debugLog(`현재까지 총 결과 개수: ${results.length}, 전체 개수: ${totalCount}`);
	}
	
	// 결과를 관련도순으로 정렬
	const sortedResults = results.sort((a, b) => {
		const aScore = calculateRelevanceScore(a, query);
		const bScore = calculateRelevanceScore(b, query);
		return bScore - aScore;
	});
	
	debugLog(`정렬 후 결과 개수: ${sortedResults.length}`);
	debugLog(`=== 다중 인스턴스 검색 완료 ===`);
	
	return { results: sortedResults, totalCount };
}

/**
 * 간단한 관련도 점수 계산
 */
function calculateRelevanceScore(result: SearchResult, query: string): number {
	const queryLower = query.toLowerCase();
	const titleLower = result.title.toLowerCase();
	const descLower = result.description.toLowerCase();
	
	let score = 0;
	
	// 제목에 쿼리가 포함되면 높은 점수
	if (titleLower.includes(queryLower)) {
		score += 10;
	}
	
	// 설명에 쿼리가 포함되면 중간 점수
	if (descLower.includes(queryLower)) {
		score += 5;
	}
	
	// 단어별 매칭 점수
	const queryWords = queryLower.split(/\s+/);
	queryWords.forEach(word => {
		if (titleLower.includes(word)) score += 3;
		if (descLower.includes(word)) score += 1;
	});
	
	return score;
}

/**
 * SSE 이벤트 생성 헬퍼 함수
 */
function createSSEEvent(event: string, data: any): string {
	const sseData: SSEEvent = {
		event,
		data,
		timestamp: Date.now()
	};
	
	return `event: ${event}\ndata: ${JSON.stringify(sseData.data)}\nid: ${sseData.timestamp}\n\n`;
}

/**
 * SSE를 통한 실시간 검색 수행
 */
async function performSSESearch(
	query: string,
	options: {
		country?: string;
		specific_instance?: any;
		per_page?: number;
		start?: number;
		type?: string;
	},
	sendEvent: (event: string, data: any) => void
): Promise<{results: SearchResult[], totalCount: number}> {
	try {
		sendEvent('search_start', {
			query,
			timestamp: new Date().toISOString(),
			options
		});

		let searchResponse: {results: SearchResult[], totalCount: number} = { results: [], totalCount: 0 };
		
		if (options.specific_instance) {
			// 특정 인스턴스 검색
			sendEvent('instance_search_start', {
				instance: options.specific_instance.platformName,
				url: options.specific_instance.url
			});
			
			searchResponse = await searchSingleInstance(
				options.specific_instance.url,
				query,
				{ per_page: options.per_page, start: options.start, type: options.type as any }
			);
			
			sendEvent('instance_search_complete', {
				instance: options.specific_instance.platformName,
				results_count: searchResponse.results.length,
				total_count: searchResponse.totalCount
			});
			
		} else if (options.country && options.country !== 'all') {
			// 국가별 검색
			const countryInstances = getInstancesByCountry(options.country);
			
			sendEvent('country_search_start', {
				country: options.country,
				instances_count: countryInstances.length,
				instances: countryInstances.map(i => i.platformName)
			});
			
			const instanceUrls = countryInstances.map(inst => inst.url);
			
			// 각 인스턴스별로 검색 진행상황 스트리밍
			const results: SearchResult[] = [];
			let totalCount = 0;
			
			for (let i = 0; i < instanceUrls.length; i++) {
				const instanceUrl = instanceUrls[i];
				const instance = countryInstances[i];
				
				sendEvent('instance_search_start', {
					instance: instance.platformName,
					url: instance.url,
					progress: Math.round(((i + 1) / instanceUrls.length) * 100)
				});
				
				try {
					const instanceResult = await searchSingleInstance(
						instanceUrl,
						query,
						{ per_page: Math.ceil((options.per_page || 10) / instanceUrls.length), start: options.start, type: options.type as any }
					);
					
					results.push(...instanceResult.results);
					totalCount += instanceResult.totalCount;
					
					sendEvent('instance_search_complete', {
						instance: instance.platformName,
						results_count: instanceResult.results.length,
						total_count: instanceResult.totalCount,
						progress: Math.round(((i + 1) / instanceUrls.length) * 100)
					});
					
				} catch (error) {
					sendEvent('instance_search_error', {
						instance: instance.platformName,
						error: error instanceof Error ? error.message : 'Unknown error',
						progress: Math.round(((i + 1) / instanceUrls.length) * 100)
					});
				}
			}
			
			searchResponse = { results, totalCount };
			
		} else {
			// 전역 검색
			const priorityInstances = [
				'https://dataverse.harvard.edu',
				'https://dataverse.nl/',
				'https://dataverse.no/',
				'https://demo.dataverse.org/'
			];
			
			const allInstances = getActiveInstances();
			const instanceUrls = priorityInstances.filter(url => 
				allInstances.some(inst => inst.url === url)
			);
			
			sendEvent('global_search_start', {
				total_instances: instanceUrls.length,
				priority_instances: instanceUrls
			});
			
			searchResponse = await searchMultipleInstances(instanceUrls, query, { 
				per_page: Math.ceil((options.per_page || 10) / instanceUrls.length), 
				start: options.start,
				type: options.type as any,
				maxConcurrent: 4 
			});
		}
		
		// 중복 제거
		const uniqueResults = searchResponse.results.filter((result: SearchResult, index: number, self: SearchResult[]) => 
			index === self.findIndex((r: SearchResult) => r.persistentId === result.persistentId)
		);
		
		sendEvent('search_processing', {
			original_count: searchResponse.results.length,
			unique_count: uniqueResults.length,
			total_count: searchResponse.totalCount
		});
		
		const limitedResults = uniqueResults.slice(0, options.per_page || 10);
		
		sendEvent('search_complete', {
			final_count: limitedResults.length,
			total_count: searchResponse.totalCount,
			query,
			timestamp: new Date().toISOString()
		});
		
		return { results: limitedResults, totalCount: searchResponse.totalCount };
		
	} catch (error) {
		sendEvent('search_error', {
			error: error instanceof Error ? error.message : 'Unknown error',
			query,
			timestamp: new Date().toISOString()
		});
		
		throw error;
	}
}

/**
 * POST 요청 핸들러 - 검색 수행
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		debugLog(`===== 검색 API 요청 시작 =====`);
		
		const body: SearchRequest = await request.json();
		debugLog(`요청 바디:`, body);
		
		// 요청 검증
		if (!body.query || body.query.trim().length === 0) {
			debugError(`검색어 누락`);
			return error(400, '검색어를 입력해주세요.');
		}
		
		const query = body.query.trim();
		const perPage = Math.min(body.per_page || 10, 50); // 최대 50개로 제한
		const start = body.start || 0;
		const type = body.type || 'dataset';
		
		debugLog(`처리된 파라미터:`, {
			query,
			perPage,
			start,
			type,
			instance: body.instance,
			country: body.country
		});
		
		let searchResponse: {results: SearchResult[], totalCount: number} = { results: [], totalCount: 0 };
		
		// 검색 범위 결정
		if (body.specific_instance) {
			// 특정 인스턴스 검색 (직접 지정)
			debugLog(`검색 모드: 특정 인스턴스 (직접 지정)`);
			debugLog(`선택된 인스턴스:`, {
				id: body.specific_instance.id,
				platformName: body.specific_instance.platformName,
				country: body.specific_instance.country,
				url: body.specific_instance.url,
				apiUrl: body.specific_instance.apiUrl
			});
			
			// 실제 인스턴스 URL 사용
			const instanceUrl = body.specific_instance.url;
			searchResponse = await searchSingleInstance(instanceUrl, query, { per_page: perPage, start, type });
			
		} else if (body.instance && body.instance !== 'global') {
			// 특정 인스턴스 검색 (이전 방식)
			debugLog(`검색 모드: 특정 인스턴스 (이전 방식)`);
			debugLog(`선택된 인스턴스: ${body.instance}`);
			searchResponse = await searchSingleInstance(body.instance, query, { per_page: perPage, start, type });
			
		} else if (body.country && body.country !== 'all') {
			// 특정 국가 검색
			debugLog(`검색 모드: 특정 국가`);
			debugLog(`선택된 국가: ${body.country}`);
			
			const countryInstances = getInstancesByCountry(body.country);
			debugLog(`국가별 인스턴스 개수: ${countryInstances.length}`);
			debugLog(`국가별 인스턴스 목록:`, countryInstances.map(i => ({ name: i.platformName, url: i.url })));
			
			const instanceUrls = countryInstances.map(inst => inst.url);
			
			if (instanceUrls.length === 0) {
				debugError(`국가에 해당하는 인스턴스 없음: ${body.country}`);
				return json({
					success: false,
					message: `"${body.country}"에 해당하는 Dataverse 인스턴스를 찾을 수 없습니다.`,
					results: []
				});
			}
			
			searchResponse = await searchMultipleInstances(instanceUrls, query, { 
				per_page: Math.ceil(perPage / instanceUrls.length), 
				start,
				type,
				maxConcurrent: 3 
			});
			
		} else {
			// 전역 검색 (상위 인스턴스 우선)
			debugLog(`검색 모드: 전역 검색`);
			
			const allInstances = getActiveInstances();
			debugLog(`전체 활성 인스턴스 개수: ${allInstances.length}`);
			
			// 우선순위 인스턴스 (빠른 응답을 위해)
			const priorityInstances = [
				'https://dataverse.harvard.edu',
				'https://dataverse.nl/',
				'https://dataverse.no/',
				'https://demo.dataverse.org/'
			];
			
			debugLog(`우선순위 인스턴스 목록:`, priorityInstances);
			
			const instanceUrls = priorityInstances.filter(url => 
				allInstances.some(inst => inst.url === url)
			);
			
			debugLog(`실제 사용 가능한 우선순위 인스턴스:`, instanceUrls);
			debugLog(`사용할 인스턴스 개수: ${instanceUrls.length}`);
			
			if (instanceUrls.length === 0) {
				debugError(`사용 가능한 우선순위 인스턴스가 없음`);
				// 전체 인스턴스 중 처음 5개 사용
				const fallbackUrls = allInstances.slice(0, 5).map(inst => inst.url);
				debugLog(`대체 인스턴스 사용:`, fallbackUrls);
				
				searchResponse = await searchMultipleInstances(fallbackUrls, query, { 
					per_page: Math.ceil(perPage / fallbackUrls.length), 
					start,
					type,
					maxConcurrent: 3 
				});
			} else {
				searchResponse = await searchMultipleInstances(instanceUrls, query, { 
					per_page: Math.ceil(perPage / instanceUrls.length), 
					start,
					type,
					maxConcurrent: 4 
				});
			}
		}
		
		debugLog(`검색 완료 - 원본 결과 개수: ${searchResponse.results.length}`);
		
		// 중복 제거 (동일한 persistentId 기준)
		const uniqueResults = searchResponse.results.filter((result: SearchResult, index: number, self: SearchResult[]) => 
			index === self.findIndex((r: SearchResult) => r.persistentId === result.persistentId)
		);
		
		debugLog(`중복 제거 후: ${uniqueResults.length}개`);
		
		// 결과 제한
		const limitedResults = uniqueResults.slice(0, perPage);
		
		debugLog(`최종 결과: ${limitedResults.length}개`);
		debugLog(`최종 결과 샘플:`, limitedResults.slice(0, 3).map((r: SearchResult) => ({ title: r.title, instance: r.instance })));
		debugLog(`===== 검색 API 요청 완료 =====`);
		
		// 실제 총 결과 수는 API에서 받은 totalCount 사용
		const actualTotal = searchResponse.totalCount;
		
		return json({
			success: true,
			query,
			total: actualTotal,
			results: limitedResults,
			searchStrategy: body.specific_instance ? 'specific_instance' : 
			              body.instance !== 'global' && body.instance ? 'single' : 
			              body.country !== 'all' && body.country ? 'country' : 'global',
			appliedFilters: body.specific_instance ? [`Instance: ${body.specific_instance.platformName}`] : 
			              body.country ? [`Country: ${body.country}`] : [],
			debug: dev ? {
				originalResultCount: searchResponse.results.length,
				uniqueResultCount: uniqueResults.length,
				finalResultCount: limitedResults.length,
				actualTotal: actualTotal,
				searchMode: body.specific_instance ? 'specific_instance' : 
				           body.instance !== 'global' && body.instance ? 'single' : 
				           body.country !== 'all' && body.country ? 'country' : 'global',
				specificInstance: body.specific_instance || null
			} : undefined
		});
		
	} catch (err) {
		debugError('검색 API 최상위 오류:', err);
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		
		return json({
			success: false,
			message: `검색 중 오류가 발생했습니다: ${errorMessage}`,
			results: [],
			debug: dev ? { error: err } : undefined
		}, { status: 500 });
	}
};

/**
 * PUT 요청 핸들러 - SSE 실시간 검색
 */
export const PUT: RequestHandler = async ({ request }) => {
	try {
		debugLog(`===== SSE 검색 요청 시작 =====`);
		
		const body: SearchRequest = await request.json();
		debugLog(`SSE 요청 바디:`, body);
		
		// 요청 검증
		if (!body.query || body.query.trim().length === 0) {
			debugError(`SSE 검색어 누락`);
			return error(400, '검색어를 입력해주세요.');
		}
		
		const query = body.query.trim();
		const perPage = Math.min(body.per_page || 10, 50);
		const start = body.start || 0;
		const type = body.type || 'dataset';
		
		debugLog(`SSE 처리된 파라미터:`, {
			query,
			perPage,
			start,
			type,
			country: body.country,
			specific_instance: body.specific_instance?.platformName
		});
		
		// SSE 응답 스트림 생성
		const encoder = new TextEncoder();
		let isConnectionClosed = false;
		
		const stream = new ReadableStream({
			start(controller) {
				debugLog('SSE 스트림 시작');
				
				// 연결 확인 헬퍼 함수
				const sendEvent = (event: string, data: any) => {
					if (isConnectionClosed) {
						debugLog(`SSE 연결이 닫혀서 이벤트 전송 중단: ${event}`);
						return;
					}
					
					try {
						const sseData = createSSEEvent(event, data);
						debugLog(`SSE 이벤트 전송: ${event}`, data);
						controller.enqueue(encoder.encode(sseData));
					} catch (err) {
						debugError(`SSE 이벤트 전송 실패: ${event}`, err);
						isConnectionClosed = true;
					}
				};
				
				// 연결 시작 이벤트
				sendEvent('connected', {
					message: 'SSE 연결이 설정되었습니다',
					timestamp: new Date().toISOString()
				});
				
				// 실시간 검색 수행
				performSSESearch(query, {
					country: body.country,
					specific_instance: body.specific_instance,
					per_page: perPage,
					start,
					type
				}, sendEvent)
				.then((result) => {
					if (!isConnectionClosed) {
						// 최종 결과 전송
						sendEvent('final_results', {
							success: true,
							query,
							total: result.totalCount,
							results: result.results,
							searchStrategy: body.specific_instance ? 'specific_instance' : 
							              body.country ? 'country' : 'global',
							timestamp: new Date().toISOString()
						});
						
						// 연결 종료
						sendEvent('end', {
							message: '검색이 완료되었습니다',
							timestamp: new Date().toISOString()
						});
						
						debugLog('SSE 검색 완료 및 스트림 종료');
						controller.close();
					}
				})
				.catch((err) => {
					if (!isConnectionClosed) {
						debugError('SSE 검색 오류:', err);
						sendEvent('error', {
							error: err instanceof Error ? err.message : 'Unknown error',
							timestamp: new Date().toISOString()
						});
						
						controller.close();
					}
				});
			},
			
			cancel() {
				debugLog('SSE 클라이언트 연결 해제');
				isConnectionClosed = true;
			}
		});
		
		debugLog('SSE 응답 헤더 설정 및 스트림 반환');
		
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Methods': 'PUT, OPTIONS'
			}
		});
		
	} catch (err) {
		debugError('SSE 검색 최상위 오류:', err);
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		
		return json({
			success: false,
			message: `SSE 검색 중 오류가 발생했습니다: ${errorMessage}`,
			error: dev ? err : undefined
		}, { status: 500 });
	}
};

/**
 * OPTIONS 요청 핸들러 - CORS 지원
 */
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400'
		}
	});
};

/**
 * GET 요청 핸들러 - API 상태 확인
 */
export const GET: RequestHandler = async () => {
	const allInstances = getActiveInstances();
	const stats = {
		totalInstances: allInstances.length,
		countries: Array.from(new Set(allInstances.map(inst => inst.country))),
		supportedTypes: ['dataset', 'file', 'dataverse']
	};
	
	debugLog(`API 상태 확인 요청:`, stats);
	
	return json({
		name: 'Dataverse Search API',
		version: '2.0.0',
		status: 'active',
		capabilities: {
			singleInstance: true,
			countrySearch: true,
			globalSearch: true,
			parallelSearch: true
		},
		statistics: stats,
		timestamp: new Date().toISOString()
	});
}; 