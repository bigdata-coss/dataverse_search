/**
 * Model Context Protocol (MCP) 관련 타입 정의
 * MCP 서버의 도구, 리소스, 프롬프트에 대한 완전한 타입 시스템
 */

import type { CallToolResult, ReadResourceResult, GetPromptResult } from '@modelcontextprotocol/sdk/types.js';

// MCP 서버 기본 설정
export interface McpServerConfig {
	readonly name: string;
	readonly version: string;
	readonly description?: string;
	readonly author?: string;
	readonly license?: string;
	readonly homepage?: string;
}

// MCP 도구 정의
export interface McpToolDefinition {
	readonly name: string;
	readonly description: string;
	readonly inputSchema: Record<string, unknown>;
}

// MCP 리소스 정의
export interface McpResourceDefinition {
	readonly uri: string;
	readonly name: string;
	readonly description?: string;
	readonly mimeType?: string;
}

// MCP 프롬프트 정의
export interface McpPromptDefinition {
	readonly name: string;
	readonly description?: string;
	readonly arguments?: McpPromptArgument[];
}

export interface McpPromptArgument {
	readonly name: string;
	readonly description?: string;
	readonly required?: boolean;
}

// Dataverse MCP 도구들의 파라미터 타입
export interface SearchDatasetsParams {
	readonly query: string;
	readonly type?: 'dataset' | 'file' | 'dataverse';
	readonly subtree?: string;
	readonly sort?: 'name' | 'date';
	readonly per_page?: number;
	readonly instance?: string;
}

export interface GetDatasetInfoParams {
	readonly persistent_id: string;
	readonly instance?: string;
	readonly include_files?: boolean;
}

export interface AnalyzeMetadataParams {
	readonly persistent_id: string;
	readonly fields?: string[];
	readonly instance?: string;
	readonly analysis_type?: 'basic' | 'detailed' | 'statistical';
}

export interface GetSimilarDatasetsParams {
	readonly persistent_id: string;
	readonly limit?: number;
	readonly threshold?: number;
	readonly instance?: string;
}

export interface DownloadDatasetParams {
	readonly persistent_id: string;
	readonly format?: 'original' | 'tab' | 'rdata' | 'var' | 'xlsx';
	readonly file_ids?: number[];
	readonly instance?: string;
}

// MCP 도구 결과 타입
export interface SearchDatasetsResult extends CallToolResult {
	readonly content: Array<{
		readonly type: 'text';
		readonly text: string;
	}>;
}

export interface GetDatasetInfoResult extends CallToolResult {
	readonly content: Array<{
		readonly type: 'text';
		readonly text: string;
	}>;
}

export interface AnalyzeMetadataResult extends CallToolResult {
	readonly content: Array<{
		readonly type: 'text';
		readonly text: string;
	}>;
}

// MCP 리소스 결과 타입
export interface DataverseGuideResource extends ReadResourceResult {
	readonly contents: Array<{
		readonly uri: string;
		readonly text: string;
		readonly mimeType?: string;
	}>;
}

export interface SearchTipsResource extends ReadResourceResult {
	readonly contents: Array<{
		readonly uri: string;
		readonly text: string;
		readonly mimeType?: string;
	}>;
}

// MCP 프롬프트 결과 타입
export interface DataverseSearchPromptResult extends GetPromptResult {
	readonly description?: string;
	readonly messages: Array<{
		readonly role: 'user' | 'assistant';
		readonly content: {
			readonly type: 'text';
			readonly text: string;
		};
	}>;
}

// MCP 에러 타입
export interface McpError {
	readonly code: number;
	readonly message: string;
	readonly data?: Record<string, unknown>;
}

// MCP 서버 상태
export interface McpServerState {
	readonly initialized: boolean;
	readonly connected: boolean;
	readonly tools_count: number;
	readonly resources_count: number;
	readonly prompts_count: number;
	readonly last_activity: Date | null;
	readonly error: McpError | null;
}

// MCP 클라이언트 설정
export interface McpClientConfig {
	readonly server_url: string;
	readonly timeout?: number;
	readonly retry_attempts?: number;
	readonly retry_delay?: number;
	readonly headers?: Record<string, string>;
}

