<script lang="ts">
	// 전역 CSS 임포트
	import '../app.css';
	import { onMount } from 'svelte';
	import { currentLanguage, loadTranslations, translations } from '$lib/stores/language.js';

	// 언어 초기화
	onMount(async () => {
		const lang = $currentLanguage;
		try {
			const translationData = await loadTranslations(lang);
			translations.set(translationData);
		} catch (error) {
			console.error('번역 데이터 로드 실패:', error);
		}
	});
</script>

<!-- 메인 콘텐츠 영역 -->
<main id="main-content" class="min-h-screen">
	<slot />
</main> 