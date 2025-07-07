<script lang="ts">
	import { getInstancesByCountry, getActiveInstances, type DataverseInstance } from '$lib/data/dataverse-instances.js';
	import { t } from '$lib/i18n/index.js';
	
	interface Props {
		selectedCountry: string;
		selectedSpecificInstance: string;
		isLoading: boolean;
		onCountryChange: (country: string) => void;
		onInstanceChange: (instanceUrl: string) => void;
	}
	
	let { selectedCountry, selectedSpecificInstance, isLoading, onCountryChange, onInstanceChange }: Props = $props();
	
	// 전 세계 인스턴스와 국가 목록
	const allInstances = getActiveInstances();
	const countries = $derived.by(() => {
		const countrySet = new Set(allInstances.map(instance => instance.country));
		return Array.from(countrySet).sort();
	});
	
	// 선택된 국가의 인스턴스 목록
	const filteredInstances = $derived.by(() => {
		return getInstancesByCountry(selectedCountry);
	});
	
	// 국가 변경 핸들러
	function handleCountryChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		const newCountry = target.value;
		
		// 국가 변경
		onCountryChange(newCountry);
		
		// 해당 국가의 첫 번째 인스턴스를 자동 선택
		const countryInstances = getInstancesByCountry(newCountry);
		if (countryInstances.length > 0) {
			onInstanceChange(countryInstances[0].url);
		}
	}
	
	// 인스턴스 변경 핸들러
	function handleInstanceChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		onInstanceChange(target.value);
	}
</script>

<!-- 검색 범위 선택 -->
<div class="grid md:grid-cols-2 gap-4 mb-6">
	<!-- 국가 선택 -->
	<div>
		<label for="country-select" class="block text-white/80 text-sm mb-2">
			{t('search.country_label')}
		</label>
		<select
			id="country-select"
			bind:value={selectedCountry}
			onchange={handleCountryChange}
			class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
			disabled={isLoading}
		>
			{#each countries as country (country)}
				<option value={country}>{country}</option>
			{/each}
		</select>
	</div>
	
	<!-- 특정 인스턴스 선택 -->
	<div>
		<label for="instance-select" class="block text-white/80 text-sm mb-2">
			{t('search.instance_label')}
		</label>
		<select
			id="instance-select"
			bind:value={selectedSpecificInstance}
			onchange={handleInstanceChange}
			class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
			disabled={isLoading}
		>
			{#each filteredInstances as instance (instance.id)}
				<option value={instance.url}>
					{instance.platformName} ({instance.organization})
				</option>
			{/each}
		</select>
	</div>
</div> 