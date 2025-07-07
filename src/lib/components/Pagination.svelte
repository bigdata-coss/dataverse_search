<script lang="ts">
	// 다국어 지원 추가
	import { t } from '$lib/stores/language.js';
	
	interface Props {
		currentPage: number;
		totalPages: number;
		totalResults: number;
		resultsPerPage: number;
		isLoading: boolean;
		onPageChange: (page: number) => void;
		onPageSizeChange: (size: number) => void;
	}
	
	let { currentPage, totalPages, totalResults, resultsPerPage, isLoading, onPageChange, onPageSizeChange }: Props = $props();
	
	let pageJumpValue: number | undefined = $state(undefined);
	
	// 페이지 번호 생성
	function getPageNumbers(): (number | string)[] {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	}
	
	// 페이지 점프
	function jumpToPage(): void {
		if (pageJumpValue && pageJumpValue >= 1 && pageJumpValue <= totalPages) {
			onPageChange(pageJumpValue);
			pageJumpValue = undefined;
		}
	}
	
	// 키보드 이벤트 핸들러
	function handleJumpKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			jumpToPage();
		}
	}
	
	// 페이지 크기 변경
	function handlePageSizeChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		onPageSizeChange(Number(target.value));
	}
</script>

{#if totalPages > 1}
	<!-- 고급 페이지네이션 -->
	<div class="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<!-- 페이지 정보 -->
			<div class="text-sm text-white/80">
				📄 {t('pagination.page_info', { current: currentPage, total: totalPages })}
				({t('pagination.total_results', { count: totalResults.toLocaleString() })})
			</div>

			<!-- 페이지 점프 -->
			<div class="flex items-center gap-2">
				<span class="text-xs text-white/60">{t('pagination.page_jump_label')}</span>
				<input
					type="number"
					bind:value={pageJumpValue}
					onkeydown={handleJumpKeyDown}
					placeholder={currentPage.toString()}
					min="1"
					max={totalPages}
					class="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-400"
				/>
				<button
					type="button"
					onclick={jumpToPage}
					class="px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 text-xs rounded transition-colors duration-200"
					disabled={isLoading}
				>
					{t('pagination.page_jump_button')}
				</button>
			</div>

			<!-- 페이지 크기 변경 -->
			<div class="flex items-center gap-2">
				<span class="text-xs text-white/60">{t('pagination.page_size_label')}</span>
				<select
					bind:value={resultsPerPage}
					onchange={handlePageSizeChange}
					class="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
					disabled={isLoading}
				>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
					<option value={100}>100</option>
				</select>
			</div>
		</div>

		<!-- 페이지네이션 버튼들 -->
		<div class="flex items-center justify-center gap-2 mt-4">
			<!-- 첫 페이지 -->
			<button
				type="button"
				onclick={() => onPageChange(1)}
				disabled={currentPage === 1 || isLoading}
				class="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 text-white text-sm rounded transition-colors duration-200 flex items-center gap-1"
			>
				⏮️ {t('pagination.first')}
			</button>

			<!-- 이전 페이지 -->
			<button
				type="button"
				onclick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1 || isLoading}
				class="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 text-white text-sm rounded transition-colors duration-200 flex items-center gap-1"
			>
				⬅️ {t('pagination.previous')}
			</button>

			<!-- 페이지 번호들 -->
			{#each getPageNumbers() as pageNum}
				{#if pageNum === '...'}
					<span class="px-3 py-2 text-white/40 text-sm">...</span>
				{:else}
					<button
						type="button"
						onclick={() => onPageChange(typeof pageNum === 'number' ? pageNum : parseInt(pageNum.toString()))}
						disabled={isLoading}
						class="px-3 py-2 {currentPage === pageNum ? 'bg-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'} text-sm rounded transition-colors duration-200"
					>
						{pageNum}
					</button>
				{/if}
			{/each}

			<!-- 다음 페이지 -->
			<button
				type="button"
				onclick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages || isLoading}
				class="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 text-white text-sm rounded transition-colors duration-200 flex items-center gap-1"
			>
				{t('pagination.next')} ➡️
			</button>

			<!-- 마지막 페이지 -->
			<button
				type="button"
				onclick={() => onPageChange(totalPages)}
				disabled={currentPage === totalPages || isLoading}
				class="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 text-white text-sm rounded transition-colors duration-200 flex items-center gap-1"
			>
				{t('pagination.last')} ⏭️
			</button>
		</div>
	</div>
{/if} 