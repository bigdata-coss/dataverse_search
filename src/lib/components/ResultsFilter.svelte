<script lang="ts">
	import { Search } from 'lucide-svelte';
	// 다국어 지원 추가
	import { t } from '$lib/stores/language.js';
	
	interface Props {
		filterQuery: string;
		isLoading: boolean;
		filteredCount: number;
		totalCount: number;
		onFilterChange: (query: string) => void;
		onReSearch: () => void;
	}
	
	let { filterQuery, isLoading, filteredCount, totalCount, onFilterChange, onReSearch }: Props = $props();
	
	// 입력 변경 핸들러 (클라이언트 사이드 필터링)
	function handleInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		onFilterChange(target.value);
	}
	
	// 지우기 핸들러
	function handleClear(): void {
		onFilterChange('');
	}
	
	// 키보드 이벤트 핸들러 (Enter 키로 재검색)
	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && filterQuery.trim()) {
			event.preventDefault();
			onReSearch();
		}
	}
</script>

<!-- 결과내 검색 -->
<div class="mb-4">
	<div class="relative">
		<Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
		<input
			type="text"
			bind:value={filterQuery}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			placeholder={t('filter.placeholder')}
			class="w-full pl-12 pr-24 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
			disabled={isLoading}
		/>
		
		<!-- 오른쪽 버튼들 -->
		<div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
			{#if filterQuery}
				<!-- 재검색 버튼 -->
				<button
					type="button"
					onclick={onReSearch}
					class="px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 text-xs rounded transition-colors duration-200"
					disabled={isLoading}
					title={t('filter.search_tooltip')}
				>
					🔍
				</button>
				<!-- 지우기 버튼 -->
				<button
					type="button"
					onclick={handleClear}
					class="px-2 py-1 text-white/40 hover:text-white/80 text-xs"
					title={t('filter.clear_tooltip')}
				>
					✕
				</button>
			{/if}
		</div>
	</div>
	
	{#if filterQuery && filteredCount !== totalCount}
		<div class="mt-2 text-xs text-white/60">
			📊 {t('filter.filtered_info', { filtered: filteredCount, total: totalCount })}
			{#if filterQuery.trim()}
				<span class="text-white/40 ml-2">
					• {t('filter.api_search_hint')}
				</span>
			{/if}
		</div>
	{/if}
</div> 