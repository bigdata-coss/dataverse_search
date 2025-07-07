<script lang="ts">
	import { Globe, ChevronDown, Check } from 'lucide-svelte';
	import { currentLanguage, supportedLanguages, changeLanguage, type SupportedLanguage } from '$lib/i18n/index.js';

	// 언어 표시명 매핑
	const languageNames: Record<SupportedLanguage, string> = {
		ko: '한국어',
		en: 'English',
		ja: '日本語',
		zh: '中文',
		es: 'Español'
	};

	let isOpen = $state(false);

	function toggleDropdown(): void {
		isOpen = !isOpen;
	}

	function closeDropdown(): void {
		isOpen = false;
	}

	function selectLanguage(lang: SupportedLanguage): void {
		changeLanguage(lang);
		closeDropdown();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			closeDropdown();
		}
	}
</script>

<svelte:window onclick={closeDropdown} onkeydown={handleKeydown} />

<div class="relative inline-block text-left">
	<button
		type="button"
		onclick={(e) => {
			e.stopPropagation();
			toggleDropdown();
		}}
		class="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
		aria-haspopup="true"
		aria-expanded={isOpen}
	>
		<Globe class="w-4 h-4" aria-hidden="true" />
		<span>{languageNames[$currentLanguage]}</span>
		<ChevronDown class="w-4 h-4" aria-hidden="true" />
	</button>

	{#if isOpen}
		<div class="absolute right-0 mt-2 w-48 origin-top-right bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50">
			<div class="py-1" role="menu" aria-orientation="vertical">
				{#each supportedLanguages as lang}
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							selectLanguage(lang);
						}}
						class="flex items-center justify-between w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
						role="menuitem"
					>
						<span>{languageNames[lang]}</span>
						{#if lang === $currentLanguage}
							<Check class="w-4 h-4 text-cyan-400" aria-hidden="true" />
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* 모바일에서 드롭다운 위치 조정 */
	@media (max-width: 640px) {
	}
</style> 