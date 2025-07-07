<script lang="ts">
	import { Search, Database, Settings, Globe, MapPin, Play, Code, BookOpen, ExternalLink, ChevronDown, ChevronUp, Calendar, Users, Filter, ArrowLeft, ArrowRight } from 'lucide-svelte';
	import { getInstanceStats, getActiveInstances, getInstancesByCountry, type DataverseInstance } from '$lib/data/dataverse-instances.js';
	import type { DataverseSearchResult } from '$lib/types/dataverse.js';
	import { dev } from '$app/environment';
	
	// 컴포넌트 임포트
	import InstanceSelector from '$lib/components/InstanceSelector.svelte';
	import SearchForm from '$lib/components/SearchForm.svelte';
	import ResultsFilter from '$lib/components/ResultsFilter.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	// 검색 결과 타입 정의
	interface SearchResultItem {
		id: string;
		title: string;
		description: string;
		url: string;
		type: string;
		authors: string[];
		instance: string;
		instanceUrl?: string;
		publishedAt?: string;
		subjects: string[];
	}

	interface SearchResults {
		items: SearchResultItem[];
		total_count: number;
		metadata?: {
			search_strategy?: string;
			search_time?: number;
			applied_filters?: string[];
		};
		suggestions?: string[];
	}
	
	// SvelteKit v5 룬 문법 사용
	let searchQuery: string = $state('');
	let selectedCountry: string = $state('USA');
	let selectedSpecificInstance: string = $state('https://dataverse.harvard.edu');
	let isLoading: boolean = $state(false);
	let searchResults: SearchResults | null = $state(null);
	let currentPage: number = $state(1);
	let totalResults: number = $state(0);
	
	// 고급 검색 옵션
	let showAdvanced: boolean = $state(false);
	let searchField: 'all' | 'title' | 'author' | 'subject' = $state('all');
	let sortBy: 'date' | 'name' = $state('date');
	let sortOrder: 'asc' | 'desc' = $state('desc');
	let startYear: number | undefined = $state(undefined);
	let endYear: number | undefined = $state(undefined);
	let resultsPerPage: number = $state(20);
	let includeFiles: boolean = $state(false);
	
	// totalPages를 $derived로 자동 계산
	let totalPages = $derived(Math.ceil(totalResults / resultsPerPage));

	// 검색 메타 정보
	let searchMeta = $state<{
		searchStrategy?: string;
		appliedFilters?: string[];
		suggestions?: string[];
		searchTime?: number;
	}>({});

	// 결과내 검색
	let resultFilterQuery: string = $state('');
	let filteredResults: SearchResultItem[] = $state([]);



	// 전 세계 Dataverse 통계 및 인스턴스
	const stats = getInstanceStats();
	const allInstances = getActiveInstances();
	
	// 국가 목록 생성
	const countries = $derived.by(() => {
		const countrySet = new Set(allInstances.map(instance => instance.country));
		return Array.from(countrySet).sort();
	});
	
	// 필터링된 인스턴스 목록 (선택된 국가 기준)
	const filteredInstances = $derived.by(() => {
		return getInstancesByCountry(selectedCountry);
	});
	
	// 선택된 특정 인스턴스 정보
	const selectedInstanceInfo = $derived.by(() => {
		return allInstances.find(instance => instance.url === selectedSpecificInstance) || filteredInstances[0];
	});

	// 페이지네이션 함수들




	// 고급 옵션 토글
	function toggleAdvanced(): void {
		showAdvanced = !showAdvanced;
	}

	// 페이지 변경
	function goToPage(page: number): void {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			handleSearch();
		}
	}

	// 다음 페이지
	function nextPage(): void {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	}

	// 이전 페이지  
	function prevPage(): void {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	}
	
	// 검색 함수 - 실제 MCP API 호출
	async function handleSearch(): Promise<void> {
		if (!searchQuery.trim()) return;
		
		isLoading = true;
		if (currentPage === 1) {
			searchResults = null;
			totalResults = 0;
			// 새로운 검색 시 결과내 검색 상태 초기화 (API 재검색이 아닌 경우에만)
			if (!searchQuery.includes(' AND ')) {
				resultFilterQuery = '';
				filteredResults = [];
			}
		}
		
		if (dev) {
			console.group('🔍 [FRONTEND] 고급 검색 시작');
			console.log('검색어:', searchQuery);
			console.log('검색 필드:', searchField);
			console.log('정렬:', `${sortBy} ${sortOrder}`);
			console.log('페이지:', currentPage);
			console.log('페이지 크기:', resultsPerPage);
			console.log('파일 포함:', includeFiles);
			console.log('년도 범위:', startYear, '-', endYear);
		}
		
		try {
			// 고급 검색 옵션에 따른 쿼리 구성
			let finalQuery = searchQuery;
			
			// 필드별 검색
			if (searchField !== 'all') {
				switch (searchField) {
					case 'title':
						finalQuery = `title:"${searchQuery}"`;
						break;
					case 'author':
						finalQuery = `authorName:"${searchQuery}"`;
						break;
					case 'subject':
						finalQuery = `subject:"${searchQuery}"`;
						break;
				}
			}
			
			const requestBody: any = {
				query: finalQuery,
				per_page: resultsPerPage,
				start: (currentPage - 1) * resultsPerPage,
				sort: sortBy,
				order: sortOrder,
				include_files: includeFiles
			};
			
			// 년도 범위 필터
			if (startYear || endYear) {
				requestBody.year_range = {};
				if (startYear) requestBody.year_range.start = startYear;
				if (endYear) requestBody.year_range.end = endYear;
			}
			
			// 인스턴스 선택에 따른 검색 범위 설정
			if (selectedSpecificInstance && selectedInstanceInfo) {
				// 특정 인스턴스에서 검색
				requestBody.specific_instance = {
					id: selectedInstanceInfo.id,
					url: selectedInstanceInfo.url,
					apiUrl: selectedInstanceInfo.apiUrl,
					platformName: selectedInstanceInfo.platformName,
					country: selectedInstanceInfo.country,
					organization: selectedInstanceInfo.organization
				};
			} else {
				// 국가별 검색
				requestBody.country = selectedCountry;
			}
			
			if (dev) {
				console.log('요청 데이터:', requestBody);
			}
			
			const response = await fetch('/api/mcp/search', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody)
			});
			
			if (!response.ok) {
				throw new Error(`검색 API 오류: ${response.status} ${response.statusText}`);
			}
			
			const data = await response.json();
			
			if (dev) {
				console.log('응답 데이터:', data);
			}
			
			if (data.success && data.results) {
				const results = data.results.map((item: any) => ({
					id: item.id || `result-${Math.random()}`,
					title: item.title || item.name || 'Untitled',
					description: item.description || '설명이 없습니다.',
					url: item.url || '#',
					type: item.type || 'dataset',
					authors: item.authors || [],
					instance: item.instance || '알 수 없음',
					instanceUrl: item.instanceUrl,
					publishedAt: item.published_at,
					subjects: item.subjects || []
				}));
				
				searchResults = {
					items: results,
					total_count: data.total || results.length,
					metadata: {
						search_strategy: data.searchStrategy,
						search_time: data.searchTime,
						applied_filters: data.appliedFilters
					},
					suggestions: data.suggestions
				};
				
				totalResults = data.total || results.length;
				
				// 검색 메타데이터 업데이트
				searchMeta = {
					searchStrategy: data.searchStrategy || (selectedSpecificInstance && selectedInstanceInfo ? 'specific_instance' : 'country'),
					appliedFilters: data.appliedFilters || (selectedSpecificInstance && selectedInstanceInfo ? [`Instance: ${selectedInstanceInfo.platformName}`] : [`Country: ${selectedCountry}`]),
					suggestions: data.suggestions,
					searchTime: data.searchTime
				};
				
				if (dev) {
					console.log(`✅ 검색 성공: ${results.length}개 결과 (총 ${totalResults}개)`);
					console.log(`📊 페이지네이션 정보:`, {
						totalResults,
						resultsPerPage,
						totalPages: Math.ceil(totalResults / resultsPerPage),
						currentPage,
						showPagination: Math.ceil(totalResults / resultsPerPage) > 1
					});
				}
			} else {
				throw new Error(data.message || '검색 결과를 가져올 수 없습니다.');
			}
		} catch (error) {
			if (dev) {
				console.error('💥 검색 오류:', error);
			}
			console.error('검색 오류:', error);
			if (error instanceof Error) {
				alert(`검색 중 오류가 발생했습니다: ${error.message}`);
			}
		} finally {
			isLoading = false;
			if (dev) {
				console.groupEnd();
			}
		}
	}
	
	// 키보드 접근성을 위한 핸들러
	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			currentPage = 1; // 새 검색 시 첫 페이지로
			handleSearch();
		}
	}
	
	// 안전한 외부 링크 열기
	function safeOpenLink(url: string): void {
		if (url && url !== '#') {
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	}
	
	// 특정 인스턴스에서 검색하기
	async function searchInInstance(instance: DataverseInstance): Promise<void> {
		if (!searchQuery.trim()) return;
		
		isLoading = true;
		currentPage = 1;
		searchResults = null;
		totalResults = 0;
		
		if (dev) {
			console.log(`🔍 [${instance.country}] ${instance.platformName}에서 검색 시작`);
			console.log('인스턴스 URL:', instance.url);
			console.log('인스턴스 API URL:', instance.apiUrl);
		}
		
		try {
			// 개별 인스턴스 검색을 위한 요청 구성
			const requestBody: any = {
				query: searchQuery,
				per_page: resultsPerPage,
				start: (currentPage - 1) * resultsPerPage,
				sort: sortBy,
				order: sortOrder,
				include_files: includeFiles,
				// 특정 인스턴스 정보 전달
				specific_instance: {
					id: instance.id,
					url: instance.url,
					apiUrl: instance.apiUrl,
					platformName: instance.platformName,
					country: instance.country,
					organization: instance.organization
				}
			};
			
			// 고급 검색 옵션 적용
			if (searchField !== 'all') {
				switch (searchField) {
					case 'title':
						requestBody.query = `title:"${searchQuery}"`;
						break;
					case 'author':
						requestBody.query = `authorName:"${searchQuery}"`;
						break;
					case 'subject':
						requestBody.query = `subject:"${searchQuery}"`;
						break;
				}
			}
			
			// 년도 범위 필터
			if (startYear || endYear) {
				requestBody.year_range = {};
				if (startYear) requestBody.year_range.start = startYear;
				if (endYear) requestBody.year_range.end = endYear;
			}
			
			if (dev) {
				console.log('특정 인스턴스 검색 요청:', requestBody);
			}
			
			const response = await fetch('/api/mcp/search', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody)
			});
			
			if (!response.ok) {
				throw new Error(`검색 API 오류: ${response.status} ${response.statusText}`);
			}
			
			const data = await response.json();
			
			if (dev) {
				console.log('특정 인스턴스 검색 응답:', data);
			}
			
			if (data.success && data.results) {
				const results = data.results.map((item: any) => ({
					id: item.id || `result-${Math.random()}`,
					title: item.title || item.name || 'Untitled',
					description: item.description || '설명이 없습니다.',
					url: item.url || '#',
					type: item.type || 'dataset',
					authors: item.authors || [],
					instance: `${instance.platformName} (${instance.country})`,
					instanceUrl: instance.url,
					publishedAt: item.published_at,
					subjects: item.subjects || []
				}));
				
				searchResults = {
					items: results,
					total_count: data.total || results.length,
					metadata: {
						search_strategy: data.searchStrategy || 'specific_instance',
						search_time: data.searchTime,
						applied_filters: [`Instance: ${instance.platformName}`]
					},
					suggestions: data.suggestions
				};
				
				totalResults = data.total || results.length;
				
				// 검색 메타데이터 업데이트
				searchMeta = {
					searchStrategy: 'specific_instance',
					appliedFilters: [`Instance: ${instance.platformName}`],
					suggestions: data.suggestions,
					searchTime: data.searchTime
				};
				
				// selectedInstance는 변경하지 않음 (일반 검색에 영향을 주지 않기 위해)
				
				if (dev) {
					console.log(`✅ ${instance.platformName} 검색 성공: ${results.length}개 결과 (총 ${totalResults}개)`);
					console.log(`📊 특정 인스턴스 페이지네이션 정보:`, {
						totalResults,
						resultsPerPage,
						totalPages: Math.ceil(totalResults / resultsPerPage),
						currentPage,
						showPagination: Math.ceil(totalResults / resultsPerPage) > 1
					});
				}
			} else {
				throw new Error(data.message || '검색 결과를 가져올 수 없습니다.');
			}
		} catch (error) {
			if (dev) {
				console.error('💥 특정 인스턴스 검색 오류:', error);
			}
			console.error('인스턴스별 검색 오류:', error);
			if (error instanceof Error) {
				alert(`${instance.platformName} 검색 중 오류가 발생했습니다: ${error.message}`);
			}
		} finally {
			isLoading = false;
		}
	}
	
	// 인스턴스 더보기 상태
	let showAllInstances: boolean = $state(false);
	
	// 더 많은 인스턴스 보기 토글
	function toggleShowAllInstances(): void {
		showAllInstances = !showAllInstances;
	}
	
	// 클라이언트 사이드 결과내 검색
	function filterResults(): void {
		if (!searchResults?.items?.length) {
			filteredResults = [];
			return;
		}

		if (!resultFilterQuery.trim()) {
			// 필터 쿼리가 없으면 전체 결과 표시를 위해 filteredResults 초기화
			filteredResults = [];
			return;
		}

		const query = resultFilterQuery.toLowerCase();
		filteredResults = searchResults.items.filter(item => 
			item.title?.toLowerCase().includes(query) ||
			item.description?.toLowerCase().includes(query) ||
			item.authors?.some((author: string) => author.toLowerCase().includes(query)) ||
			item.subjects?.some((subject: string) => subject.toLowerCase().includes(query))
		);
		
		if (dev) {
			console.log(`🔍 클라이언트 필터링: "${resultFilterQuery}" -> ${filteredResults.length}개 결과`);
		}
	}
	
	// API 재검색 (결합된 쿼리로)
	async function reSearchWithFilter(): Promise<void> {
		if (!resultFilterQuery.trim() || !searchQuery.trim()) return;
		
		// 원래 검색어와 결과내 검색어를 결합
		const combinedQuery = `(${searchQuery}) AND (${resultFilterQuery})`;
		
		if (dev) {
			console.log(`🔍 API 재검색: "${combinedQuery}"`);
		}
		
		// 검색어를 완전히 업데이트하여 새로운 검색으로 처리
		searchQuery = combinedQuery;
		currentPage = 1; // 첫 페이지로 리셋
		
		// 결과내 검색 상태 초기화 (새로운 검색이므로)
		resultFilterQuery = '';
		filteredResults = [];
		
		// 새로운 검색 실행
		await handleSearch();
	}

	// CSV 변환 함수
	function convertToCSV(data: SearchResultItem[]): string {
		if (!data.length) return '';

		const headers = ['Title', 'Description', 'Authors', 'Type', 'Published Date', 'Subjects', 'URL'];
		const csvRows = [headers.join(',')];

		data.forEach(item => {
			const row = [
				`"${(item.title || '').replace(/"/g, '""')}"`,
				`"${(item.description || '').replace(/"/g, '""')}"`,
				`"${(item.authors || []).join('; ').replace(/"/g, '""')}"`,
				`"${item.type || ''}"`,
				`"${item.publishedAt || ''}"`,
				`"${(item.subjects || []).join('; ').replace(/"/g, '""')}"`,
				`"${item.url || ''}"`
			];
			csvRows.push(row.join(','));
		});

		return csvRows.join('\n');
	}

	// CSV 다운로드 함수
	function downloadCSV(content: string, filename: string): void {
		const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', filename);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	// 이벤트 핸들러 헬퍼 함수
	function handleSelectChange(event: Event, callback: (value: string) => void): void {
		const target = event.target as HTMLSelectElement;
		if (target) {
			callback(target.value);
			currentPage = 1;
		}
	}

	function handleInputChange(event: Event, callback: (value: number | undefined) => void): void {
		const target = event.target as HTMLInputElement;
		if (target) {
			callback(target.value ? Number(target.value) : undefined);
			currentPage = 1;
		}
	}

	function handleCheckboxChange(event: Event, callback: (checked: boolean) => void): void {
		const target = event.target as HTMLInputElement;
		if (target) {
			callback(target.checked);
			currentPage = 1;
		}
	}
</script>

<svelte:head>
	<title>Dataverse MCP Server - 전 세계 연구 데이터 AI 검색</title>
	<meta name="description" content="AI 에이전트를 위한 전 세계 Dataverse 검색 및 분석 플랫폼" />
</svelte:head>

<!-- 메인 컨테이너 -->
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
	<div class="container mx-auto px-4 py-8">
		<!-- 헤더 -->
		<header class="text-center mb-12">
			<h1 class="text-5xl font-bold text-white mb-4 gradient-text">
				Dataverse MCP Server
			</h1>
			<p class="text-xl text-white/80 max-w-2xl mx-auto mb-8">
				전 세계 {stats.active}개 연구 데이터 인스턴스를 AI의 힘으로 검색하고 분석하세요
			</p>
			
			<!-- 실시간 상태 표시 -->
			<div class="flex items-center justify-center gap-6 flex-wrap">
				<div class="glass-card px-4 py-2 flex items-center gap-2">
					<div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
					<span class="text-white/90 text-sm">MCP 서버 활성</span>
				</div>
				<div class="glass-card px-4 py-2 flex items-center gap-2">
					<Database class="w-4 h-4 text-cyan-400" />
					<span class="text-white/90 text-sm">{stats.active}개 인스턴스</span>
				</div>
				<div class="glass-card px-4 py-2 flex items-center gap-2">
					<Globe class="w-4 h-4 text-blue-400" />
					<span class="text-white/90 text-sm">{stats.countriesCount}개국</span>
				</div>
			</div>
		</header>

		<!-- 검색 섹션 -->
		<section class="max-w-6xl mx-auto mb-12">
			<div class="glass-card p-8">
				<h2 class="text-2xl font-semibold text-white mb-6 text-center">
					연구 데이터 검색
				</h2>
				
				<!-- 인스턴스 선택기 -->
				<InstanceSelector
					{selectedCountry}
					{selectedSpecificInstance}
					{isLoading}
					onCountryChange={(country) => {
						selectedCountry = country;
						currentPage = 1;
					}}
					onInstanceChange={(instanceUrl) => {
						selectedSpecificInstance = instanceUrl;
						currentPage = 1;
					}}
				/>
				
				<!-- 검색 폼 -->
				<SearchForm
					{searchQuery}
					{isLoading}
					{showAdvanced}
					{searchField}
					{sortBy}
					{sortOrder}
					{startYear}
					{endYear}
					{resultsPerPage}
					{includeFiles}
					onSearchQueryChange={(query) => searchQuery = query}
					onSearchSubmit={() => {
						currentPage = 1;
						handleSearch();
					}}
					onToggleAdvanced={toggleAdvanced}
					onAdvancedOptionsChange={(options) => {
						if (options.searchField !== undefined) searchField = options.searchField;
						if (options.sortBy !== undefined) sortBy = options.sortBy;
						if (options.sortOrder !== undefined) sortOrder = options.sortOrder;
						if (options.startYear !== undefined) startYear = options.startYear;
						if (options.endYear !== undefined) endYear = options.endYear;
						if (options.resultsPerPage !== undefined) resultsPerPage = options.resultsPerPage;
						if (options.includeFiles !== undefined) includeFiles = options.includeFiles;
						currentPage = 1;
					}}
				/>
			</div>
		</section>

		<!-- 검색 결과 -->
		{#if searchResults?.items && searchResults.items.length > 0}
			<section class="max-w-6xl mx-auto mb-12">
				<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
					<!-- 다른 Dataverse 인스턴스에서 검색 -->
						<div class="mb-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
							<h3 class="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
								🌍 다른 Dataverse 인스턴스에서 동일한 검색어로 검색
							</h3>
							<div class="flex flex-wrap gap-2">
								{#each allInstances.filter(instance => instance.url !== selectedSpecificInstance).slice(0, showAllInstances ? allInstances.filter(instance => instance.url !== selectedSpecificInstance).length : 12) as instance (instance.id)}
									<button
										type="button"
										onclick={() => searchInInstance(instance)}
										class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs rounded-full transition-colors duration-200 flex items-center gap-1 group"
										disabled={isLoading}
										title={`${instance.platformName} - ${instance.organization}`}
									>
										<Globe class="w-3 h-3 group-hover:text-cyan-400" />
										<span class="truncate max-w-[120px]">
											{instance.country} - {instance.platformName.split(' ')[0]}
										</span>
									</button>
								{/each}
								
								{#if allInstances.filter(instance => instance.url !== selectedSpecificInstance).length > 12}
									<button
										type="button"
										onclick={toggleShowAllInstances}
										class="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 text-xs rounded-full transition-colors duration-200"
										disabled={isLoading}
									>
										{#if showAllInstances}
											축소하기
										{:else}
											+{allInstances.filter(instance => instance.url !== selectedSpecificInstance).length - 12}개 더
										{/if}
									</button>
								{/if}
							</div>
							<div class="mt-2 text-xs text-white/50">
								💡 클릭하면 해당 인스턴스에서 "{searchQuery}" 검색이 실행됩니다.
							</div>
						</div>
					
					<!-- 검색 결과 헤더 -->
					<div class="mb-6">
						<div class="flex flex-wrap items-center justify-between gap-4 mb-4">
							<div class="flex flex-col gap-2">
								<h2 class="text-xl font-semibold text-white flex items-center gap-3">
									🎯 검색 결과
									{#if searchResults?.total_count !== undefined}
										<span class="text-cyan-400 text-lg">
											{searchResults.total_count.toLocaleString()}개
										</span>
									{/if}
								</h2>
								
								<!-- 현재 검색 범위 표시 -->
								<div class="flex items-center gap-2 text-sm text-white/70">
									<MapPin class="w-4 h-4 text-green-400" />
									<span>검색 범위: </span>
									{#if selectedSpecificInstance && selectedInstanceInfo}
										<span class="text-cyan-400 font-medium">
											{selectedInstanceInfo.platformName} ({selectedInstanceInfo.country})
										</span>
									{:else}
										<span class="text-green-400 font-medium">{selectedCountry}</span>
										<span class="text-white/50">
											({filteredInstances.length}개 인스턴스)
										</span>
									{/if}
								</div>
							</div>
							
							<!-- 결과 관리 버튼들 -->
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => {
										if (searchResults?.items) {
											const csvContent = convertToCSV(searchResults.items);
											downloadCSV(csvContent, `dataverse-search-${new Date().toISOString().split('T')[0]}.csv`);
										}
									}}
									class="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs rounded-lg transition-colors duration-200 flex items-center gap-2"
									disabled={isLoading || !searchResults?.items?.length}
								>
									📊 CSV 내보내기
								</button>
								<button
									type="button"
									onclick={() => {
										searchResults = null;
										currentPage = 1;
										totalResults = 0;
										filteredResults = [];
										resultFilterQuery = '';
									}}
									class="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg transition-colors duration-200 flex items-center gap-2"
									disabled={isLoading}
								>
									🗑️ 결과 지우기
								</button>
							</div>
						</div>

						<!-- 결과내 검색 -->
						<ResultsFilter
							filterQuery={resultFilterQuery}
							{isLoading}
							filteredCount={filteredResults.length}
							totalCount={searchResults?.items?.length || 0}
							onFilterChange={(query) => {
								resultFilterQuery = query;
								filterResults();
							}}
							onReSearch={reSearchWithFilter}
						/>

						<!-- 검색 메타데이터 -->
						{#if searchResults?.metadata}
							<div class="grid md:grid-cols-3 gap-4 mb-4 text-sm">
								<!-- 검색 전략 -->
								{#if searchResults.metadata.search_strategy}
									<div class="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3">
										<div class="flex items-center gap-2 text-blue-400 font-medium mb-1">
											🎯 검색 전략
										</div>
										<div class="text-white/80 capitalize">
											{searchResults.metadata.search_strategy}
										</div>
									</div>
								{/if}

								<!-- 검색 시간 -->
								{#if searchResults.metadata.search_time}
									<div class="bg-green-600/10 border border-green-600/20 rounded-lg p-3">
										<div class="flex items-center gap-2 text-green-400 font-medium mb-1">
											⏱️ 검색 시간
										</div>
										<div class="text-white/80">
											{(searchResults.metadata.search_time * 1000).toFixed(0)}ms
										</div>
									</div>
								{/if}

								<!-- 적용된 필터 -->
								{#if searchResults.metadata.applied_filters && searchResults.metadata.applied_filters.length > 0}
									<div class="bg-purple-600/10 border border-purple-600/20 rounded-lg p-3">
										<div class="flex items-center gap-2 text-purple-400 font-medium mb-1">
											🔧 적용된 필터
										</div>
										<div class="text-white/80 text-xs">
											{searchResults.metadata.applied_filters.join(', ')}
										</div>
									</div>
								{/if}
							</div>
						{/if}

						<!-- 검색 제안 -->
						{#if searchResults?.suggestions && searchResults.suggestions.length > 0}
							<div class="mb-4">
								<div class="text-sm text-white/80 mb-2">💡 검색 제안:</div>
								<div class="flex flex-wrap gap-2">
									{#each (searchResults?.suggestions || []).slice(0, 6) as suggestion}
										<button
											type="button"
											onclick={() => {
												searchQuery = suggestion;
												handleSearch();
											}}
											class="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 text-xs rounded-full transition-colors duration-200"
											disabled={isLoading}
										>
											{suggestion}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- 페이지네이션 (클라이언트 필터링 중일 때는 숨김) -->
					{#if !resultFilterQuery.trim()}
						<Pagination
							{currentPage}
							{totalPages}
							{totalResults}
							{resultsPerPage}
							{isLoading}
							onPageChange={goToPage}
							onPageSizeChange={(size) => {
								resultsPerPage = size;
								currentPage = 1;
								handleSearch();
							}}
						/>
					{:else}
						<!-- 클라이언트 필터링 중일 때 안내 메시지 -->
						<div class="text-center py-4 text-white/60 text-sm">
							💡 결과내 검색 중입니다. 페이지네이션은 API 재검색(🔍) 또는 필터 해제 후 이용 가능합니다.
						</div>
					{/if}

					<!-- 검색 결과 카드들 -->
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each (resultFilterQuery.trim() && filteredResults.length > 0 ? filteredResults : (searchResults?.items || [])) as result (result.id)}
							<article class="glass-card p-6 hover:scale-105 transition-transform duration-300">
								<header class="mb-4">
									<h3 class="text-lg font-semibold text-white mb-2 line-clamp-2">
										{result.title}
									</h3>
									<div class="flex items-center gap-2 mb-2">
										<Database class="w-4 h-4 text-cyan-400" aria-hidden="true" />
										<span class="text-cyan-400 text-sm">
											{result.type}
										</span>
										{#if result.instance}
											<span class="text-white/60 text-xs">
												• {result.instance}
											</span>
										{/if}
									</div>
									{#if result.publishedAt}
										<div class="flex items-center gap-1 text-white/60 text-xs mb-2">
											<Calendar class="w-3 h-3" />
											{new Date(result.publishedAt).toLocaleDateString('ko-KR')}
										</div>
									{/if}
								</header>
								
								<p class="text-white/80 text-sm mb-4 line-clamp-3">
									{result.description}
								</p>
								
								{#if result.authors && result.authors.length > 0}
									<div class="mb-3 flex items-center gap-1">
										<Users class="w-3 h-3 text-white/60" />
										<span class="text-white/60 text-xs">저자: </span>
										<span class="text-white/80 text-xs">
											{result.authors.slice(0, 3).join(', ')}
											{#if result.authors.length > 3}
												외 {result.authors.length - 3}명
											{/if}
										</span>
									</div>
								{/if}

								{#if result.subjects && result.subjects.length > 0}
									<div class="mb-4 flex flex-wrap gap-1">
										{#each result.subjects.slice(0, 3) as subject}
											<span class="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full">
												{subject}
											</span>
										{/each}
									</div>
								{/if}
								
								<button
									type="button"
									onclick={() => safeOpenLink(result.url)}
									class="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
								>
									<ExternalLink class="w-4 h-4" aria-hidden="true" />
									자세히 보기
								</button>
							</article>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- 지원 인스턴스 목록 -->
		<section class="max-w-6xl mx-auto mb-12">
			<h2 class="text-3xl font-bold text-white text-center mb-8">지원하는 Dataverse 인스턴스</h2>
			
			<div class="glass-card p-6">
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each countries as country (country)}
						{@const countryInstances = getInstancesByCountry(country)}
						<div class="bg-white/5 rounded-lg p-4">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<MapPin class="w-4 h-4 text-blue-400" />
								{country} ({countryInstances.length}개)
							</h3>
							<ul class="space-y-1">
								{#each countryInstances as instance (instance.id)}
									<li class="text-white/70 text-sm">
										• {instance.platformName}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 주요 기능 소개 -->
		<section class="max-w-6xl mx-auto mb-12">
			<h2 class="text-3xl font-bold text-white text-center mb-12">주요 기능</h2>
			
			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				<div class="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
					<div class="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<Search class="w-8 h-8 text-cyan-400" aria-hidden="true" />
					</div>
					<h3 class="text-xl font-semibold text-white mb-3">AI 기반 검색</h3>
					<p class="text-white/80 text-sm">
						자연어로 검색하고 AI가 관련된 연구 데이터를 정확하게 찾아드립니다.
					</p>
				</div>

				<div class="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
					<div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<Globe class="w-8 h-8 text-blue-400" aria-hidden="true" />
					</div>
					<h3 class="text-xl font-semibold text-white mb-3">통합 검색</h3>
					<p class="text-white/80 text-sm">
						전 세계 {stats.active}개 Dataverse 인스턴스를 하나의 인터페이스로 통합 검색합니다.
					</p>
				</div>

				<div class="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
					<div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<Settings class="w-8 h-8 text-purple-400" aria-hidden="true" />
					</div>
					<h3 class="text-xl font-semibold text-white mb-3">MCP 호환</h3>
					<p class="text-white/80 text-sm">
						Claude, ChatGPT 등 다양한 AI 도구에서 바로 사용 가능합니다.
					</p>
				</div>
			</div>
		</section>

		<!-- 빠른 시작 가이드 -->
		<section class="max-w-6xl mx-auto">
			<h2 class="text-3xl font-bold text-white text-center mb-12">빠른 시작 가이드</h2>

			<div class="glass-card p-8">
				
				
				<div class="space-y-6">
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
								<Code class="w-5 h-5 text-green-400" aria-hidden="true" />
								1. MCP 서버 설정
							</h3>
							<div class="bg-black/30 rounded-lg p-4 text-sm text-gray-300 font-mono">
								<pre><code>{JSON.stringify({
									"mcpServers": {
										"dataverse-mcp": {
											"command": "npx",
											"args": ["mcp-remote@next", "https://your-domain.vercel.app/api/mcp"]
										}
									}
								}, null, 2)}</code></pre>
							</div>
						</div>
						
						<div>
							<h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
								<BookOpen class="w-5 h-5 text-blue-400" aria-hidden="true" />
								2. AI 도구에서 사용
							</h3>
							<div class="space-y-3">
								<div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
									<p class="text-white/90 text-sm italic">
										"COVID-19 관련 연구 데이터를 찾아서 분석해줘"
									</p>
								</div>
								<div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
									<p class="text-white/90 text-sm italic">
										"기후변화 데이터에서 최신 트렌드를 알려줘"
									</p>
								</div>
								<div class="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
									<p class="text-white/90 text-sm italic">
										"경제 데이터셋을 찾아서 요약해줘"
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>
