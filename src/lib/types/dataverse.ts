/**
 * Dataverse API 관련 타입 정의
 * 타입 안전성과 코드 재사용성을 위한 완전한 타입 시스템
 */

// 기본 검색 파라미터
export interface DataverseSearchParams {
	q: string;
	type?: 'dataset' | 'file' | 'dataverse';
	sort?: 'name' | 'date';
	per_page?: number;
	start?: number;
	fq?: string[];
	subtree?: string;
	order?: 'asc' | 'desc';
	show_relevance?: boolean;
	show_facets?: boolean;
}

// 검색 결과 타입 - 실제 API 응답 구조와 일치
export interface DataverseSearchResult {
	status: string;
	data: {
		q: string;
		total_count: number;
		start: number;
		count_in_response: number;
		spelling_alternatives?: Record<string, any>;
		items: DataverseItem[];
		facets?: DataverseFacet[];
	};
}

// 데이터셋 아이템
export interface DataverseItem {
	readonly name: string;
	readonly type: 'dataset' | 'file' | 'dataverse';
	readonly url: string;
	readonly global_id?: string;
	readonly description?: string;
	readonly published_at?: string;
	readonly updated_at?: string;
	readonly authors?: string[];
	readonly subjects?: string[];
	readonly keywords?: string[];
	readonly file_count?: number;
	readonly size_in_bytes?: number;
	readonly version_id?: number;
	readonly version_state?: 'DRAFT' | 'RELEASED' | 'DEACCESSIONED';
	readonly checksum?: DataverseChecksum;
	readonly contacts?: DataverseContact[];
	readonly producers?: DataverseProducer[];
}

// 체크섬 정보
export interface DataverseChecksum {
	readonly type: string;
	readonly value: string;
}

// 연락처 정보
export interface DataverseContact {
	readonly name?: string;
	readonly affiliation?: string;
	readonly email?: string;
}

// 생산자 정보
export interface DataverseProducer {
	readonly name?: string;
	readonly affiliation?: string;
	readonly abbreviation?: string;
	readonly url?: string;
}

// 패싯 정보
export interface DataverseFacet {
	readonly name: string;
	readonly friendly_name: string;
	readonly labels: DataverseFacetLabel[];
}

export interface DataverseFacetLabel {
	readonly name: string;
	readonly count: number;
}

// 데이터셋 상세 정보
export interface DataverseDataset {
	readonly id: number;
	readonly persistent_id: string;
	readonly protocol: string;
	readonly authority: string;
	readonly identifier: string;
	readonly publication_date?: string;
	readonly citation_date?: string;
	readonly latest_version: DataverseVersion;
	readonly versions?: DataverseVersion[];
}

// 버전 정보
export interface DataverseVersion {
	readonly id: number;
	readonly version_number?: number;
	readonly version_minor_number?: number;
	readonly version_state: 'DRAFT' | 'RELEASED' | 'DEACCESSIONED';
	readonly version_note?: string;
	readonly archive_note?: string;
	readonly deaccession_link?: string;
	readonly distribution_date?: string;
	readonly product_date?: string;
	readonly create_time: string;
	readonly last_update_time: string;
	readonly release_time?: string;
	readonly file_count: number;
	readonly size_in_bytes: number;
	readonly metadata_blocks: Record<string, DataverseMetadataBlock>;
	readonly files?: DataverseFile[];
}

// 메타데이터 블록
export interface DataverseMetadataBlock {
	readonly display_name: string;
	readonly name: string;
	readonly fields: DataverseMetadataField[];
}

// 메타데이터 필드
export interface DataverseMetadataField {
	readonly type_name: string;
	readonly multiple: boolean;
	readonly type_class: string;
	readonly value: string | DataverseMetadataCompoundValue[] | string[];
}

// 복합 메타데이터 값
export interface DataverseMetadataCompoundValue {
	readonly [key: string]: {
		readonly type_name: string;
		readonly multiple: boolean;
		readonly type_class: string;
		readonly value: string;
	};
}

