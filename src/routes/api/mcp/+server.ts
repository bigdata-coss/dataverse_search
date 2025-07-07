/**
 * Dataverse MCP Server API Endpoint (개선된 버전)
 * 공식 Dataverse API 가이드 기반 구현
 * @see https://guides.dataverse.org/en/latest/api/index.html
 */

import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type { CallToolResult, ListResourcesResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { 
	DataverseClient,
	MultiDataverseClient,
	smartSearch,
	paginatedSearch,
	aggregateGlobalResults,
	formatSearchResults
} from '$lib/api/dataverse.js';
import type { DataverseSearchResult } from '$lib/types/dataverse.js';
import { getActiveInstances, getInstancesByCountry, getInstanceStats } from '$lib/data/dataverse-instances.js';
import { dev } from '$app/environment';

// MCP 서버 설정
const MCP_SERVER_NAME = 'global-dataverse-mcp';
const MCP_SERVER_VERSION = '2.0.0';
const MCP_SERVER_DESCRIPTION = 'AI-powered global Dataverse search and analysis platform';

// Global Multi-Dataverse Client 인스턴스 생성
const globalDataverseClient = new MultiDataverseClient();

/**
 * MCP 서버 인스턴스 생성 (개선된 버전)
 */
function createMcpServer(): McpServer {
	const server = new McpServer(
		{
			name: MCP_SERVER_NAME,
			version: MCP_SERVER_VERSION,
		},
		{ 
			capabilities: { 
				tools: {},
				resources: {},
				logging: {}
			} 
		}
	);

	// === SEARCH TOOLS ===

	// 1. 기본 데이터셋 검색 도구
	server.tool(
		'search-datasets',
		'Dataverse에서 데이터셋을 검색합니다. 공식 Search API를 사용합니다.',
		{
			query: z.string().min(1).describe('검색할 키워드나 문구'),
			instance_url: z.string().url().optional().describe('특정 Dataverse 인스턴스 URL'),
			type: z.enum(['dataset', 'file', 'dataverse']).optional().describe('검색 대상 타입'),
			sort: z.enum(['name', 'date']).optional().describe('정렬 기준'),
			per_page: z.number().min(1).max(100).optional().describe('페이지당 결과 수').default(20),
			start: z.number().min(0).optional().describe('시작 인덱스'),
			fq: z.array(z.string()).optional().describe('필터 쿼리 배열')
		},
		async ({ query, instance_url, type, sort, per_page, start, fq }): Promise<CallToolResult> => {
			try {
				const client = new DataverseClient(instance_url);
				const searchParams = {
					q: query,
					type,
					sort,
					per_page,
					start,
					fq
				};

				const response = await client.searchDatasets(searchParams);
				
				const data = response.data;
				if (data) {
					const searchResult = data as DataverseSearchResult;
					const results = searchResult.data?.items || [];
					const totalCount = searchResult.data?.total_count || 0;

					const resultText = `
🔍 Dataverse 검색 결과
=====================
검색어: "${query}"
인스턴스: ${instance_url || 'https://dataverse.harvard.edu'}
총 결과: ${totalCount}개
표시: ${results.length}개

${formatSearchResults(results)}

---
모든 결과를 보려면 웹 인터페이스를 사용하세요: ${instance_url || 'https://dataverse.harvard.edu'}/dataverse
`;

					return {
						content: [{
							type: 'text',
							text: resultText
						}]
					};
				} else {
					return {
						content: [{
							type: 'text', 
							text: '검색 결과를 가져올 수 없습니다.'
						}]
					};
				}
			} catch (err) {
				console.error('검색 오류:', err);
				return {
					content: [{
						type: 'text',
						text: `검색 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
					}],
					isError: true
				};
			}
		}
	);

	// 2. 전 세계 통합 검색 도구
	server.tool(
		'search-global-dataverse',
		'전 세계 모든 활성 Dataverse 인스턴스에서 동시에 검색합니다.',
		{
			query: z.string().min(1).describe('검색할 키워드나 문구'),
			max_instances: z.number().min(1).max(10).optional().describe('검색할 최대 인스턴스 수').default(5),
			type: z.enum(['dataset', 'file', 'dataverse']).optional().describe('검색 대상 타입'),
			per_page: z.number().min(1).max(50).optional().describe('인스턴스당 결과 수').default(10)
		},
		async ({ query, max_instances, type, per_page }): Promise<CallToolResult> => {
			try {
				const searchParams = { q: query, type, per_page };
				const results = await globalDataverseClient.searchFastInstances(searchParams, max_instances);
				const aggregated = aggregateGlobalResults(results);
				const formattedText = formatGlobalSearchResults(aggregated);

				return {
					content: [{
						type: 'text',
						text: formattedText
					}]
				};
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				return {
					content: [{
						type: 'text',
						text: `전역 검색 실패: ${errorMessage}`
					}],
					isError: true
				};
			}
		}
	);

	// 3. 국가별 검색 도구
	server.tool(
		'search-by-country',
		'특정 국가의 Dataverse 인스턴스에서만 검색합니다.',
		{
			query: z.string().min(1).describe('검색할 키워드나 문구'),
			country: z.string().min(2).describe('검색할 국가명 (예: USA, South Korea, Germany)'),
			type: z.enum(['dataset', 'file', 'dataverse']).optional().describe('검색 대상 타입'),
			per_page: z.number().min(1).max(50).optional().describe('인스턴스당 결과 수').default(10)
		},
		async ({ query, country, type, per_page }): Promise<CallToolResult> => {
			try {
				const searchParams = { q: query, type, per_page };
				const results = await globalDataverseClient.searchByCountry(country, searchParams);
				
				if (results.length === 0) {
					return {
						content: [{
							type: 'text',
							text: `"${country}"에 해당하는 활성 Dataverse 인스턴스를 찾을 수 없습니다.`
						}]
					};
				}

				const aggregated = aggregateGlobalResults(results);
				const formattedText = formatGlobalSearchResults(aggregated);

				return {
					content: [{
						type: 'text',
						text: formattedText
					}]
				};
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				return {
					content: [{
						type: 'text',
						text: `국가별 검색 실패: ${errorMessage}`
					}],
					isError: true
				};
			}
		}
	);

	// 4. 데이터셋 상세 정보 조회 도구
	server.tool(
		'get-dataset-info',
		'특정 데이터셋의 상세 정보를 조회합니다. DOI 또는 Handle을 사용합니다.',
		{
			persistent_id: z.string().min(1).describe('데이터셋의 Persistent ID (DOI 또는 Handle)'),
			instance_url: z.string().url().optional().describe('조회할 Dataverse 인스턴스 URL')
		},
		async ({ persistent_id, instance_url }): Promise<CallToolResult> => {
			try {
				const client = new DataverseClient(instance_url);
				const response = await client.getDataset(persistent_id);

				if (response.status !== 'OK') {
					return {
						content: [{
							type: 'text',
							text: `데이터셋 조회 실패: ${response.message || 'Unknown error'}`
						}],
						isError: true
					};
				}

				const dataset = response.data;
				const latestVersion = dataset?.latest_version;

				if (!latestVersion) {
					return {
						content: [{
							type: 'text',
							text: '데이터셋 정보를 찾을 수 없습니다.'
						}],
						isError: true
					};
				}

				// 메타데이터 추출
				const citation = latestVersion.metadata_blocks?.citation;
				const fields = citation?.fields || [];
				
				const title = fields.find((f: any) => f.type_name === 'title')?.value || 'Untitled';
				const authorsField = fields.find((f: any) => f.type_name === 'author')?.value || [];
				const descriptionField = fields.find((f: any) => f.type_name === 'dsDescription')?.value || [];
				
				const authors = Array.isArray(authorsField) ? authorsField : [];
				const description = Array.isArray(descriptionField) ? descriptionField : [];

				const resultText = `
📊 데이터셋 상세 정보
===================
제목: ${title}
Persistent ID: ${dataset.persistent_id}
상태: ${latestVersion.version_state}
버전: ${latestVersion.version_number || 'Draft'}.${latestVersion.version_minor_number || 0}
파일 수: ${latestVersion.file_count || 0}개
용량: ${formatBytes(latestVersion.size_in_bytes || 0)}
생성일: ${latestVersion.create_time ? new Date(latestVersion.create_time).toLocaleDateString() : 'N/A'}
마지막 업데이트: ${latestVersion.last_update_time ? new Date(latestVersion.last_update_time).toLocaleDateString() : 'N/A'}
${latestVersion.release_time ? `발행일: ${new Date(latestVersion.release_time).toLocaleDateString()}` : ''}

${authors.length > 0 ? `저자:\n${authors.map((author: any) => `  - ${author.authorName?.value || 'Unknown'}`).join('\n')}` : ''}

${description.length > 0 ? `설명:\n${typeof description[0] === 'string' ? description[0] : 'No description'}` : ''}

URL: ${instance_url || 'https://dataverse.harvard.edu'}/dataset.xhtml?persistentId=${encodeURIComponent(persistent_id)}
				`.trim();

				return {
					content: [{
						type: 'text',
						text: resultText
					}]
				};
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				return {
					content: [{
						type: 'text',
						text: `데이터셋 정보 조회 실패: ${errorMessage}`
					}],
					isError: true
				};
			}
		}
	);

	// 5. 데이터셋 파일 목록 조회 도구
	server.tool(
		'get-dataset-files',
		'데이터셋에 포함된 파일 목록을 조회합니다.',
		{
			persistent_id: z.string().min(1).describe('데이터셋의 Persistent ID'),
			instance_url: z.string().url().optional().describe('조회할 Dataverse 인스턴스 URL')
		},
		async ({ persistent_id, instance_url }): Promise<CallToolResult> => {
			try {
				const client = new DataverseClient(instance_url);
				const response = await client.getDatasetFiles(persistent_id);

				if (response.status !== 'OK') {
					return {
						content: [{
							type: 'text',
							text: `파일 목록 조회 실패: ${response.message || 'Unknown error'}`
						}],
						isError: true
					};
				}

				const files = response.data || [];

				const resultText = `
📁 데이터셋 파일 목록
==================
Dataset: ${persistent_id}
총 파일 수: ${files.length}개

${files.map((file: any, index: number) => `
${index + 1}. ${file.dataFile?.filename || 'Unnamed file'}
   크기: ${formatBytes(file.dataFile?.filesize || 0)}
   타입: ${file.dataFile?.contentType || 'Unknown'}
   설명: ${file.dataFile?.description || 'No description'}
   ${file.dataFile?.id ? `파일 ID: ${file.dataFile.id}` : ''}
`).join('\n')}
				`.trim();

				return {
					content: [{
						type: 'text',
						text: resultText
					}]
				};
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				return {
					content: [{
						type: 'text',
						text: `파일 목록 조회 실패: ${errorMessage}`
					}],
					isError: true
				};
			}
		}
	);

	// 6. Dataverse 인스턴스 목록 조회 도구
	server.tool(
		'list-dataverse-instances',
		'지원되는 전 세계 Dataverse 인스턴스 목록을 조회합니다.',
		{
			country: z.string().optional().describe('특정 국가로 필터링'),
			show_stats: z.boolean().optional().describe('통계 정보 포함 여부').default(true),
			active_only: z.boolean().optional().describe('활성 인스턴스만 표시').default(true)
		},
		async ({ country, show_stats, active_only }): Promise<CallToolResult> => {
			try {
				const allInstances = getActiveInstances();
				const filteredInstances = country 
					? allInstances.filter(instance => 
						instance.country.toLowerCase().includes(country.toLowerCase())
					)
					: allInstances;

				const stats = getInstanceStats();
				
				let resultText = '';
				
				if (show_stats) {
					resultText += `📊 Dataverse 인스턴스 통계\n`;
					resultText += `총 인스턴스: ${stats.total}개\n`;
					resultText += `활성 인스턴스: ${stats.active}개\n`;
					resultText += `지원 국가: ${stats.countriesCount}개\n\n`;
				}

				resultText += `🌍 ${country ? `"${country}" 관련` : '전 세계 활성'} Dataverse 인스턴스 (${filteredInstances.length}개):\n\n`;

				// 국가별로 그룹화
				const byCountry = filteredInstances.reduce((acc, instance) => {
					if (!acc[instance.country]) acc[instance.country] = [];
					acc[instance.country].push(instance);
					return acc;
				}, {} as Record<string, any[]>);

				for (const [countryName, instances] of Object.entries(byCountry)) {
					resultText += `\n🏳️ ${countryName} (${instances.length}개):\n`;
					instances.forEach((instance, index) => {
						resultText += `  ${index + 1}. ${instance.platformName}\n`;
						resultText += `     기관: ${instance.organization}\n`;
						resultText += `     URL: ${instance.url}\n`;
						resultText += `     API: ${instance.apiUrl}\n`;
						resultText += `     설명: ${instance.description.length > 100 ? instance.description.substring(0, 100) + '...' : instance.description}\n\n`;
					});
				}

				return {
					content: [{
						type: 'text',
						text: resultText.trim()
					}]
				};
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				return {
					content: [{
						type: 'text',
						text: `인스턴스 목록 조회 실패: ${errorMessage}`
					}],
					isError: true
				};
			}
		}
	);

	// 7. 인스턴스 상태 확인 도구
	server.tool(
		'check-instance-health',
		'특정 Dataverse 인스턴스의 상태를 확인합니다.',
		{
			instance_url: z.string().url().describe('확인할 Dataverse 인스턴스 URL')
		},
		async ({ instance_url }): Promise<CallToolResult> => {
			try {
				const client = new DataverseClient(instance_url);
				const isHealthy = await client.checkHealth();
				
				let resultText = `🏥 인스턴스 상태 확인\n`;
				resultText += `URL: ${instance_url}\n`;
				resultText += `상태: ${isHealthy ? '✅ 정상' : '❌ 접속 불가'}\n`;

				if (isHealthy) {
					const versionResponse = await client.getVersion();
					if (versionResponse.status === 'OK') {
						const version = versionResponse.data?.data;
						resultText += `버전: ${version?.version || 'Unknown'}\n`;
						resultText += `빌드: ${version?.build || 'Unknown'}\n`;
					}

					const serverResponse = await client.getServerInfo();
					if (serverResponse.status === 'OK') {
						const server = serverResponse.data?.data;
						resultText += `서버: ${server?.message || 'Unknown'}\n`;
					}
				}

				return {
					content: [{
						type: 'text',
						text: resultText
					}]
				};
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Unknown error';
				return {
					content: [{
						type: 'text',
						text: `상태 확인 실패: ${errorMessage}`
					}],
					isError: true
				};
			}
		}
	);

	// 8. 스마트 검색 도구
	server.tool(
		'dataverse_search',
		'스마트 검색을 통해 데이터셋을 검색합니다.',
		{
			query: z.string().min(1).describe('검색할 키워드나 문구'),
			instance_url: z.string().url().optional().describe('특정 Dataverse 인스턴스 URL'),
			max_results: z.number().min(1).max(200).optional().describe('최대 결과 수').default(100),
			include_files: z.boolean().optional().describe('파일 포함 여부').default(false),
			year_range: z.object({
				start: z.number().min(1900).max(2030).optional().describe('시작 연도'),
				end: z.number().min(1900).max(2030).optional().describe('종료 연도')
			}).optional(),
			subjects: z.array(z.string()).optional().describe('검색 주제')
		},
		async ({ query, instance_url, max_results, include_files, year_range, subjects }): Promise<CallToolResult> => {
			try {
				if (instance_url) {
					// 특정 인스턴스 검색
					const client = new DataverseClient(instance_url);
					
					// 스마트 검색 실행
					const smartResult = await smartSearch(client, query, {
						maxResults: Math.min(max_results, 200), // MCP용 최대 200개
						includeFiles: include_files,
						includeFacets: true,
						yearRange: year_range,
						subjects: subjects || []
					});

					const resultText = formatEnhancedResults(smartResult.results, {
						totalCount: smartResult.totalCount,
						searchStrategy: smartResult.searchStrategy,
						appliedFilters: smartResult.appliedFilters,
						suggestions: smartResult.suggestions
					});

					// 검색 통계 추가
					let statsText = `\n📊 **검색 분석**\n`;
					statsText += `• 인스턴스: ${instance_url}\n`;
					statsText += `• 검색 전략: ${smartResult.searchStrategy}\n`;
					if (smartResult.appliedFilters.length > 0) {
						statsText += `• 자동 적용된 필터: ${smartResult.appliedFilters.length}개\n`;
					}
					if (smartResult.facets && smartResult.facets.length > 0) {
						statsText += `• 사용 가능한 패싯: ${smartResult.facets.length}개\n`;
					}

					return {
						content: [{
							type: 'text',
							text: resultText + statsText
						}]
					};
				} else {
					// 전역 검색 - 여러 인스턴스에서 검색
					const activeInstances = getActiveInstances();
					const priorityInstances = activeInstances.filter(inst => 
						[
							'https://dataverse.harvard.edu',
							'https://dataverse.nl/',
							'https://dataverse.no/',
							'https://demo.dataverse.org/'
						].includes(inst.url)
					);

					// 우선순위 인스턴스에서 먼저 검색
					const promises = priorityInstances.slice(0, 3).map(async (instance) => {
						try {
							const client = new DataverseClient(instance.url);
							const result = await smartSearch(client, query, {
								maxResults: 50, // 인스턴스당 50개
								includeFiles: include_files,
								includeFacets: false, // 전역 검색에서는 facets 제외
								yearRange: year_range,
								subjects: subjects || []
							});
							
							return {
								instance: instance.organization,
								url: instance.url,
								results: result.results,
								totalCount: result.totalCount,
								searchStrategy: result.searchStrategy
							};
						} catch (err) {
							if (dev) {
								console.warn(`${instance.organization} 검색 실패:`, err);
							}
							return null;
						}
					});

					const results = await Promise.all(promises);
					const validResults = results.filter(r => r !== null);
					
					// 결과 통합
					const allResults = validResults.flatMap(r => r.results);
					const totalCount = validResults.reduce((sum, r) => sum + r.totalCount, 0);
					
					// 중복 제거 (global_id 기준)
					const uniqueResults = allResults.filter((item, index, self) => 
						index === self.findIndex(t => t.global_id === item.global_id && item.global_id)
					);

					// 날짜순 정렬
					uniqueResults.sort((a, b) => {
						const dateA = new Date(a.published_at || 0);
						const dateB = new Date(b.published_at || 0);
						return dateB.getTime() - dateA.getTime();
					});

					// 제한 적용
					const limitedResults = uniqueResults.slice(0, max_results);

					let resultText = `🌍 **전역 Dataverse 검색 결과**\n`;
					resultText += `═══════════════════════════════════════\n\n`;
					resultText += `🔍 검색어: "${query}"\n`;
					resultText += `📊 총 발견: ${totalCount.toLocaleString()}개 (${validResults.length}개 인스턴스)\n`;
					resultText += `📋 표시: ${limitedResults.length}개 (중복 제거 후)\n\n`;

					// 인스턴스별 통계
					resultText += `🏛️ **검색된 인스턴스**\n`;
					validResults.forEach(result => {
						resultText += `• ${result.instance}: ${result.totalCount.toLocaleString()}개 결과\n`;
					});
					resultText += `\n`;

					// 검색 결과
					if (limitedResults.length > 0) {
						resultText += `📋 **검색 결과**\n`;
						resultText += `${'-'.repeat(50)}\n\n`;

						limitedResults.forEach((item, index) => {
							resultText += `**${index + 1}. ${item.name}**\n`;
							resultText += `   🏷️ 타입: ${item.type}\n`;
							if (item.authors && item.authors.length > 0) {
								resultText += `   👤 저자: ${item.authors.slice(0, 3).join(', ')}${item.authors.length > 3 ? '...' : ''}\n`;
							}
							if (item.published_at) {
								resultText += `   📅 발행일: ${new Date(item.published_at).getFullYear()}\n`;
							}
							if (item.description) {
								const desc = item.description.length > 150 
									? item.description.substring(0, 150) + '...' 
									: item.description;
								resultText += `   📝 설명: ${desc}\n`;
							}
							if (item.global_id) {
								resultText += `   🔗 DOI: ${item.global_id}\n`;
							}
							if (item.url) {
								resultText += `   🌐 URL: ${item.url}\n`;
							}
							resultText += `\n`;
						});
					} else {
						resultText += `❌ **검색 결과가 없습니다**\n`;
						resultText += `다른 키워드를 시도해보세요.\n`;
					}

					return {
						content: [{
							type: 'text',
							text: resultText
						}]
					};
				}
			} catch (err) {
				console.error('검색 오류:', err);
				return {
					content: [{
						type: 'text',
						text: `검색 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
					}],
					isError: true
				};
			}
		}
	);

	// === RESOURCES ===

	// 사용 가이드 리소스
	server.resource(
		'dataverse://guide',
		'Global Dataverse MCP 서버 완전 사용 가이드',
		{ mimeType: 'text/markdown' },
		async (): Promise<ReadResourceResult> => {
			const stats = getInstanceStats();
			return {
				contents: [{
					uri: 'dataverse://guide',
					mimeType: 'text/markdown',
					text: `
# Global Dataverse MCP 서버 사용 가이드

전 세계 ${stats.total}개 Dataverse 인스턴스에서 연구 데이터를 검색하고 분석할 수 있는 AI 도구입니다.

## 🛠️ 사용 가능한 도구들

### 검색 도구
- **search-datasets**: 단일 인스턴스에서 데이터셋 검색
- **search-global-dataverse**: 전 세계 모든 인스턴스에서 동시 검색 
- **search-by-country**: 특정 국가의 인스턴스에서만 검색

### 데이터셋 정보 도구
- **get-dataset-info**: 데이터셋 상세 정보 조회
- **get-dataset-files**: 데이터셋 파일 목록 조회

### 인스턴스 관리 도구
- **list-dataverse-instances**: 지원 인스턴스 목록 조회
- **check-instance-health**: 인스턴스 상태 확인

## 🌍 지원 국가 (${stats.countriesCount}개국)

전 세계 주요 연구 기관의 Dataverse 인스턴스를 지원합니다.

## 💡 사용 예시

### 기본 검색
\`\`\`
"COVID-19 관련 데이터를 찾아줘"
"기후변화 데이터셋을 검색해줘"
\`\`\`

### 특정 국가 검색
\`\`\`
"미국의 Dataverse에서 경제 데이터를 찾아줘"
"한국 관련 연구 데이터를 검색해줘"
\`\`\`

### 데이터셋 상세 정보
\`\`\`
"doi:10.7910/DVN/EXAMPLE 데이터셋의 상세 정보를 알려줘"
\`\`\`

## ⚡ 성능 최적화

- 빠른 응답을 위해 상위 인스턴스 우선 검색
- 병렬 처리로 포괄적인 결과 제공
- 타임아웃 설정으로 안정성 확보
					`.trim()
				}]
			};
		}
	);

	// API 문서 리소스
	server.resource(
		'dataverse://api-docs',
		'Dataverse API 공식 문서 링크 및 주요 엔드포인트',
		{ mimeType: 'text/markdown' },
		async (): Promise<ReadResourceResult> => {
			return {
				contents: [{
					uri: 'dataverse://api-docs',
					mimeType: 'text/markdown',
					text: `
# Dataverse API 문서

## 공식 문서
- [API 가이드](https://guides.dataverse.org/en/latest/api/index.html)
- [Search API](https://guides.dataverse.org/en/latest/api/search.html)
- [Native API](https://guides.dataverse.org/en/latest/api/native-api.html)
- [Data Access API](https://guides.dataverse.org/en/latest/api/dataaccess.html)

## 주요 엔드포인트
- \`GET /api/search\` - 데이터 검색
- \`GET /api/datasets/:persistentId\` - 데이터셋 정보 조회
- \`GET /api/datasets/:persistentId/versions/:latest/files\` - 파일 목록
- \`GET /api/info/version\` - 버전 정보
- \`GET /api/info/server\` - 서버 정보

## 인증 방식
- API Token (Header: X-Dataverse-Key)
- Bearer Token (Header: Authorization: Bearer <token>)
					`.trim()
				}]
			};
		}
	);

	return server;
}

/**
 * 바이트 크기 포맷팅 헬퍼
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 전역 검색 결과 포맷팅
 */
function formatGlobalSearchResults(aggregatedResults: any): string {
	if (!aggregatedResults || !aggregatedResults.items || aggregatedResults.items.length === 0) {
		return '검색 결과가 없습니다.';
	}

	let resultText = `🌍 전역 검색 결과 (${aggregatedResults.totalCount.toLocaleString()}개 발견)\n`;
	resultText += `═══════════════════════════════════════\n\n`;

	aggregatedResults.items.forEach((item: any, index: number) => {
		resultText += `${index + 1}. **${item.name || item.title}**\n`;
		resultText += `   🏷️ 타입: ${item.type}\n`;
		if (item.authors && item.authors.length > 0) {
			resultText += `   👤 저자: ${item.authors.slice(0, 3).join(', ')}${item.authors.length > 3 ? '...' : ''}\n`;
		}
		if (item.published_at) {
			resultText += `   📅 발행일: ${new Date(item.published_at).getFullYear()}\n`;
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

	return resultText;
}

/**
 * 향상된 검색 결과 포맷팅
 */
function formatEnhancedResults(results: any[], metadata?: {
	totalCount?: number;
	searchStrategy?: string;
	appliedFilters?: string[];
	suggestions?: string[];
}): string {
	let resultText = `🔍 스마트 검색 결과\n`;
	resultText += `═══════════════════════════════════════\n\n`;

	if (metadata) {
		if (metadata.totalCount !== undefined) {
			resultText += `📊 총 결과: ${metadata.totalCount.toLocaleString()}개\n`;
		}
		if (metadata.searchStrategy) {
			resultText += `🎯 검색 전략: ${metadata.searchStrategy}\n`;
		}
		if (metadata.appliedFilters && metadata.appliedFilters.length > 0) {
			resultText += `🔧 자동 적용된 필터: ${metadata.appliedFilters.join(', ')}\n`;
		}
		resultText += `\n`;
	}

	if (results.length === 0) {
		resultText += `❌ 검색 결과가 없습니다.\n`;
		if (metadata?.suggestions && metadata.suggestions.length > 0) {
			resultText += `\n💡 검색 제안:\n`;
			metadata.suggestions.forEach(suggestion => {
				resultText += `• "${suggestion}"\n`;
			});
		}
		return resultText;
	}

	resultText += `📋 검색 결과 (${results.length}개 표시)\n`;
	resultText += `${'-'.repeat(50)}\n\n`;

	results.forEach((item: any, index: number) => {
		resultText += `**${index + 1}. ${item.name || item.title}**\n`;
		resultText += `   🏷️ 타입: ${item.type}\n`;
		if (item.authors && item.authors.length > 0) {
			resultText += `   👤 저자: ${item.authors.slice(0, 3).join(', ')}${item.authors.length > 3 ? '...' : ''}\n`;
		}
		if (item.published_at) {
			resultText += `   📅 발행일: ${new Date(item.published_at).getFullYear()}\n`;
		}
		if (item.description) {
			const desc = item.description.length > 150 
				? item.description.substring(0, 150) + '...' 
				: item.description;
			resultText += `   📝 설명: ${desc}\n`;
		}
		if (item.global_id) {
			resultText += `   🔗 DOI: ${item.global_id}\n`;
		}
		if (item.url) {
			resultText += `   🌐 URL: ${item.url}\n`;
		}
		resultText += `\n`;
	});

	if (metadata?.suggestions && metadata.suggestions.length > 0) {
		resultText += `\n💡 추가 검색 제안:\n`;
		metadata.suggestions.forEach(suggestion => {
			resultText += `• "${suggestion}"\n`;
		});
	}

	return resultText;
}

/**
 * POST 요청 핸들러 - MCP 서버 엔드포인트
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		
		// MCP 프로토콜 메시지 타입 확인
		if (!body.method) {
			return error(400, 'Invalid MCP request: missing method');
		}

		// 현재는 간단한 응답 반환 (실제 MCP 서버 구현은 별도 필요)
		return json({
			jsonrpc: '2.0',
			id: body.id || null,
			result: {
				message: 'MCP server is running',
				capabilities: ['tools', 'resources'],
				tools: ['search-datasets', 'get-dataset-info'],
				resources: ['dataverse://guide']
			}
		});

	} catch (err) {
		console.error('MCP 서버 오류:', err);
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		return error(500, `MCP 서버 처리 중 오류가 발생했습니다: ${errorMessage}`);
	}
};

/**
 * GET 요청 핸들러 - 서버 상태 확인
 */
export const GET: RequestHandler = async () => {
	const stats = getInstanceStats();
	
	return json({
		name: MCP_SERVER_NAME,
		version: MCP_SERVER_VERSION,
		description: MCP_SERVER_DESCRIPTION,
		status: 'active',
		capabilities: {
			tools: [
				'search-datasets',
				'search-global-dataverse', 
				'search-by-country',
				'get-dataset-info',
				'get-dataset-files',
				'list-dataverse-instances',
				'check-instance-health'
			],
			resources: [
				'dataverse://guide',
				'dataverse://api-docs'
			]
		},
		statistics: {
			total_instances: stats.total,
			active_instances: stats.active,
			supported_countries: stats.countriesCount
		},
		documentation: 'https://guides.dataverse.org/en/latest/api/index.html',
		timestamp: new Date().toISOString()
	});
};