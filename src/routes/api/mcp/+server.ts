/**
 * Dataverse MCP Server API Endpoint
 * 기존 검색 API를 활용하는 MCP 서버
 */

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getActiveInstances, getInstancesByCountry, getInstanceStats } from '$lib/data/dataverse-instances.js';
import { dev } from '$app/environment';

// MCP 서버 설정
const MCP_SERVER_NAME = 'global-dataverse-mcp';
const MCP_SERVER_VERSION = '2.0.0';
const MCP_SERVER_DESCRIPTION = 'AI-powered global Dataverse search and analysis platform';

/**
 * 기존 API 검색 결과를 MCP 형태로 포맷팅
 */
function formatSearchResultsForMCP(data: any, query: string, searchType: string): string {
	if (!data.success || !data.results || data.results.length === 0) {
		return `🔍 "${query}" 검색 결과가 없습니다.\n\n💡 다른 키워드를 시도해보세요.`;
	}

	let resultText = `🔍 ${searchType} 검색 결과\n`;
	resultText += `=====================\n`;
	resultText += `검색어: "${query}"\n`;
	resultText += `총 결과: ${data.total?.toLocaleString() || data.results.length}개\n`;
	resultText += `표시: ${data.results.length}개\n\n`;

	data.results.forEach((item: any, index: number) => {
		resultText += `${index + 1}. **${item.title || item.name || 'Untitled'}**\n`;
		resultText += `   🏷️ 타입: ${item.type || 'dataset'}\n`;
		
		if (item.authors && item.authors.length > 0) {
			resultText += `   👤 저자: ${item.authors.slice(0, 3).join(', ')}${item.authors.length > 3 ? '...' : ''}\n`;
		}
		
		if (item.published_at || item.publishedAt) {
			resultText += `   📅 발행일: ${new Date(item.published_at || item.publishedAt).getFullYear()}\n`;
		}
		
		if (item.description) {
			const desc = item.description.length > 150 
				? item.description.substring(0, 150) + '...' 
				: item.description;
			resultText += `   📝 설명: ${desc}\n`;
		}
		
		if (item.instance) {
			resultText += `   🏛️ 인스턴스: ${item.instance}\n`;
		}
		
		if (item.url) {
			resultText += `   🌐 URL: ${item.url}\n`;
		}
		
		resultText += `\n`;
	});

	// 검색 메타데이터 추가
	if (data.searchStrategy) {
		resultText += `\n🎯 검색 전략: ${data.searchStrategy}\n`;
	}
	
	if (data.searchTime) {
		resultText += `⏱️ 검색 시간: ${(data.searchTime * 1000).toFixed(0)}ms\n`;
	}

	if (data.suggestions && data.suggestions.length > 0) {
		resultText += `\n💡 추가 검색 제안:\n`;
		data.suggestions.forEach((suggestion: string) => {
			resultText += `• "${suggestion}"\n`;
		});
	}

	return resultText;
}

/**
 * GET 요청 핸들러 - MCP 서버 정보
 */
export const GET: RequestHandler = async () => {
	const stats = getInstanceStats();
	
	return json({
		name: MCP_SERVER_NAME,
		version: MCP_SERVER_VERSION,
		description: MCP_SERVER_DESCRIPTION,
		status: 'active',
		instances: {
			total: stats.total,
			active: stats.active,
			countries: stats.countriesCount
		},
		capabilities: ['search-datasets', 'search-global-dataverse', 'search-by-country', 'get-dataset-info', 'list-dataverse-instances'],
		endpoints: {
			mcp: '/api/mcp',
			search: '/api/mcp/search'
		}
	});
};

/**
 * POST 요청 핸들러 - MCP 서버 엔드포인트
 */
