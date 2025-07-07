<script lang="ts">
	import { Search, Settings, ChevronDown, ChevronUp } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.js';
	
	interface Props {
		searchQuery: string;
		isLoading: boolean;
		showAdvanced: boolean;
		searchField: 'all' | 'title' | 'author' | 'subject';
		sortBy: 'date' | 'name';
		sortOrder: 'asc' | 'desc';
		startYear?: number;
		endYear?: number;
		resultsPerPage: number;
		includeFiles: boolean;
		onSearchQueryChange: (query: string) => void;
		onSearchSubmit: () => void;
		onToggleAdvanced: () => void;
		onAdvancedOptionsChange: (options: {
			searchField?: 'all' | 'title' | 'author' | 'subject';
			sortBy?: 'date' | 'name';
			sortOrder?: 'asc' | 'desc';
			startYear?: number;
			endYear?: number;
			resultsPerPage?: number;
			includeFiles?: boolean;
		}) => void;
	}
	
	let { 
		searchQuery, 
		isLoading, 
		showAdvanced, 
		searchField, 
		sortBy, 
		sortOrder, 
		startYear, 
		endYear, 
		resultsPerPage, 
		includeFiles,
		onSearchQueryChange,
		onSearchSubmit,
		onToggleAdvanced,
		onAdvancedOptionsChange
	}: Props = $props();
	
	// 검색어 변경 핸들러
	function handleSearchInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		onSearchQueryChange(target.value);
	}
	
	// 키보드 이벤트 핸들러
	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			onSearchSubmit();
		}
	}
	
	// 고급 옵션 변경 핸들러들
	function handleSelectChange(field: string, event: Event): void {
		const target = event.target as HTMLSelectElement;
		onAdvancedOptionsChange({ [field]: target.value });
	}
	
	function handleNumberChange(field: string, event: Event): void {
		const target = event.target as HTMLInputElement;
		onAdvancedOptionsChange({ [field]: target.value ? Number(target.value) : undefined });
	}
	
	function handleCheckboxChange(field: string, event: Event): void {
		const target = event.target as HTMLInputElement;
		onAdvancedOptionsChange({ [field]: target.checked });
	}
	
	// 옵션 초기화
	function resetOptions(): void {
		onAdvancedOptionsChange({
			searchField: 'all',
			sortBy: 'date',
			sortOrder: 'desc',
			startYear: undefined,
			endYear: undefined,
			resultsPerPage: 20,
			includeFiles: false
		});
	}
</script>

<!-- 검색 입력 -->
<div class="relative mb-6">
	<label for="search-input" class="sr-only">{t('search.input_label')}</label>
	<input
		id="search-input"
		type="text"
		bind:value={searchQuery}
		oninput={handleSearchInput}
		onkeydown={handleKeyDown}
		placeholder={t('search.placeholder')}
		class="w-full text-lg pl-16 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
		disabled={isLoading}
	/>
	<Search class="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" aria-hidden="true" />
</div>

