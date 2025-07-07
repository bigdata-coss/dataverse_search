import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// 번역 데이터 직접 임포트
import koTranslations from './translations/ko.js';
import enTranslations from './translations/en.js';
import jaTranslations from './translations/ja.js';
import zhTranslations from './translations/zh.js';
import esTranslations from './translations/es.js';

// 지원하는 언어 목록
export const supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

// 모든 번역 데이터
const allTranslations = {
	ko: koTranslations,
	en: enTranslations,
	ja: jaTranslations,
	zh: zhTranslations,
	es: esTranslations
};

// 브라우저 언어 감지 함수
function detectBrowserLanguage(): SupportedLanguage {
	if (!browser) return 'ko'; // SSR에서는 기본값
	
	const browserLang = navigator.language.toLowerCase();
	
	// 정확한 매칭 시도
	for (const lang of supportedLanguages) {
		if (browserLang === lang || browserLang.startsWith(`${lang}-`)) {
			return lang;
		}
	}
	
	// 부분 매칭 시도
	if (browserLang.includes('zh') || browserLang.includes('cn')) return 'zh';
	if (browserLang.includes('ja')) return 'ja';
	if (browserLang.includes('es')) return 'es';
	if (browserLang.includes('en')) return 'en';
	
	return 'ko'; // 기본값
}

// 저장된 언어 또는 자동 감지된 언어 가져오기
function getInitialLanguage(): SupportedLanguage {
	if (!browser) return 'ko';
	
	const stored = localStorage.getItem('dataverse-language') as SupportedLanguage;
	if (stored && supportedLanguages.includes(stored)) {
		return stored;
	}
	
	return detectBrowserLanguage();
}

// 초기 언어 설정
const initialLanguage = getInitialLanguage();

// 현재 언어 store
export const currentLanguage = writable<SupportedLanguage>(initialLanguage);

// 번역 데이터 store - 초기값으로 현재 언어의 번역 데이터 설정
export const translations = writable<any>(allTranslations[initialLanguage]);

// 언어 변경 함수 - 언어와 번역 데이터를 동시에 업데이트
export function changeLanguage(lang: SupportedLanguage): void {
	if (!supportedLanguages.includes(lang)) {
		console.warn(`Unsupported language: ${lang}`);
		return;
	}
	
	currentLanguage.set(lang);
	translations.set(allTranslations[lang]);
	
	// 언어 변경 트리거 업데이트 - 모든 컴포넌트가 다시 렌더링되도록 함
	languageChangeId.set(Date.now());
	
	if (browser) {
		localStorage.setItem('dataverse-language', lang);
		console.log(`Language changed to: ${lang}`); // 디버깅용
	}
}

// 언어 변경 트리거 - 컴포넌트들이 다시 렌더링되도록 함
export const languageChangeId = writable<number>(0);

// 번역 함수 - reactive한 store를 사용하도록 수정
export function t(key: string, params: Record<string, any> = {}): string {
	// 브라우저 환경에서만 languageChangeId를 구독하여 강제 업데이트
	if (browser) {
		get(languageChangeId); // 이 값이 변경될 때마다 함수가 다시 실행됨
	}
	
	// get()을 사용하여 현재 store 값 가져오기
	const currentTranslations = get(translations);
	
	// 번역 데이터가 없으면 키 반환
	if (!currentTranslations || Object.keys(currentTranslations).length === 0) {
		return key;
	}
	
	// 키로 번역 찾기
	const keys = key.split('.');
	let value = currentTranslations;
	
	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k];
		} else {
			// 번역을 찾지 못한 경우 - 개발 환경에서만 경고
			if (browser && window.location.hostname === 'localhost') {
				console.warn(`Translation key not found: ${key}`);
			}
			return key;
		}
	}
	
	if (typeof value !== 'string') {
		if (browser && window.location.hostname === 'localhost') {
			console.warn(`Translation value is not a string: ${key}`);
		}
		return key;
	}
	
	// 매개변수 치환
	let result = value;
	for (const [param, paramValue] of Object.entries(params)) {
		const placeholder = `{${param}}`;
		result = result.replace(new RegExp(placeholder, 'g'), String(paramValue));
	}
	
	return result;
}



// 초기 번역 로드 (브라우저에서만) - 즉시 실행
if (browser) {
	const initialLang = getInitialLanguage();
	currentLanguage.set(initialLang);
	translations.set(allTranslations[initialLang]);
} 