export const POST: RequestHandler = async ({ request }) => {
	let body: any;
	
	try {
		body = await request.json();
		
		if (dev) {
			console.log('🔧 [MCP] 수신된 요청:', JSON.stringify(body, null, 2));
		}
		
		// JSON-RPC 2.0 스펙 검증
		if (!body.jsonrpc || body.jsonrpc !== '2.0') {
			return json({
				jsonrpc: '2.0',
				id: body.id || null,
				error: {
					code: -32600,
					message: 'Invalid Request: missing or invalid jsonrpc field'
				}
			});
		}

		if (!body.method) {
			return json({
				jsonrpc: '2.0',
				id: body.id || null,
				error: {
					code: -32600,
					message: 'Invalid Request: missing method field'
				}
			});
		}

		// MCP 프로토콜 메시지 처리
		switch (body.method) {
			case 'initialize': {
				const initializeResult = {
					protocolVersion: '2024-11-05',
					serverInfo: {
						name: MCP_SERVER_NAME,
						version: MCP_SERVER_VERSION
					},
					capabilities: {
						tools: {},
						resources: {},
						logging: {}
					}
				};

				if (dev) {
					console.log('🔧 [MCP] Initialize 응답:', JSON.stringify(initializeResult, null, 2));
				}

				return json({
					jsonrpc: '2.0',
					id: body.id,
					result: initializeResult
				});
			}

			case 'notifications/initialized': {
				// notifications는 응답이 필요 없음
				return new Response(null, { status: 200 });
			}

			case 'tools/list': {
				const toolsListResult = {
					tools: [
						{
							name: 'search-datasets',
							description: 'Dataverse에서 데이터셋을 검색합니다.',
							inputSchema: {
								type: 'object',
								properties: {
									query: {
										type: 'string',
										description: '검색할 키워드나 문구'
									},
									instance_url: {
										type: 'string',
										format: 'uri',
										description: '특정 Dataverse 인스턴스 URL'
									},
									type: {
										type: 'string',
										enum: ['dataset', 'file', 'dataverse'],
										description: '검색 대상 타입'
									},
									per_page: {
										type: 'number',
										minimum: 1,
										maximum: 100,
										default: 20,
										description: '페이지당 결과 수'
									}
								},
								required: ['query']
							}
						},
						{
							name: 'search-global-dataverse',
							description: '전 세계 모든 활성 Dataverse 인스턴스에서 동시에 검색합니다.',
							inputSchema: {
								type: 'object',
								properties: {
									query: {
										type: 'string',
										description: '검색할 키워드나 문구'
									},
									type: {
										type: 'string',
										enum: ['dataset', 'file', 'dataverse'],
										description: '검색 대상 타입'
									},
									per_page: {
										type: 'number',
										minimum: 1,
										maximum: 50,
										default: 10,
										description: '인스턴스당 결과 수'
									}
								},
								required: ['query']
							}
						},
						{
							name: 'search-by-country',
							description: '특정 국가의 Dataverse 인스턴스에서만 검색합니다.',
							inputSchema: {
								type: 'object',
								properties: {
									query: {
										type: 'string',
										description: '검색할 키워드나 문구'
									},
									country: {
										type: 'string',
										description: '검색할 국가명 (예: USA, South Korea, Germany)'
									},
									type: {
										type: 'string',
										enum: ['dataset', 'file', 'dataverse'],
										description: '검색 대상 타입'
									},
									per_page: {
										type: 'number',
										minimum: 1,
										maximum: 50,
										default: 10,
										description: '인스턴스당 결과 수'
									}
								},
								required: ['query', 'country']
							}
						},
						{
							name: 'get-dataset-info',
							description: '특정 데이터셋의 상세 정보를 가져옵니다.',
							inputSchema: {
								type: 'object',
								properties: {
									persistent_id: {
										type: 'string',
										description: '데이터셋의 DOI 또는 Handle'
									},
									instance_url: {
										type: 'string',
										format: 'uri',
										description: 'Dataverse 인스턴스 URL'
									}
								},
								required: ['persistent_id']
							}
						},
						{
							name: 'list-dataverse-instances',
							description: '사용 가능한 모든 Dataverse 인스턴스 목록을 가져옵니다.',
							inputSchema: {
								type: 'object',
								properties: {
									country: {
										type: 'string',
										description: '특정 국가로 필터링 (선택사항)'
									}
								}
							}
						}
					]
				};

				return json({
					jsonrpc: '2.0',
					id: body.id,
					result: toolsListResult
				});
			}

			case 'tools/call': {
				const { name: toolName, arguments: toolArgs } = body.params || {};

				if (!toolName) {
					return json({
						jsonrpc: '2.0',
						id: body.id,
						error: {
							code: -32602,
							message: 'Invalid params: missing tool name'
						}
					});
				}

				// 도구 실행 로직
				try {
					let toolResult: any;

					switch (toolName) {
						case 'search-datasets': {
							const { query, instance_url, type, per_page } = toolArgs || {};
							
							if (!query) {
								return json({
									jsonrpc: '2.0',
									id: body.id,
									error: {
										code: -32602,
										message: 'Invalid params: query is required'
									}
								});
							}

							// 기존 API 호출로 변경
							const requestBody: any = {
								query,
								per_page: per_page || 20,
								start: 0,
								sort: 'date',
								order: 'desc',
								include_files: type === 'file'
							};

							// 특정 인스턴스 지정
							if (instance_url) {
								const instance = getActiveInstances().find(inst => inst.url === instance_url);
								if (instance) {
									requestBody.specific_instance = {
										id: instance.id,
										url: instance.url,
										apiUrl: instance.apiUrl,
										platformName: instance.platformName,
										country: instance.country,
										organization: instance.organization
									};
								}
							}

							const url = new URL(request.url);
							const apiUrl = `${url.origin}/api/mcp/search`;
							
							const response = await fetch(apiUrl, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(requestBody)
							});

							if (!response.ok) {
								throw new Error(`Search API error: ${response.status}`);
							}

							const data = await response.json();
							const formattedText = formatSearchResultsForMCP(data, query, `특정 인스턴스 (${instance_url || 'Harvard Dataverse'})`);

							toolResult = {
								content: [{
									type: 'text',
									text: formattedText
								}]
							};
							break;
						}

						case 'search-global-dataverse': {
							const { query, type, per_page } = toolArgs || {};
							
							if (!query) {
								return json({
									jsonrpc: '2.0',
									id: body.id,
									error: {
										code: -32602,
										message: 'Invalid params: query is required'
									}
								});
							}

							// 기존 API 호출로 변경 (전역 검색)
							const requestBody: any = {
								query,
								per_page: per_page || 10,
								start: 0,
								sort: 'date',
								order: 'desc',
								include_files: type === 'file'
								// country를 지정하지 않으면 전역 검색
							};

							const url = new URL(request.url);
							const apiUrl = `${url.origin}/api/mcp/search`;
							
							const response = await fetch(apiUrl, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(requestBody)
							});

							if (!response.ok) {
								throw new Error(`Search API error: ${response.status}`);
							}

							const data = await response.json();
							const formattedText = formatSearchResultsForMCP(data, query, '전역 검색');

							toolResult = {
								content: [{
									type: 'text',
									text: formattedText
								}]
							};
							break;
						}

						case 'search-by-country': {
							const { query, country, type, per_page } = toolArgs || {};
							
							if (!query || !country) {
								return json({
									jsonrpc: '2.0',
									id: body.id,
									error: {
										code: -32602,
										message: 'Invalid params: query and country are required'
									}
								});
							}

							// 기존 API 호출로 변경 (국가별 검색)
							const requestBody: any = {
								query,
								country,
								per_page: per_page || 10,
								start: 0,
								sort: 'date',
								order: 'desc',
								include_files: type === 'file'
							};

							const url = new URL(request.url);
							const apiUrl = `${url.origin}/api/mcp/search`;
							
							const response = await fetch(apiUrl, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(requestBody)
							});

							if (!response.ok) {
								throw new Error(`Search API error: ${response.status}`);
							}

							const data = await response.json();
							const formattedText = formatSearchResultsForMCP(data, query, `국가별 검색 (${country})`);

							toolResult = {
								content: [{
									type: 'text',
									text: formattedText
								}]
							};
							break;
						}

						case 'get-dataset-info': {
							const { persistent_id, instance_url } = toolArgs || {};
							
							if (!persistent_id) {
								return json({
									jsonrpc: '2.0',
									id: body.id,
									error: {
										code: -32602,
										message: 'Invalid params: persistent_id is required'
									}
								});
							}

							// 기존 API를 사용해서 DOI로 검색
							const requestBody: any = {
								query: persistent_id,
								per_page: 1,
								start: 0,
								sort: 'date',
								order: 'desc'
							};

							// 특정 인스턴스 지정
							if (instance_url) {
								const instance = getActiveInstances().find(inst => inst.url === instance_url);
								if (instance) {
									requestBody.specific_instance = {
										id: instance.id,
										url: instance.url,
										apiUrl: instance.apiUrl,
										platformName: instance.platformName,
										country: instance.country,
										organization: instance.organization
									};
								}
							}

							const url = new URL(request.url);
							const apiUrl = `${url.origin}/api/mcp/search`;
							
							try {
								const response = await fetch(apiUrl, {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify(requestBody)
								});

								if (!response.ok) {
									throw new Error(`Search API error: ${response.status}`);
								}

								const data = await response.json();
								
								if (data.success && data.results && data.results.length > 0) {
									const dataset = data.results[0]; // 첫 번째 결과 사용

									let resultText = `📊 데이터셋 상세 정보\n`;
									resultText += `====================\n\n`;
									resultText += `🆔 **영구 ID**: ${persistent_id}\n`;
									resultText += `🏷️ **제목**: ${dataset.title || 'N/A'}\n`;
									
									if (dataset.authors && dataset.authors.length > 0) {
										resultText += `👤 **저자**: ${dataset.authors.join(', ')}\n`;
									}
									
									if (dataset.description) {
										const desc = dataset.description.length > 200 
											? dataset.description.substring(0, 200) + '...' 
											: dataset.description;
										resultText += `📝 **설명**: ${desc}\n`;
									}
									
									if (dataset.publishedAt || dataset.published_at) {
										resultText += `📅 **발행일**: ${new Date(dataset.publishedAt || dataset.published_at).toLocaleDateString('ko-KR')}\n`;
									}
									
									if (dataset.subjects && dataset.subjects.length > 0) {
										resultText += `🏷️ **주제**: ${dataset.subjects.join(', ')}\n`;
									}
									
									if (dataset.instance) {
										resultText += `🏛️ **인스턴스**: ${dataset.instance}\n`;
									}
									
									if (dataset.url) {
										resultText += `🔗 **URL**: ${dataset.url}\n`;
									}

									toolResult = {
										content: [{
											type: 'text',
											text: resultText
										}]
									};
								} else {
									toolResult = {
										content: [{
											type: 'text',
											text: `데이터셋 정보를 찾을 수 없습니다: ${persistent_id}`
										}]
									};
								}
							} catch (err) {
								const errorMessage = err instanceof Error ? err.message : 'Unknown error';
								toolResult = {
									content: [{
										type: 'text',
										text: `데이터셋 정보 조회 실패: ${errorMessage}`
									}],
									isError: true
								};
							}
							break;
						}

						case 'list-dataverse-instances': {
							const { country } = toolArgs || {};
							
							const instances = country ? getInstancesByCountry(country) : getActiveInstances();
							const stats = getInstanceStats();
							
							let resultText = `🌍 Dataverse 인스턴스 목록\n`;
							resultText += `============================\n\n`;
							resultText += `📊 통계:\n`;
							resultText += `• 전체 인스턴스: ${stats.total}개\n`;
							resultText += `• 활성 인스턴스: ${stats.active}개\n`;
							resultText += `• 지원 국가: ${stats.countriesCount}개\n\n`;
							
							if (country) {
								resultText += `🇰🇷 "${country}" 인스턴스 (${instances.length}개):\n`;
							} else {
								resultText += `🌐 모든 활성 인스턴스 (${instances.length}개):\n`;
							}
							
							resultText += `${'-'.repeat(50)}\n\n`;
							
							instances.forEach((instance, index) => {
								resultText += `${index + 1}. **${instance.platformName}**\n`;
								resultText += `   🏛️ 기관: ${instance.organization}\n`;
								resultText += `   🌍 국가: ${instance.country}\n`;
								resultText += `   🌐 URL: ${instance.url}\n`;
								if (instance.apiUrl) {
									resultText += `   🔗 API: ${instance.apiUrl}\n`;
								}
								resultText += `\n`;
							});

							toolResult = {
								content: [{
									type: 'text',
									text: resultText
								}]
							};
							break;
						}

						default:
							return json({
								jsonrpc: '2.0',
								id: body.id,
								error: {
									code: -32601,
									message: `Method not found: ${toolName}`
								}
							});
					}

					return json({
						jsonrpc: '2.0',
						id: body.id,
						result: toolResult
					});

				} catch (err) {
					console.error(`도구 실행 오류 [${toolName}]:`, err);
					const errorMessage = err instanceof Error ? err.message : 'Unknown error';
					
					return json({
						jsonrpc: '2.0',
						id: body.id,
						error: {
							code: -32603,
							message: `Tool execution failed: ${errorMessage}`
						}
					});
				}
			}

			default:
				return json({
					jsonrpc: '2.0',
					id: body.id || null,
					error: {
						code: -32601,
						message: `Method not found: ${body.method}`
					}
				});
		}

	} catch (err) {
		console.error('MCP 서버 오류:', err);
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		
		return json({
			jsonrpc: '2.0',
			id: body?.id || null,
			error: {
				code: -32603,
				message: `Internal error: ${errorMessage}`
			}
		});
	}
};