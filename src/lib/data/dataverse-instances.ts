/**
 * 전 세계 Dataverse 인스턴스 정보
 * @description 사용자가 제공한 전 세계 Dataverse 플랫폼들의 메타데이터
 */

export interface DataverseInstance {
	readonly id: number;
	readonly organization: string;
	readonly platformName: string;
	readonly country: string;
	readonly description: string;
	readonly url: string;
	readonly apiUrl: string; // API 엔드포인트
	readonly isActive: boolean; // 서비스 활성 상태
}

export const GLOBAL_DATAVERSE_INSTANCES: readonly DataverseInstance[] = [
	{
		id: 1,
		organization: "Agencia Nacional de Investigación e Innovación (ANII)",
		platformName: "Repositorio de Datos Abiertos de Investigación (Redata)",
		country: "Uruguay",
		description: "우루과이 오픈 연구 데이터 리포지토리(Redata)는 국가 연구 데이터의 공개와 재활용을 장려하기 위한 플랫폼이다. 이는 우루과이 국립연구혁신청(ANII)이 주도하는 프로젝트로, 국가 과학기술 디지털 오픈 리포지토리 시스템(SILO)의 일환",
		url: "https://redata.anii.org.uy/",
		apiUrl: "https://redata.anii.org.uy/api/search",
		isActive: true
	},
	{
		id: 2,
		organization: "Australian Data Archive",
		platformName: "ADA Dataverse",
		country: "Australia",
		description: "호주 데이터 아카이브(Australian Data Archive)는 디지털 연구 데이터의 수집, 보존, 출판 및 접근을 위한 국가 서비스를 제공한다. 이는 호주의 연구 데이터 인프라를 통합적으로 관리하고 활용하기 위한 핵심 플랫폼으로서의 역할을 수행한다.",
		url: "http://dataverse.ada.edu.au/",
		apiUrl: "http://dataverse.ada.edu.au/api/search",
		isActive: true
	},
	{
		id: 3,
		organization: "CEDIA",
		platformName: "Indata",
		country: "Ecuador",
		description: "CEDIA 연구 데이터 리포지토리는 소속 학자와 연구자들이 생산한 연구 데이터를 보존하고 배포하며 접근을 제공하는 시스템이다. 본 리포지토리는 연구 데이터의 가시성을 높이기 위해 데이터의 보존을 보장하고 접근과 재사용을 용이하게 한다.",
		url: "http://indata.cedia.edu.ec/",
		apiUrl: "http://indata.cedia.edu.ec/api/search",
		isActive: true
	},
	{
		id: 4,
		organization: "Consorci de Serveis Universitaris de Catalunya",
		platformName: "CORA. Research Data Repository (RDR)",
		country: "Spain",
		description: "CORA 연구 데이터 리포지토리(RDR)는 카탈루냐 지역의 연구 데이터를 통합 관리하는 연합형 다학제 데이터 리포지토리이다. 이 시스템은 카탈루냐 대학들과 CERCA 연구센터, 그리고 기타 연구 수행 기관들이 FAIR 원칙과 EOSC 가이드라인에 따라 연구 데이터셋을 발행할 수 있도록 지원한다.",
		url: "http://dataverse.csuc.cat/",
		apiUrl: "http://dataverse.csuc.cat/api/search",
		isActive: true
	},
	{
		id: 5,
		organization: "Consorcio Madrono",
		platformName: "Dataverse e-cienciaDatos",
		country: "Spain",
		description: "e-cienciaDatos는 마드리드 자치주의 공립대학들과 국립원격교육대학(UNED)의 과학 데이터셋을 보관하는 다학제 데이터 리포지토리이다. 이들 기관은 마드로뇨 컨소시엄(Consorcio Madroño)의 회원들로서, 본 리포지토리를 통해 연구 데이터의 가시성 확보, 보존 보장, 그리고 접근 및 재활용 촉진을 도모한다.",
		url: "http://edatos.consorciomadrono.es/",
		apiUrl: "http://edatos.consorciomadrono.es/api/search",
		isActive: true
	},
	{
		id: 6,
		organization: "Danish e-infrastructure Consortium (DeiC)",
		platformName: "DeiC Dataverse",
		country: "Denmark",
		description: "DeiC Dataverse는 덴마크 국립 연구 데이터 리포지토리로서, 덴마크의 모든 대학이 이용할 수 있는 시스템이다. 이는 덴마크 전자인프라 컨소시엄(DeiC)이 코펜하겐 대학과 협력하여 운영하고 있다.",
		url: "http://dataverse.deic.dk/",
		apiUrl: "http://dataverse.deic.dk/api/search",
		isActive: true
	},
	{
		id: 7,
		organization: "DANS",
		platformName: "DataverseNL",
		country: "Netherlands",
		description: "DataverseNL은 DANS(Data Archiving and Networked Services)가 호스팅하는 데이터 리포지토리이다. 이 시스템은 DataverseNL 파트너 기관들(여러 대학, 고등교육기관 및 연구기관)에 소속된 연구자들이 데이터를 기탁할 수 있도록 지원한다.",
		url: "http://dataverse.nl/",
		apiUrl: "http://dataverse.nl/api/search",
		isActive: true
	},
	{
		id: 8,
		organization: "DataverseNO Repository",
		platformName: "DataverseNO",
		country: "Norway",
		description: "DataverseNO(https://dataverse.no/)는 노르웨이 연구 기관의 연구자를 위한 국가 단위의 범용 오픈 연구 데이터 저장소로 운영되며, 일부 컬렉션은 다른 기관의 연구자도 데이터를 업로드할 수 있도록 허용하고 있다.",
		url: "http://dataverse.no/",
		apiUrl: "http://dataverse.no/api/search",
		isActive: true
	},
	{
		id: 9,
		organization: "Florida International University",
		platformName: "Florida International University Research Data Portal",
		country: "USA",
		description: "FIU Research Data Portal은 FIU에서 생성된 연구 데이터의 접근성과 재사용을 지원하는 학제 간 데이터 아카이브로 운영되고 있다.",
		url: "http://dataverse.fiu.edu/",
		apiUrl: "http://dataverse.fiu.edu/api/search",
		isActive: true
	},
	{
		id: 10,
		organization: "French National Center for Research",
		platformName: "data sciencespo",
		country: "France",
		description: "프랑스 대학과 연계된 연구자 및 기관이 데이터를 저장할 수 있도록 개방되어 있으며, Sciences Po와 CNRS의 사회정치 데이터 센터(Center for Socio-Political Data)에서 운영되고 있다.",
		url: "http://data.sciencespo.fr/",
		apiUrl: "http://data.sciencespo.fr/api/search",
		isActive: true
	},
	{
		id: 11,
		organization: "Fudan University",
		platformName: "Fudan University",
		country: "China",
		description: "푸단대학교 소속 연구자들이 데이터를 저장할 수 있도록 개방",
		url: "http://dvn.fudan.edu.cn/",
		apiUrl: "http://dvn.fudan.edu.cn/api/search",
		isActive: true
	},
	{
		id: 12,
		organization: "Fundação Getulio Vargas (FGV)",
		platformName: "FGV Dataverse",
		country: "Brazil",
		description: "브라질 제툴리우 바르가스 재단의 연구 데이터 리포지토리",
		url: "http://dataverse.fgv.br/",
		apiUrl: "http://dataverse.fgv.br/api/search",
		isActive: true
	},
	{
		id: 13,
		organization: "Fundação Oswaldo Cruz (Fiocruz)",
		platformName: "Arca Dados",
		country: "Brazil",
		description: "Arca Dados는 Fiocruz의 공식 리포지터리로, Fiocruz 커뮤니티 또는 기타 연구 기관과의 협력을 통해 생산된 디지털 연구 데이터를 보관, 출판, 확산, 보존 및 공유하기 위해 운영된다.",
		url: "http://dadosdepesquisa.fiocruz.br/",
		apiUrl: "http://dadosdepesquisa.fiocruz.br/api/search",
		isActive: true
	},
	{
		id: 14,
		organization: "George Mason University",
		platformName: "George Mason University Dataverse",
		country: "USA",
		description: "George Mason University Libraries Dataverse는 George Mason 대학교의 교수진, 직원, 학생들이 생산한 지속적인 가치가 있는 데이터를 출판, 공유 및 보존한다.",
		url: "http://dataverse.orc.gmu.edu/",
		apiUrl: "http://dataverse.orc.gmu.edu/api/search",
		isActive: true
	},
	{
		id: 15,
		organization: "Göttingen eResearch Alliance",
		platformName: "Göttingen Research Online",
		country: "Germany",
		description: "Göttingen Research Online은 Göttingen 캠퍼스에서 연구 데이터를 출판하기 위한 기관 저장소로 운영되며, Göttingen 주립 및 대학교 도서관과 Gesellschaft für wissenschaftliche Datenverarbeitung mbH Göttingen이 공동 운영하는 Göttingen eResearch Alliance에서 관리한다.",
		url: "https://data.goettingen-research-online.de/",
		apiUrl: "https://data.goettingen-research-online.de/api/search",
		isActive: true
	},
	{
		id: 16,
		organization: "International Centre for Research in Agroforestry (ICRAF)",
		platformName: "World Agroforestry - Research Data Repository",
		country: "Kenya",
		description: "국제 농림업 연구 센터의 연구 데이터 리포지토리",
		url: "http://data.worldagroforestry.org/",
		apiUrl: "http://data.worldagroforestry.org/api/search",
		isActive: true
	},
	{
		id: 17,
		organization: "International Maize and Wheat Improvement Center (CIMMYT)",
		platformName: "CIMMYT Research Data",
		country: "Mexico",
		description: "CIMMYT 과학자들이 생산하고 개발한 연구 데이터 및 소프트웨어를 위한 무료 오픈 액세스 저장소이다.",
		url: "http://data.cimmyt.org/",
		apiUrl: "http://data.cimmyt.org/api/search",
		isActive: true
	},
	{
		id: 18,
		organization: "Istituto Italiano di Tecnologia",
		platformName: "Italian Institute of Technology (IIT)",
		country: "Italy",
		description: "IIT Dataverse는 이탈리아 기술 연구소(Istituto Italiano di Tecnologia)의 연구 데이터 저장소로, 2021년 5월에 개설되었다. IIT의 연구 활동은 네 개의 연구 분야(계산과학, 생명공학, 나노소재, 로봇공학)에서 최첨단 과학을 중심으로 이루어지며, 기초 및 응용 연구의 우수성을 촉진하고 있다.",
		url: "http://dataverse.iit.it/",
		apiUrl: "http://dataverse.iit.it/api/search",
		isActive: true
	},
	{
		id: 19,
		organization: "Johns Hopkins University",
		platformName: "Johns Hopkins Research Data Repository",
		country: "USA",
		description: "Johns Hopkins Research Data Repository는 Johns Hopkins 연구자들이 연구 데이터를 공유할 수 있는 오픈 액세스 저장소이다. JHU Data Services의 전문 큐레이터들이 운영하며, 연구 데이터의 향후 발견과 재사용이 가능하도록 기탁자들과 협력하여 관리한다.",
		url: "http://archive.data.jhu.edu/",
		apiUrl: "http://archive.data.jhu.edu/api/search",
		isActive: true
	},
	{
		id: 20,
		organization: "KU Leuven",
		platformName: "KU Leuven RDR",
		country: "Belgium",
		description: "RDR은 KU Leuven이 LIBIS 및 Dataverse와 협력하여 연구자들이 연구 데이터를 출판하고 공유할 수 있도록 만든 기관 연구 데이터 저장소이다.",
		url: "http://rdr.kuleuven.be/",
		apiUrl: "http://rdr.kuleuven.be/api/search",
		isActive: true
	},
	{
		id: 21,
		organization: "DR-NTU",
		platformName: "Nanyang Technological University",
		country: "Singapore",
		description: "DR-NTU(Data)는 난양기술대학교(NTU)의 기관 개방형 연구 데이터 저장소이다. NTU 연구자들은 최종 연구 데이터를 보관, 출판 및 보관하여 연구 데이터를 발견 가능하고, 접근 가능하며, 재사용할 수 있도록 DR-NTU(Data)를 활용하는 것이 권장된다.",
		url: "http://researchdata.ntu.edu.sg/",
		apiUrl: "http://researchdata.ntu.edu.sg/api/search",
		isActive: true
	},
	{
		id: 22,
		organization: "SciELO Data Repository",
		platformName: "SciELO Data",
		country: "Brazil",
		description: "SciELO Data는 학제 간 연구 데이터 저장소로, SciELO 네트워크 저널에 게재된 논문이나 SciELO Preprints에 등록된 논문과 관련된 연구 데이터를 보관, 보존 및 확산하는 역할을 한다.",
		url: "http://data.scielo.org/",
		apiUrl: "http://data.scielo.org/api/search",
		isActive: true
	},
	{
		id: 23,
		organization: "State Research Institution \"Kyiv Academic University\"",
		platformName: "DataverseUA",
		country: "Ukraine",
		description: "2023-2024년 우크라이나 국립과학원(NAS)의 과학기술 프로젝트 \"우크라이나 국립과학원의 열린 과학 인프라 개발 및 구현(OPENS)\"의 일환으로 열린 데이터 저장소 \"DataverseUA\"가 개발된다.",
		url: "http://opendata.nas.gov.ua/",
		apiUrl: "http://opendata.nas.gov.ua/api/search",
		isActive: true
	},
	{
		id: 24,
		organization: "Universidad Nacional de Rosario",
		platformName: "Repositorio de Datos Académicos RDA-UNR",
		country: "Argentina",
		description: "로사리오 국립대학교의 학술 데이터 저장소(RDA-UNR)는 UNR 교수, 연구원 및 학생들이 관리하는 연구 데이터를 공유, 저장, 접근, 탐색 및 인용할 수 있도록 하여 데이터를 가시화하고, 접근성을 높이며, 재사용을 촉진하고 장기적인 보존을 보장하는 역할을 한다.",
		url: "http://dataverse.unr.edu.ar/",
		apiUrl: "http://dataverse.unr.edu.ar/api/search",
		isActive: true
	},
	{
		id: 25,
		organization: "University Library Stuttgart",
		platformName: "DaRUS",
		country: "Germany",
		description: "슈투트가르트 대학교의 데이터 저장소인 DaRUS는 슈투트가르트 대학교의 구성원 또는 파트너들의 연구 데이터와 코드에 대한 안전한 저장 위치를 제공한다. DaRUS는 완성된 데이터를 게시하는 데만 사용되는 것이 아니라, 데이터 생애 주기의 모든 단계에서 데이터 관리 및 교환에도 사용된다.",
		url: "http://darus.uni-stuttgart.de/",
		apiUrl: "http://darus.uni-stuttgart.de/api/search",
		isActive: true
	},
	{
		id: 26,
		organization: "University of Minho",
		platformName: "DataRepositoriUM",
		country: "Portugal",
		description: "미뉴 대학교의 기관 데이터 저장소는 UMinho 연구 단위의 연구 데이터를 공유, 게시 및 관리하는 플랫폼이다.",
		url: "http://datarepositorium.sdum.uminho.pt/",
		apiUrl: "http://datarepositorium.sdum.uminho.pt/api/search",
		isActive: true
	},
	{
		id: 27,
		organization: "University of Virginia",
		platformName: "VTTI",
		country: "USA",
		description: "버지니아 공대 교통 연구소(Virginia Tech Transportation Institute)에서 관리하는 교통 데이터 저장소는 교통 관련 데이터를 보관하는 플랫폼입니다.",
		url: "http://dataverse.vtti.vt.edu/",
		apiUrl: "http://dataverse.vtti.vt.edu/api/search",
		isActive: true
	},
	{
		id: 28,
		organization: "Yale University",
		platformName: "Yale Dataverse",
		country: "USA",
		description: "예일 대학교의 Yale Dataverse는 예일 대학교 교수, 직원, 학생 및 관련 기관들이 연구 데이터를 공유, 보존 및 인용할 수 있도록 지원하는 데이터 저장소 서비스입니다.",
		url: "http://dataverse.yale.edu/",
		apiUrl: "http://dataverse.yale.edu/api/search",
		isActive: true
	},
	{
		id: 29,
		organization: "Harvard University",
		platformName: "Harvard Dataverse",
		country: "USA",
		description: "하버드 대학교의 연구 데이터 리포지토리로, 전 세계 연구자들의 데이터 공유와 보존을 위한 플랫폼입니다.",
		url: "https://dataverse.harvard.edu",
		apiUrl: "https://dataverse.harvard.edu/api/search",
		isActive: true
	},
	{
		id: 30,
		organization: "TU Delft",
		platformName: "TU Delft Research Data",
		country: "Netherlands",
		description: "델프트 공과대학교의 연구 데이터 플랫폼으로, 연구 데이터의 장기 보존과 공유를 지원합니다.",
		url: "https://data.4tu.nl",
		apiUrl: "https://data.4tu.nl/api/search",
		isActive: true
	},
	{
		id: 31,
		organization: "UNC Dataverse",
		platformName: "UNC Dataverse",
		country: "USA",
		description: "노스캐롤라이나 대학교의 데이터 리포지토리로, 연구 데이터의 공유와 재사용을 촉진합니다.",
		url: "https://dataverse.unc.edu",
		apiUrl: "https://dataverse.unc.edu/api/search",
		isActive: true
	},
	// 한국 데이터버스 인스턴스 (현재 비활성화)
	{
		id: 32,
		organization: "Seoul National University",
		platformName: "SNU Dataverse",
		country: "South Korea", 
		description: "서울대학교의 연구 데이터 리포지토리로, 한국의 대표적인 연구 데이터 플랫폼입니다.",
		url: "https://snu.dataverse.ac.kr",
		apiUrl: "https://snu.dataverse.ac.kr/api/search",
		isActive: false // SNU 비활성화
	}
] as const;

