<script lang="ts">
	// 전역 CSS 임포트
	import '../app.css';
	
	// 새로운 i18n 시스템은 자동으로 번역 데이터를 로드하므로 별도 초기화 불필요
</script>

<!-- 메인 콘텐츠 영역 -->
<main id="main-content" class="min-h-screen">
	<slot />
</main> 