// 파일 정보
export interface DataverseFile {
	readonly id: number;
	readonly persistent_id?: string;
	readonly pid?: string;
	readonly filename: string;
	readonly content_type: string;
	readonly file_size: number;
	readonly description?: string;
	readonly storage_identifier?: string;
	readonly root_data_file_id?: number;
	readonly md5?: string;
	readonly checksum?: DataverseChecksum;
	readonly created_at: string;
	readonly embargo?: DataverseEmbargo;
	readonly restricted?: boolean;
	readonly directory_label?: string;
	readonly version?: number;
	readonly data_tables?: DataverseDataTable[];
}

// 엠바고 정보
export interface DataverseEmbargo {
	readonly date_available: string;
	readonly reason?: string;
}

// 데이터 테이블
export interface DataverseDataTable {
	readonly id: number;
	readonly name: string;
	readonly records_per_case?: number;
	readonly var_quantity?: number;
	readonly data_variables?: DataverseDataVariable[];
}

// 데이터 변수
export interface DataverseDataVariable {
	readonly id: number;
	readonly name: string;
	readonly label?: string;
	readonly type?: string;
	readonly format?: string;
	readonly format_category?: string;
	readonly universe?: string;
	readonly summary_statistics?: Record<string, number>;
	readonly categories?: DataverseVariableCategory[];
}

// 변수 카테고리
export interface DataverseVariableCategory {
	readonly value: string;
	readonly label?: string;
	readonly frequency?: number;
}

// API 응답 기본 타입
export interface DataverseApiResponse<T = unknown> {
	readonly status: 'OK' | 'ERROR';
	readonly data?: T;
	readonly message?: string;
}

// 에러 타입
export interface DataverseError {
	readonly code: string;
	readonly message: string;
	readonly details?: Record<string, unknown>;
}

// 인스턴스 설정
export interface DataverseInstance {
	readonly name: string;
	readonly url: string;
	readonly api_key?: string;
	readonly description?: string;
	readonly country?: string;
	readonly institution?: string;
	readonly enabled: boolean;
}

// 검색 상태
export interface SearchState {
	readonly query: string;
	readonly results: DataverseItem[];
	readonly loading: boolean;
	readonly error: string | null;
	readonly total_count: number;
	readonly current_page: number;
	readonly per_page: number;
	readonly facets: DataverseFacet[];
}

// MCP 도구 파라미터
export interface McpSearchDatasetsParams {
	readonly query: string;
	readonly type?: 'dataset' | 'file' | 'dataverse';
	readonly subtree?: string;
	readonly sort?: 'name' | 'date';
	readonly per_page?: number;
	readonly instance?: string;
}

export interface McpGetDatasetInfoParams {
	readonly persistent_id: string;
	readonly instance?: string;
}

export interface McpAnalyzeMetadataParams {
	readonly persistent_id: string;
	readonly fields?: string[];
	readonly instance?: string;
}

// 유틸리티 타입
export type DataverseItemType = DataverseItem['type'];
export type DataverseSearchSort = DataverseSearchParams['sort'];
export type DataverseSearchOrder = DataverseSearchParams['order'];
export type DataverseVersionState = DataverseVersion['version_state'];

// 타입 가드 함수들을 위한 타입
export type TypeGuardResult<T> = (value: unknown) => value is T;

// Nullable 타입 안전성을 위한 헬퍼 타입
export type NonNullable<T> = T extends null | undefined ? never : T;
export type SafeAccess<T, K extends keyof T> = T[K] extends null | undefined ? never : T[K];

// 검색 필터 타입
export interface SearchFilters {
	readonly types: DataverseItemType[];
	readonly date_range?: {
		readonly start: string;
		readonly end: string;
	};
	readonly subjects: string[];
	readonly authors: string[];
	readonly keywords: string[];
	readonly file_count_range?: {
		readonly min: number;
		readonly max: number;
	};
	readonly size_range?: {
		readonly min: number;
		readonly max: number;
	};
}

// 검색 패싯 타입
export interface DataverseSearchFacet {
	[key: string]: {
		friendly: string;
		labels: Record<string, number>[];
	};
} 