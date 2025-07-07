import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// 지원하는 언어 목록
export const supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

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

// 현재 언어 store
export const currentLanguage = writable<SupportedLanguage>(getInitialLanguage());

// 번역 데이터 store - 기본값으로 빈 객체 대신 최소한의 폴백 제공
export const translations = writable<any>({});

// 번역 파일 로드 함수
export async function loadTranslations(lang: SupportedLanguage): Promise<any> {
	try {
		const response = await fetch(`/locales/${lang}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load ${lang} translations`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(`Error loading ${lang} translations:`, error);
		// 폴백으로 한국어 로드 시도
		if (lang !== 'ko') {
			return loadTranslations('ko');
		}
		return {};
	}
}

// 언어 변경 함수
export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
	if (!supportedLanguages.includes(lang)) {
		console.warn(`Unsupported language: ${lang}`);
		return;
	}
	
	currentLanguage.set(lang);
	
	if (browser) {
		localStorage.setItem('dataverse-language', lang);
	}
	
	try {
		const translationData = await loadTranslations(lang);
		translations.set(translationData);
	} catch (error) {
		console.error('Failed to change language:', error);
	}
}

// 매개변수가 있는 번역 함수 - get() 사용으로 수정
export function t(key: string, params: Record<string, any> = {}): string {
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
	
	// 즉시 번역 데이터 로드 시작
	loadTranslations(initialLang).then(data => {
		translations.set(data);
	}).catch(error => {
		console.error('Failed to load initial translations:', error);
		// 에러 시에도 빈 객체 설정
		translations.set({});
	});
} 