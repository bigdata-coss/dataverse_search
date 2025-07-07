/**
 * Dataverse API 클라이언트 (개선된 버전)
 * 공식 Dataverse API 가이드 기반 구현
 * @see https://guides.dataverse.org/en/latest/api/index.html
 */

import type {
	DataverseSearchParams,
	DataverseSearchResult,
	DataverseFacet,
	DataverseApiResponse,
	DataverseDataset,
	DataverseItem
} from '$lib/types/dataverse.js';

import type { DataverseInstance } from '$lib/data/dataverse-instances.js';
import { getActiveInstances } from '$lib/data/dataverse-instances.js';
import { dev } from '$app/environment';

// 기본 설정
const DEFAULT_INSTANCE = 'https://dataverse.harvard.edu';
const DEFAULT_TIMEOUT = 15000; // 15초로 증가
const MAX_RETRIES = 2;
const DEFAULT_API_VERSION = 'v1';

function debugLog(message: string, data?: any) {
	if (dev) {
		console.log(`[DATAVERSE CLIENT DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
	}
}

function debugError(message: string, error?: any) {
	if (dev) {
		console.error(`[DATAVERSE CLIENT ERROR] ${message}`, error);
	}
}

/**
 * 개선된 Dataverse API 클라이언트
 */
export class DataverseClient {
	private readonly baseUrl: string;
	private readonly apiKey?: string;
	private readonly timeout: number;
	private readonly userAgent: string;

	constructor(instanceUrl?: string, apiKey?: string, timeout = DEFAULT_TIMEOUT) {
		this.baseUrl = instanceUrl?.replace(/\/$/, '') ?? DEFAULT_INSTANCE;
		this.apiKey = apiKey;
		this.timeout = timeout;
		this.userAgent = 'Dataverse-MCP-Server/1.0.0';
		
		debugLog(`DataverseClient 초기화:`, {
			baseUrl: this.baseUrl,
			hasApiKey: !!this.apiKey,
			timeout: this.timeout
		});
	}

	/**
	 * 안전한 fetch 래퍼 (재시도 로직 포함)
	 */
	private async safeFetch<T>(
		endpoint: string,
		options: RequestInit = {},
		retries = MAX_RETRIES
	): Promise<DataverseApiResponse<T>> {
		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				debugLog(`API 요청 시도 ${attempt + 1}/${retries + 1}: ${endpoint}`);
				
				// URL 구성 - 검색 API는 /api/search, 다른 API는 /api/v1/ 사용
				let url: string;
				if (endpoint.startsWith('http')) {
					// 이미 완전한 URL인 경우
					url = endpoint;
				} else if (endpoint.startsWith('/search')) {
					// 검색 API는 /api/search 경로 사용
					url = `${this.baseUrl}/api${endpoint}`;
				} else {
					// 다른 API들은 /api/v1/ 경로 사용
					url = `${this.baseUrl}/api/v1${endpoint}`;
				}
				
				const headers: Record<string, string> = {
					'User-Agent': this.userAgent,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					...(options.headers as Record<string, string> || {})
				};

				// API 키가 있는 경우 헤더에 추가
				if (this.apiKey) {
					headers['X-Dataverse-key'] = this.apiKey;
				}

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), this.timeout);

				debugLog(`요청 URL: ${url}`);
				debugLog(`요청 헤더:`, Object.fromEntries(
					Object.entries(headers).filter(([key]) => key !== 'X-Dataverse-key')
				));

				const response = await fetch(url, {
					...options,
					headers,
					signal: controller.signal
				});

				clearTimeout(timeoutId);

				debugLog(`응답 상태: ${response.status} ${response.statusText}`);

				if (!response.ok) {
					const errorText = await response.text();
					debugError(`HTTP 오류 응답:`, {
						status: response.status,
						statusText: response.statusText,
						body: errorText
					});
					throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
				}

				// Content-Type 확인 및 안전한 JSON 파싱
				const contentType = response.headers.get('content-type') || '';
				debugLog(`응답 Content-Type: ${contentType}`);

				// 모든 응답을 text로 먼저 읽은 후 JSON 파싱 시도
				const responseText = await response.text();
				let data: any;
				
				try {
					// JSON 파싱 시도
					data = JSON.parse(responseText);
					debugLog(`JSON 파싱 성공`);
				} catch (jsonError) {
					debugError(`JSON 파싱 오류:`, jsonError);
					debugError(`응답 Content-Type: ${contentType}`);
					debugError(`응답 내용 (첫 500자):`, responseText.substring(0, 500));
					
					// HTML/XML 응답 확인
					if (responseText.includes('<?xml') || responseText.includes('<!DOCTYPE html') || responseText.includes('<html')) {
						const responseType = responseText.includes('<?xml') ? 'XML' : 'HTML';
						throw new Error(`Server returned ${responseType} instead of JSON. This may indicate an unsupported Dataverse version or server configuration issue.`);
					}
					
					// 그 외의 경우 일반적인 JSON 파싱 오류로 처리
					throw new Error(`Invalid JSON response from Dataverse API. Content-Type: ${contentType}. Error: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`);
				}

				debugLog(`API 응답 받음:`, {
					status: data?.status,
					hasData: !!data?.data,
					dataKeys: data ? Object.keys(data) : null
				});

				return {
					status: data?.status || 'OK',
					data: data?.data || data,
					message: data?.message
				};

			} catch (error) {
				debugError(`시도 ${attempt + 1} 실패:`, error);
				
				if (attempt === retries) {
					debugError(`모든 재시도 실패`);
					return {
						status: 'ERROR',
						data: undefined,
						message: error instanceof Error ? error.message : 'Network error'
					};
				}

				// 재시도 전 잠시 대기
				const delay = Math.pow(2, attempt) * 1000; // 지수 백오프
				debugLog(`${delay}ms 후 재시도`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}

		// 이 부분에 도달하면 안됨
		return {
			status: 'ERROR',
			data: undefined,
			message: 'Unexpected error in safeFetch'
		};
	}

	/**
	 * 데이터셋 검색 - 공식 Dataverse Search API 사용
	 * @see https://guides.dataverse.org/en/latest/api/search.html
	 */
	async searchDatasets(params: DataverseSearchParams): Promise<DataverseApiResponse<DataverseSearchResult>> {
		const searchParams = new URLSearchParams();
		
		// 필수 매개변수
		searchParams.append('q', params.q);
		
		// 선택적 매개변수 - MCP용으로 더 많은 결과 반환
		if (params.type) searchParams.append('type', params.type);
		if (params.sort) searchParams.append('sort', params.sort);
		else searchParams.append('sort', 'date'); // 기본값을 date로 설정
		
		// MCP용으로 더 많은 결과 반환 (기본 50개, 최대 1000개)
		const perPage = Math.min(params.per_page || 50, 1000);
		searchParams.append('per_page', perPage.toString());
		
		if (params.start) searchParams.append('start', params.start.toString());
		if (params.fq) params.fq.forEach(f => searchParams.append('fq', f));
		if (params.subtree) searchParams.append('subtree', params.subtree);
		if (params.order) searchParams.append('order', params.order);
		else searchParams.append('order', 'desc'); // 최신순 기본값
		
		// MCP용으로 facets와 relevance 정보 포함
		searchParams.append('show_relevance', (params.show_relevance ?? true).toString());
		searchParams.append('show_facets', (params.show_facets ?? true).toString());

		// endpoint만 구성 (safeFetch에서 baseUrl과 결합)
		const endpoint = `/search?${searchParams.toString()}`;
		
		if (dev) {
			console.log(`[DATAVERSE CLIENT] 검색 엔드포인트: ${endpoint}`);
			console.log(`[DATAVERSE CLIENT] 검색 파라미터:`, params);
		}
		
		const response = await this.safeFetch(endpoint);
		
		if (dev && response.data) {
			const searchResult = response.data as DataverseSearchResult;
			console.log(`[DATAVERSE CLIENT] 검색 응답:`, {
				status: searchResult.status || 'UNKNOWN',
				total_count: searchResult.data?.total_count || 0,
				count_in_response: searchResult.data?.count_in_response || 0
			});
		}
		
		return response as DataverseApiResponse<DataverseSearchResult>;
	}

	/**
	 * 데이터셋 상세 정보 조회
	 * @see https://guides.dataverse.org/en/latest/api/native-api.html#get-json-representation-of-a-dataset
	 */
	async getDataset(persistentId: string): Promise<DataverseApiResponse<DataverseDataset>> {
		debugLog(`데이터셋 조회: ${persistentId}`);
		const endpoint = `/datasets/:persistentId?persistentId=${encodeURIComponent(persistentId)}`;
		return await this.safeFetch<DataverseDataset>(endpoint);
	}

	/**
	 * 데이터베이스 ID로 데이터셋 조회
	 */
	async getDatasetById(id: number): Promise<DataverseApiResponse<DataverseDataset>> {
		debugLog(`데이터셋 ID로 조회: ${id}`);
		const endpoint = `/datasets/${id}`;
		return await this.safeFetch<DataverseDataset>(endpoint);
	}

	/**
	 * 데이터셋의 파일 목록 조회
	 */
	async getDatasetFiles(persistentId: string): Promise<DataverseApiResponse<any[]>> {
		debugLog(`데이터셋 파일 목록 조회: ${persistentId}`);
		const endpoint = `/datasets/:persistentId/versions/:latest/files?persistentId=${encodeURIComponent(persistentId)}`;
		return await this.safeFetch<any[]>(endpoint);
	}

	/**
	 * 서버 정보 조회
	 */
	async getServerInfo(): Promise<DataverseApiResponse<any>> {
		debugLog(`서버 정보 조회`);
		const endpoint = `/info/server`;
		return await this.safeFetch<any>(endpoint);
	}

	/**
	 * 버전 정보 조회
	 */
	async getVersion(): Promise<DataverseApiResponse<any>> {
		debugLog(`버전 정보 조회`);
		const endpoint = `/info/version`;
		return await this.safeFetch<any>(endpoint);
	}

	/**
	 * 인스턴스 상태 확인
	 */
	async checkHealth(): Promise<boolean> {
		debugLog(`서버 상태 확인`);
		try {
			const response = await this.getVersion();
			const isHealthy = response.status === 'OK';
			debugLog(`서버 상태: ${isHealthy ? '정상' : '비정상'}`);
			return isHealthy;
		} catch (error) {
			debugError(`서버 상태 확인 실패:`, error);
			return false;
		}
	}
}

/**
 * 전 세계 Dataverse 인스턴스 통합 검색 클라이언트
 */
export class MultiDataverseClient {
	private readonly timeout: number;
	private readonly maxConcurrent: number;

	constructor(timeout = DEFAULT_TIMEOUT, maxConcurrent = 8) {
		this.timeout = timeout;
		this.maxConcurrent = maxConcurrent;
	}

	/**
	 * 빠른 인스턴스들에서만 검색 (성능 최적화)
	 */
	async searchFastInstances(
		params: DataverseSearchParams,
		maxInstances = 5
	): Promise<GlobalSearchResult[]> {
		const activeInstances = getActiveInstances()
			.filter(instance => 
				// 빠른 응답을 위해 안정적인 인스턴스들만 선택
				['Harvard', 'Demo', 'Seoul National University', 'DataverseNL'].some(name =>
					instance.organization.includes(name) || instance.platformName.includes(name)
				)
			)
			.slice(0, maxInstances);

		const promises = activeInstances.map(instance => 
			this.searchSingleInstance(instance, params)
		);

		const results = await Promise.allSettled(promises);
		
		return results
			.map((result, index) => {
				const instance = activeInstances[index];
				if (result.status === 'fulfilled' && result.value) {
					return result.value;
				}
				return {
					instance,
					data: [],
					error: result.status === 'rejected' ? result.reason?.message : 'Search failed',
					searchTime: Date.now()
				};
			})
			.filter(Boolean);
	}

	/**
	 * 특정 국가의 Dataverse 인스턴스에서만 검색
	 */
	async searchByCountry(
		country: string,
		params: DataverseSearchParams
	): Promise<GlobalSearchResult[]> {
		const countryInstances = getActiveInstances().filter(
			instance => instance.country.toLowerCase().includes(country.toLowerCase())
		);

		if (countryInstances.length === 0) {
			return [];
		}

		const promises = countryInstances.map(instance => 
			this.searchSingleInstance(instance, params)
		);

		const results = await Promise.allSettled(promises);
		
		return results
			.map((result, index) => {
				const instance = countryInstances[index];
				if (result.status === 'fulfilled' && result.value) {
					return result.value;
				}
				return {
					instance,
					data: [],
					error: result.status === 'rejected' ? result.reason?.message : 'Search failed',
					searchTime: Date.now()
				};
			})
			.filter(Boolean);
	}

	/**
	 * 단일 인스턴스에서 검색
	 */
	private async searchSingleInstance(
		instance: DataverseInstance,
		params: DataverseSearchParams
	): Promise<GlobalSearchResult | null> {
		const startTime = Date.now();
		
		try {
			const client = new DataverseClient(instance.url, undefined, this.timeout);
			const response = await client.searchDatasets(params);
			
			if (response.status === 'OK' && response.data) {
				const searchResult = response.data as DataverseSearchResult;
				const instanceResult = {
					instance,
					data: searchResult.data?.items || [],
					totalCount: searchResult.data?.total_count || 0,
					searchTime: Date.now() - startTime
				};

				return instanceResult;
			} else {
				return {
					instance,
					data: [],
					error: response.message,
					searchTime: Date.now() - startTime
				};
			}
		} catch (error) {
			return {
				instance,
				data: [],
				error: error instanceof Error ? error.message : 'Unknown error',
				searchTime: Date.now() - startTime
			};
		}
	}

	/**
	 * 전 세계 모든 활성 인스턴스에서 검색
	 */
	async searchAllInstances(
		params: DataverseSearchParams
	): Promise<GlobalSearchResult[]> {
		const activeInstances = getActiveInstances();
		const results: GlobalSearchResult[] = [];

		// 배치 단위로 처리하여 동시 요청 수 제한
		for (let i = 0; i < activeInstances.length; i += this.maxConcurrent) {
			const batch = activeInstances.slice(i, i + this.maxConcurrent);
			const batchPromises = batch.map(instance => this.searchSingleInstance(instance, params));
			
			const batchResults = await Promise.allSettled(batchPromises);
			
			for (let j = 0; j < batchResults.length; j++) {
				const result = batchResults[j];
				const instance = batch[j];
				
				if (result.status === 'fulfilled' && result.value) {
					results.push(result.value);
				} else {
					results.push({
						instance,
						data: [],
						error: result.status === 'rejected' ? result.reason?.message : 'Unknown error',
						searchTime: Date.now()
					});
				}
			}

			// 배치 간 짧은 지연으로 서버 부하 방지
			if (i + this.maxConcurrent < activeInstances.length) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}

		return results;
	}
}

// 타입 정의들
export interface GlobalSearchResult {
	readonly instance: DataverseInstance;
	readonly data: DataverseItem[];
	readonly totalCount?: number;
	readonly error?: string;
	readonly searchTime: number;
}

export interface AggregatedSearchResult {
	readonly totalResults: number;
	readonly totalInstances: number;
	readonly successfulInstances: number;
	readonly failedInstances: number;
	readonly results: GlobalSearchResult[];
	readonly averageResponseTime: number;
	readonly fastestInstance?: DataverseInstance;
	readonly slowestInstance?: DataverseInstance;
}

/**
 * 전역 검색 결과 집계
 */
export function aggregateGlobalResults(results: GlobalSearchResult[]): AggregatedSearchResult {
	const successfulResults = results.filter(r => !r.error && r.data.length > 0);
	const failedResults = results.filter(r => r.error || r.data.length === 0);
	
	const totalResults = successfulResults.reduce((sum, r) => sum + r.data.length, 0);
	const responseTimes = results.filter(r => r.searchTime > 0).map(r => r.searchTime);
	const averageResponseTime = responseTimes.length > 0 
		? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
		: 0;

	const fastestInstance = results.reduce((fastest, current) => 
		(!fastest || (current.searchTime > 0 && current.searchTime < fastest.searchTime)) 
			? current : fastest
	, null as GlobalSearchResult | null)?.instance;

	const slowestInstance = results.reduce((slowest, current) => 
		(!slowest || current.searchTime > slowest.searchTime) 
			? current : slowest
	, null as GlobalSearchResult | null)?.instance;

	return {
		totalResults,
		totalInstances: results.length,
		successfulInstances: successfulResults.length,
		failedInstances: failedResults.length,
		results,
		averageResponseTime: Math.round(averageResponseTime),
		fastestInstance,
		slowestInstance
	};
}

/**
 * 검색 결과 포맷팅
 */
export function formatSearchResults(results: DataverseItem[]): string {
	if (!results || results.length === 0) {
		return 'No results found.';
	}

	return results.map((item, index) => `
${index + 1}. ${item.name}
   Type: ${item.type}
   URL: ${item.url || ''}
   Description: ${item.description ? item.description.substring(0, 200) + '...' : 'No description'}
   ${item.authors?.length ? `Authors: ${item.authors.join(', ')}` : ''}
   ${item.published_at ? `Published: ${item.published_at}` : ''}
   ${item.global_id ? `ID: ${item.global_id}` : ''}
`).join('\n');
}

/**
 * 전역 검색 결과 포맷팅
 */
export function formatGlobalSearchResults(aggregatedResult: AggregatedSearchResult): string {
	const { totalResults, totalInstances, successfulInstances, averageResponseTime } = aggregatedResult;
	
	let result = `🌍 Global Dataverse Search Results\n`;
	result += `📊 Summary: ${totalResults} results from ${successfulInstances}/${totalInstances} instances\n`;
	result += `⚡ Average response time: ${averageResponseTime}ms\n\n`;

	if (aggregatedResult.fastestInstance) {
		result += `🚀 Fastest: ${aggregatedResult.fastestInstance.organization}\n`;
	}

	const successfulResults = aggregatedResult.results.filter(r => !r.error && r.data.length > 0);
	
	for (const searchResult of successfulResults.slice(0, 5)) { // 상위 5개만 표시
		result += `\n🏛️ ${searchResult.instance.organization} (${searchResult.data.length} results)\n`;
		result += formatSearchResults(searchResult.data.slice(0, 3)); // 각 인스턴스에서 3개만
	}

	return result.trim();
}

/**
 * 스마트 검색 쿼리 분석기
 * 사용자 입력을 분석해서 최적의 Dataverse 검색 쿼리로 변환
 */
export function analyzeSearchQuery(query: string): {
	optimizedQuery: string;
	suggestedFilters: string[];
	searchStrategy: 'broad' | 'focused' | 'field_specific';
} {
	const lowerQuery = query.toLowerCase();
	const suggestedFilters: string[] = [];
	let optimizedQuery = query;
	let searchStrategy: 'broad' | 'focused' | 'field_specific' = 'broad';

	// 필드별 검색 패턴 감지
	if (query.includes(':')) {
		searchStrategy = 'field_specific';
		return { optimizedQuery, suggestedFilters, searchStrategy };
	}

	// 작성자 검색 감지
	const authorPatterns = [
		/(?:author|by|written by|created by)\s*[:=]\s*([^,]+)/i,
		/^([A-Z][a-z]+,?\s+[A-Z][a-z]+)$/,  // "Smith, John" 패턴
	];
	
	for (const pattern of authorPatterns) {
		const match = query.match(pattern);
		if (match) {
			const authorName = match[1].trim();
			optimizedQuery = `authorName:"${authorName}"`;
			searchStrategy = 'field_specific';
			return { optimizedQuery, suggestedFilters, searchStrategy };
		}
	}

	// 제목 검색 감지
	const titlePatterns = [
		/(?:title|titled|called)\s*[:=]\s*(.+)/i,
		/"([^"]+)"/,  // 따옴표로 감싸진 제목
	];
	
	for (const pattern of titlePatterns) {
		const match = query.match(pattern);
		if (match) {
			const title = match[1].trim();
			optimizedQuery = `title:"${title}"`;
			searchStrategy = 'field_specific';
			return { optimizedQuery, suggestedFilters, searchStrategy };
		}
	}

	// 주제별 키워드 매핑
	const subjectMappings = {
		'health': ['Medicine, Health and Life Sciences'],
		'medicine': ['Medicine, Health and Life Sciences'],
		'medical': ['Medicine, Health and Life Sciences'],
		'biology': ['Life Sciences'],
		'social': ['Social Sciences'],
		'psychology': ['Social Sciences'],
		'economics': ['Social Sciences'],
		'physics': ['Physical Sciences and Mathematics'],
		'chemistry': ['Physical Sciences and Mathematics'],
		'math': ['Physical Sciences and Mathematics'],
		'engineering': ['Engineering'],
		'computer': ['Computer and Information Science'],
		'data': ['Computer and Information Science'],
		'agriculture': ['Agricultural Sciences'],
		'earth': ['Earth and Environmental Sciences'],
		'environment': ['Earth and Environmental Sciences'],
		'climate': ['Earth and Environmental Sciences']
	};

	// 주제 기반 필터 제안
	for (const [keyword, subjects] of Object.entries(subjectMappings)) {
		if (lowerQuery.includes(keyword)) {
			subjects.forEach(subject => {
				suggestedFilters.push(`subject_ss:"${subject}"`);
			});
			searchStrategy = 'focused';
			break;
		}
	}

	// 날짜 패턴 감지
	const yearPattern = /\b(19|20)\d{2}\b/g;
	const years = query.match(yearPattern);
	if (years && years.length > 0) {
		if (years.length === 1) {
			suggestedFilters.push(`publicationDate:${years[0]}`);
		} else if (years.length === 2) {
			const startYear = Math.min(...years.map(Number));
			const endYear = Math.max(...years.map(Number));
			suggestedFilters.push(`publicationDate:[${startYear} TO ${endYear}]`);
		}
		searchStrategy = 'focused';
	}

	// 와일드카드 추가 (부분 매치 개선)
	if (!query.includes('"') && !query.includes('*') && query.split(' ').length === 1) {
		optimizedQuery = `${query}*`;
	}

	return { optimizedQuery, suggestedFilters, searchStrategy };
}

/**
 * 스마트 검색 - 자동으로 쿼리를 분석하고 최적화하여 검색
 */
export async function smartSearch(
	client: DataverseClient,
	query: string,
	options: {
		maxResults?: number;
		includeFiles?: boolean;
		includeFacets?: boolean;
		yearRange?: { start?: number; end?: number };
		subjects?: string[];
	} = {}
): Promise<{
	results: DataverseItem[];
	totalCount: number;
	searchStrategy: string;
	appliedFilters: string[];
	facets?: DataverseFacet[];
	suggestions?: string[];
}> {
	const {
		maxResults = 100,
		includeFiles = false,
		includeFacets = true,
		yearRange,
		subjects = []
	} = options;

	// 쿼리 분석
	const analysis = analyzeSearchQuery(query);
	const appliedFilters = [...analysis.suggestedFilters];

	// 추가 필터 적용
	if (yearRange && yearRange.start && yearRange.end) {
		appliedFilters.push(`publicationDate:[${yearRange.start} TO ${yearRange.end}]`);
	} else if (yearRange && yearRange.start) {
		appliedFilters.push(`publicationDate:[${yearRange.start} TO *]`);
	} else if (yearRange && yearRange.end) {
		appliedFilters.push(`publicationDate:[* TO ${yearRange.end}]`);
	}
	
	if (subjects.length > 0) {
		subjects.forEach(subject => {
			appliedFilters.push(`subject_ss:"${subject}"`);
		});
	}

	// 검색 파라미터 구성
	const searchParams: DataverseSearchParams = {
		q: analysis.optimizedQuery,
		type: includeFiles ? undefined : 'dataset', // 파일 포함 여부
		sort: 'date',
		order: 'desc',
		per_page: Math.min(maxResults, 1000), // Dataverse 최대값
		start: 0,
		fq: appliedFilters.length > 0 ? appliedFilters : undefined,
		show_relevance: true,
		show_facets: includeFacets
	};

	try {
		const response = await client.searchDatasets(searchParams);
		
		if (response.status === 'OK' && response.data) {
			const searchResult = response.data as DataverseSearchResult;
			
			// 검색 제안 생성
			const suggestions: string[] = [];
			if (searchResult.data.spelling_alternatives) {
				Object.entries(searchResult.data.spelling_alternatives).forEach(([original, alternative]) => {
					suggestions.push(`"${original}" 대신 ${alternative}를 시도해보세요`);
				});
			}

			return {
				results: searchResult.data.items || [],
				totalCount: searchResult.data.total_count || 0,
				searchStrategy: analysis.searchStrategy,
				appliedFilters,
				facets: searchResult.data.facets,
				suggestions
			};
		} else {
			return {
				results: [],
				totalCount: 0,
				searchStrategy: analysis.searchStrategy,
				appliedFilters,
				suggestions: ['검색 결과를 가져올 수 없습니다.']
			};
		}
	} catch (error) {
		throw new Error(`스마트 검색 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
	}
}

/**
 * Pagination을 지원하는 대량 검색
 */
export async function paginatedSearch(
	client: DataverseClient,
	query: string,
	options: {
		totalLimit?: number;
		pageSize?: number;
		filters?: string[];
	} = {}
): Promise<{
	allResults: DataverseItem[];
	totalFound: number;
	pagesSearched: number;
	searchTime: number;
}> {
	const startTime = Date.now();
	const {
		totalLimit = 200, // MCP용 기본값
		pageSize = 50,
		filters = []
	} = options;

	const allResults: DataverseItem[] = [];
	let pagesSearched = 0;
	let totalFound = 0;
	let start = 0;

	while (allResults.length < totalLimit) {
		const searchParams: DataverseSearchParams = {
			q: query,
			type: 'dataset',
			sort: 'date',
			order: 'desc',
			per_page: Math.min(pageSize, totalLimit - allResults.length),
			start,
			fq: filters.length > 0 ? filters : undefined,
			show_relevance: true,
			show_facets: false // pagination에서는 facets 제외
		};

		try {
			const response = await client.searchDatasets(searchParams);
			
			if (response.status === 'OK' && response.data) {
				const searchResult = response.data as DataverseSearchResult;
				const pageResults = searchResult.data.items || [];
				
				if (pagesSearched === 0) {
					totalFound = searchResult.data.total_count || 0;
				}
				
				if (pageResults.length === 0) {
					break; // 더 이상 결과가 없음
				}
				
				allResults.push(...pageResults);
				pagesSearched++;
				start += pageSize;
				
				// 모든 결과를 가져왔거나 더 이상 결과가 없으면 중단
				if (pageResults.length < pageSize || start >= totalFound) {
					break;
				}
			} else {
				break;
			}
		} catch (error) {
			console.warn(`페이지 ${pagesSearched + 1} 검색 실패:`, error);
			break;
		}
	}

	return {
		allResults,
		totalFound,
		pagesSearched,
		searchTime: Date.now() - startTime
	};
}

/**
 * MCP용 향상된 검색 결과 포맷팅
 */
export function formatEnhancedResults(
	results: DataverseItem[],
	searchInfo: {
		totalCount: number;
		searchStrategy: string;
		appliedFilters: string[];
		searchTime?: number;
		suggestions?: string[];
	}
): string {
	const { totalCount, searchStrategy, appliedFilters, searchTime, suggestions } = searchInfo;
	
	let output = `🔍 **향상된 Dataverse 검색 결과**\n`;
	output += `═══════════════════════════════════════\n\n`;
	
	// 검색 정보
	output += `📊 **검색 통계**\n`;
	output += `• 총 발견: **${totalCount.toLocaleString()}**개 결과\n`;
	output += `• 표시: **${results.length}**개\n`;
	output += `• 전략: **${searchStrategy}** 검색\n`;
	if (searchTime) {
		output += `• 소요시간: **${searchTime}ms**\n`;
	}
	
	if (appliedFilters.length > 0) {
		output += `• 적용된 필터: ${appliedFilters.length}개\n`;
		appliedFilters.forEach(filter => {
			output += `  - ${filter}\n`;
		});
	}
	output += `\n`;

	// 검색 제안
	if (suggestions && suggestions.length > 0) {
		output += `💡 **검색 제안**\n`;
		suggestions.forEach(suggestion => {
			output += `• ${suggestion}\n`;
		});
		output += `\n`;
	}

	// 검색 결과
	if (results.length === 0) {
		output += `❌ **검색 결과가 없습니다**\n`;
		output += `다른 키워드를 시도하거나 필터를 조정해보세요.\n`;
		return output;
	}

	output += `📋 **검색 결과**\n`;
	output += `${'-'.repeat(50)}\n\n`;

	results.forEach((item, index) => {
		output += `**${index + 1}. ${item.name}**\n`;
		output += `   🏷️ 타입: ${item.type}\n`;
		if (item.authors && item.authors.length > 0) {
			output += `   👤 저자: ${item.authors.slice(0, 3).join(', ')}${item.authors.length > 3 ? '...' : ''}\n`;
		}
		if (item.subjects && item.subjects.length > 0) {
			output += `   📚 주제: ${item.subjects.slice(0, 2).join(', ')}\n`;
		}
		if (item.published_at) {
			output += `   📅 발행일: ${new Date(item.published_at).getFullYear()}\n`;
		}
		if (item.description) {
			const desc = item.description.length > 150 
				? item.description.substring(0, 150) + '...' 
				: item.description;
			output += `   📝 설명: ${desc}\n`;
		}
		if (item.global_id) {
			output += `   🔗 DOI: ${item.global_id}\n`;
		}
		if (item.url) {
			output += `   🌐 URL: ${item.url}\n`;
		}
		output += `\n`;
	});

	// 추가 결과 안내
	if (totalCount > results.length) {
		const remaining = totalCount - results.length;
		output += `📌 **${remaining.toLocaleString()}개의 추가 결과가 있습니다**\n`;
		output += `더 많은 결과를 보려면 pagination 매개변수를 사용하거나 필터를 조정하세요.\n`;
	}

	return output;
}

// 기본 클라이언트 인스턴스들
export const defaultDataverseClient = new DataverseClient();
export const globalDataverseClient = new MultiDataverseClient();