<!-- 고급 검색 옵션 토글 -->
<div class="mb-6">
	<button
		type="button"
		onclick={onToggleAdvanced}
		class="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 text-sm"
		disabled={isLoading}
	>
		<Settings class="w-4 h-4" />
		{t('search.advanced.toggle')}
		{#if showAdvanced}
			<ChevronUp class="w-4 h-4" />
		{:else}
			<ChevronDown class="w-4 h-4" />
		{/if}
	</button>

	{#if showAdvanced}
		<div class="mt-4 p-6 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
			<!-- 상단: 검색 필드와 정렬 -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<!-- 검색 필드 -->
				<div>
					<label for="search-field" class="block text-white/80 text-sm mb-2 font-medium">
						🎯 {t('search.advanced.field')}
					</label>
					<select
						id="search-field"
						bind:value={searchField}
						onchange={(e) => handleSelectChange('searchField', e)}
						class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
						disabled={isLoading}
					>
						<option value="all">🔍 {t('search.advanced.field_all')}</option>
						<option value="title">📝 {t('search.advanced.field_title')}</option>
						<option value="author">👤 {t('search.advanced.field_author')}</option>
						<option value="subject">📚 {t('search.advanced.field_subject')}</option>
					</select>
				</div>

				<!-- 정렬 기준 -->
				<div>
					<label for="sort-by" class="block text-white/80 text-sm mb-2 font-medium">
						📊 {t('search.advanced.sort')}
					</label>
					<select
						id="sort-by"
						bind:value={sortBy}
						onchange={(e) => handleSelectChange('sortBy', e)}
						class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
						disabled={isLoading}
					>
						<option value="date">📅 {t('search.advanced.sort_date')}</option>
						<option value="name">🔤 {t('search.advanced.sort_name')}</option>
					</select>
				</div>

				<!-- 정렬 순서 -->
				<div>
					<label for="sort-order" class="block text-white/80 text-sm mb-2 font-medium">
						⬆️ {t('search.advanced.order')}
					</label>
					<select
						id="sort-order"
						bind:value={sortOrder}
						onchange={(e) => handleSelectChange('sortOrder', e)}
						class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
						disabled={isLoading}
					>
						<option value="desc">⬇️ {t('search.advanced.order_desc')}</option>
						<option value="asc">⬆️ {t('search.advanced.order_asc')}</option>
					</select>
				</div>
			</div>

			<!-- 중단: 년도 범위와 페이지 설정 -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<!-- 시작 년도 -->
				<div>
					<label for="start-year" class="block text-white/80 text-sm mb-2 font-medium">
						📅 {t('search.advanced.start_year')}
					</label>
					<input
						id="start-year"
						type="number"
						bind:value={startYear}
						onchange={(e) => handleNumberChange('startYear', e)}
						placeholder={t('search.advanced.start_year_placeholder')}
						min="1900"
						max="2024"
						class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
						disabled={isLoading}
					/>
				</div>

				<!-- 종료 년도 -->
				<div>
					<label for="end-year" class="block text-white/80 text-sm mb-2 font-medium">
						📅 {t('search.advanced.end_year')}
					</label>
					<input
						id="end-year"
						type="number"
						bind:value={endYear}
						onchange={(e) => handleNumberChange('endYear', e)}
						placeholder={t('search.advanced.end_year_placeholder')}
						min="1900"
						max="2024"
						class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
						disabled={isLoading}
					/>
				</div>

				<!-- 페이지 크기 -->
				<div>
					<label for="results-per-page" class="block text-white/80 text-sm mb-2 font-medium">
						📄 {t('search.advanced.results_per_page')}
					</label>
					<select
						id="results-per-page"
						bind:value={resultsPerPage}
						onchange={(e) => handleSelectChange('resultsPerPage', e)}
						class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
						disabled={isLoading}
					>
						<option value={10}>📋 10{t('ui.count_suffix')}</option>
						<option value={20}>📋 20{t('ui.count_suffix')}</option>
						<option value={50}>📋 50{t('ui.count_suffix')}</option>
						<option value={100}>📋 100{t('ui.count_suffix')}</option>
					</select>
				</div>
			</div>

			<!-- 하단: 추가 옵션들 -->
			<div class="flex flex-wrap items-center gap-6">
				<!-- 파일 포함 체크박스 -->
				<label class="flex items-center gap-3 text-white/80 text-sm cursor-pointer">
					<input
						type="checkbox"
						bind:checked={includeFiles}
						onchange={(e) => handleCheckboxChange('includeFiles', e)}
						class="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2 accent-cyan-400"
						disabled={isLoading}
					/>
					<span class="flex items-center gap-2">
						📁 {t('search.advanced.include_files')}
					</span>
				</label>

				<!-- 검색 옵션 리셋 -->
				<button
					type="button"
					onclick={resetOptions}
					class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm rounded-lg transition-colors duration-200 flex items-center gap-2"
					disabled={isLoading}
				>
					🔄 {t('search.advanced.reset')}
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- 검색 버튼 -->
<button
	type="button"
	onclick={onSearchSubmit}
	disabled={isLoading || !searchQuery.trim()}
	class="w-full py-4 text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-3"
>
	{#if isLoading}
		<div class="loading-spinner w-5 h-5" aria-hidden="true"></div>
		{t('common.loading')}
	{:else}
		<Search class="w-5 h-5" aria-hidden="true" />
		{t('search.button')}
	{/if}
</button> 