/**
 * 국가별 Dataverse 인스턴스 그룹화
 */
export const getInstancesByCountry = (country: string): readonly DataverseInstance[] => {
	return GLOBAL_DATAVERSE_INSTANCES.filter(instance => 
		instance.country.toLowerCase() === country.toLowerCase()
	);
};

/**
 * 활성화된 Dataverse 인스턴스만 반환
 */
export const getActiveInstances = (): readonly DataverseInstance[] => {
	return GLOBAL_DATAVERSE_INSTANCES.filter(instance => instance.isActive);
};

/**
 * 특정 조직의 Dataverse 인스턴스 검색
 */
export const findInstanceByOrganization = (organization: string): DataverseInstance | undefined => {
	return GLOBAL_DATAVERSE_INSTANCES.find(instance => 
		instance.organization.toLowerCase().includes(organization.toLowerCase())
	);
};

/**
 * Dataverse 인스턴스 통계
 */
export const getInstanceStats = () => {
	const total = GLOBAL_DATAVERSE_INSTANCES.length;
	const active = getActiveInstances().length;
	const countriesCount = new Set(GLOBAL_DATAVERSE_INSTANCES.map(i => i.country)).size;
	
	return {
		total,
		active,
		inactive: total - active,
		countriesCount
	} as const;
}; 