// MCP 통계
export interface McpStats {
	readonly total_requests: number;
	readonly successful_requests: number;
	readonly failed_requests: number;
	readonly average_response_time: number;
	readonly tool_usage: Record<string, number>;
	readonly resource_access: Record<string, number>;
	readonly error_counts: Record<string, number>;
}

// MCP 로깅
export interface McpLogEntry {
	readonly timestamp: Date;
	readonly level: 'debug' | 'info' | 'warn' | 'error';
	readonly message: string;
	readonly context?: Record<string, unknown>;
	readonly request_id?: string;
	readonly tool_name?: string;
	readonly resource_uri?: string;
}

// 도구 실행 컨텍스트
export interface ToolExecutionContext {
	readonly request_id: string;
	readonly timestamp: Date;
	readonly tool_name: string;
	readonly parameters: Record<string, unknown>;
	readonly user_agent?: string;
	readonly ip_address?: string;
}

// 리소스 접근 컨텍스트
export interface ResourceAccessContext {
	readonly request_id: string;
	readonly timestamp: Date;
	readonly resource_uri: string;
	readonly user_agent?: string;
	readonly ip_address?: string;
}

// MCP 서버 응답 타입
export interface McpResponse<T = unknown> {
	readonly success: boolean;
	readonly data?: T;
	readonly error?: McpError;
	readonly request_id: string;
	readonly timestamp: Date;
	readonly execution_time: number;
}

// 타입 가드 함수
export function isValidSearchParams(params: unknown): params is SearchDatasetsParams {
	return (
		typeof params === 'object' &&
		params !== null &&
		'query' in params &&
		typeof (params as { query: unknown }).query === 'string'
	);
}

export function isValidDatasetInfoParams(params: unknown): params is GetDatasetInfoParams {
	return (
		typeof params === 'object' &&
		params !== null &&
		'persistent_id' in params &&
		typeof (params as { persistent_id: unknown }).persistent_id === 'string'
	);
}

export function isValidAnalyzeParams(params: unknown): params is AnalyzeMetadataParams {
	return (
		typeof params === 'object' &&
		params !== null &&
		'persistent_id' in params &&
		typeof (params as { persistent_id: unknown }).persistent_id === 'string'
	);
}

// 유틸리티 타입
export type McpToolName = 
	| 'search-datasets'
	| 'get-dataset-info'
	| 'analyze-metadata'
	| 'get-similar-datasets'
	| 'download-dataset';

export type McpResourceUri = 
	| 'dataverse://guide'
	| 'dataverse://search-tips'
	| 'dataverse://data-formats'
	| 'dataverse://api-reference'
	| 'dataverse://best-practices';

export type McpPromptName = 
	| 'search-datasets'
	| 'analyze-data'
	| 'data-citation'
	| 'research-workflow';

// MCP 서버 헬퍼 타입
export interface McpServerHelpers {
	readonly formatSearchResults: (results: unknown[]) => string;
	readonly formatDatasetInfo: (dataset: unknown) => string;
	readonly formatMetadataAnalysis: (analysis: unknown) => string;
	readonly validatePersistentId: (id: string) => boolean;
	readonly generateCitation: (dataset: unknown) => string;
	readonly extractKeywords: (text: string) => string[];
	readonly calculateSimilarity: (dataset1: unknown, dataset2: unknown) => number;
}

// 비동기 작업 타입
export interface AsyncTaskStatus {
	readonly id: string;
	readonly status: 'pending' | 'running' | 'completed' | 'failed';
	readonly progress?: number;
	readonly result?: unknown;
	readonly error?: McpError;
	readonly started_at: Date;
	readonly completed_at?: Date;
}

// 캐싱 타입
export interface CacheEntry<T = unknown> {
	readonly key: string;
	readonly value: T;
	readonly created_at: Date;
	readonly expires_at: Date;
	readonly access_count: number;
	readonly last_accessed: Date;
}

// 레이트 리미팅 타입
export interface RateLimitConfig {
	readonly requests_per_minute: number;
	readonly requests_per_hour: number;
	readonly requests_per_day: number;
	readonly burst_limit: number;
}

export interface RateLimitStatus {
	readonly requests_made: number;
	readonly requests_remaining: number;
	readonly reset_time: Date;
	readonly retry_after?: number;
} 