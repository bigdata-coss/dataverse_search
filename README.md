# Dataverse MCP Server

전 세계 Dataverse 인스턴스에서 연구 데이터를 검색하고 AI가 분석할 수 있도록 하는 **Model Context Protocol (MCP) 서버**입니다.

![Vision Pro Style](https://img.shields.io/badge/UI-Vision%20Pro%20Style-blue?style=for-the-badge)
![SvelteKit v5](https://img.shields.io/badge/SvelteKit-v5-ff6b00?style=for-the-badge&logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)

## ✨ 주요 특징

- 🔍 **AI 기반 검색**: 자연어로 연구 데이터 검색
- 🌐 **다중 인스턴스 지원**: 전 세계 32개 Dataverse 인스턴스 통합 검색
- 🤖 **MCP 호환**: Claude, ChatGPT 등 AI 도구에서 바로 사용
- 📡 **SSE 지원**: Server-Sent Events로 실시간 검색 상태 업데이트
- 🌍 **다국어 지원**: 한국어, 영어, 일본어, 중국어, 스페인어 지원
- 💎 **Vision Pro UI**: 글래스모피즘 디자인과 현대적 인터페이스
- ♿ **완전한 접근성**: WCAG 2.1 AA 준수
- 📱 **모바일 반응형**: 모든 디바이스에서 최적화된 경험

## 🚀 빠른 시작

### 1. 시스템 요구사항
- **Node.js 20.0.0 이상** 필요
- npm 또는 yarn 패키지 매니저

### 2. 프로젝트 클론 및 설정

```bash
git clone https://github.com/bigdata-coss/dataverse_search.git
cd elpai_dataverse_MCP
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 환경 변수 설정

```bash
cp env.example .env
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173)을 열어 확인하세요.

## 🛠️ 기술 스택

- **Frontend**: SvelteKit v5 + TypeScript
- **Styling**: Tailwind CSS v4 + 글래스모피즘
- **Icons**: Lucide Svelte
- **MCP SDK**: @modelcontextprotocol/sdk v1.13.2
- **i18n**: 커스텀 다국어 지원 시스템
- **Runtime**: Node.js 20.x
- **Deployment**: Vercel
- **Validation**: Zod

## 🎯 MCP 서버 사용법

### Claude Desktop에서 사용

1. Claude Desktop 설정에서 MCP 서버 구성:

```json
{
  "mcpServers": {
    "global-dataverse-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote@next",
        "https://dataverse.elpai.org/api/mcp"
      ]
    }
  }
}
```

2. Claude를 재시작하고 다음과 같이 질문:

```
"COVID-19 관련 연구 데이터를 찾아서 분석해줘"
"기후변화 데이터셋에서 최신 트렌드를 알려줘"
"미국에서 경제학 관련 데이터를 검색해줘"
"전 세계 모든 Dataverse에서 machine learning 데이터를 찾아줘"
```

### 🧪 MCP SSE 테스트

MCP 서버가 Server-Sent Events(SSE)를 지원하는지 테스트하려면:

#### 1. 수동 테스트
```bash
# MCP 서버 상태 확인
curl -X GET https://dataverse.elpai.org/api/mcp

# 검색 요청 테스트 (JSON-RPC 2.0)
curl -X POST https://dataverse.elpai.org/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search-global-dataverse",
      "arguments": {
        "query": "COVID-19",
        "per_page": 5
      }
    }
  }'
```

#### 2. Claude Desktop 연결 테스트
Claude Desktop에서 MCP 서버가 정상적으로 연결되었는지 확인:
- Claude Desktop 하단에 "🔌 MCP" 아이콘 표시 확인
- "global-dataverse-mcp" 서버가 연결 목록에 나타나는지 확인
- 검색 명령어 실행 후 응답 시간 측정

#### 3. SSE 스트리밍 테스트
```javascript
// 브라우저 개발자 도구에서 실행
const eventSource = new EventSource('https://dataverse.elpai.org/api/mcp/stream');
eventSource.onmessage = function(event) {
  console.log('SSE Message:', event.data);
};
eventSource.onerror = function(event) {
  console.error('SSE Error:', event);
};
```

### 🔧 지원하는 MCP 도구

| 도구 | 설명 | 파라미터 | 사용 예시 |
|------|------|----------|----------|
| `search-datasets` | 특정 인스턴스에서 데이터셋 검색 | query, instance_url, type, per_page | Harvard Dataverse에서 "cancer" 검색 |
| `search-global-dataverse` | 전 세계 모든 활성 인스턴스 동시 검색 | query, type, per_page | 전역에서 "climate change" 검색 |
| `search-by-country` | 특정 국가의 인스턴스에서만 검색 | query, country, type, per_page | 독일에서 "AI" 관련 데이터 검색 |
| `get-dataset-info` | 데이터셋 DOI/Handle로 상세 정보 조회 | persistent_id, instance_url | DOI로 데이터셋 메타데이터 조회 |
| `list-dataverse-instances` | 사용 가능한 인스턴스 목록 조회 | country (선택사항) | 모든 활성 인스턴스 또는 국가별 목록 |

### 📊 지원하는 MCP 리소스

| 리소스 | 설명 | 실시간 업데이트 |
|--------|------|----------------|
| `dataverse://guide` | Dataverse 사용 가이드 | ❌ |
| `dataverse://instances` | 인스턴스 목록과 상태 | ✅ |
| `dataverse://stats` | 실시간 통계 및 성능 지표 | ✅ |

## 🌍 지원하는 Dataverse 인스턴스

### 📈 통계 요약
- **총 인스턴스**: 32개
- **활성 인스턴스**: 31개
- **지원 국가**: 22개
- **비활성 인스턴스**: 1개 (SNU Dataverse)

### 🌟 주요 인스턴스 (기본 검색)
- **Harvard Dataverse** (미국): https://dataverse.harvard.edu
- **TU Delft Research Data** (네덜란드): https://data.4tu.nl
- **DataverseNL** (네덜란드): http://dataverse.nl
- **Göttingen Research Online** (독일): https://data.goettingen-research-online.de

### 🌍 지역별 인스턴스 분포

#### 🇺🇸 **아메리카 (9개)**
- **미국 (6개)**: Harvard, Johns Hopkins, George Mason, Florida International, Yale, UNC
- **브라질 (2개)**: FGV Dataverse, Arca Dados (Fiocruz)
- **아르헨티나 (1개)**: UNR 학술 데이터 저장소

#### 🇪🇺 **유럽 (12개)**
- **독일 (3개)**: Göttingen, DaRUS Stuttgart, IIT
- **네덜란드 (2개)**: DataverseNL, TU Delft
- **스페인 (2개)**: CORA-CSUC, e-cienciaDatos
- **덴마크, 노르웨이, 벨기에, 프랑스, 포르투갈** (각 1개)

#### 🌏 **아시아-태평양 (4개)**
- **중국**: 푸단대학교 (Fudan University)
- **싱가포르**: NTU 데이터 저장소
- **호주**: ADA Dataverse
- **한국**: SNU Dataverse (현재 비활성)

#### 🌍 **기타 지역 (7개)**
- **우크라이나**: DataverseUA
- **케냐**: World Agroforestry
- **멕시코**: CIMMYT Research Data
- **에콰도르**: CEDIA Indata
- **우루과이**: ANII Redata

## 🌐 다국어 지원

### 지원 언어
- 🇰🇷 **한국어 (ko)**: 기본 언어
- 🇺🇸 **영어 (en)**: 국제 표준
- 🇯🇵 **일본어 (ja)**: 일본 연구자 지원
- 🇨🇳 **중국어 (zh)**: 중국 연구자 지원
- 🇪🇸 **스페인어 (es)**: 스페인어권 연구자 지원

### 언어 자동 감지
- 브라우저 언어 설정 기반 자동 감지
- 사용자 선호 언어 저장 (localStorage)
- 언어 변경 시 실시간 UI 업데이트

## 📁 프로젝트 구조

```
src/
├── routes/
│   ├── +layout.svelte          # 루트 레이아웃 (다국어 지원)
│   ├── +page.svelte            # 메인 대시보드
│   └── api/
│       └── mcp/
│           ├── +server.ts      # MCP 서버 엔드포인트 (5개 툴)
│           └── search/
│               └── +server.ts  # 검색 API 엔드포인트
├── lib/
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── InstanceSelector.svelte
│   │   ├── LanguageSelector.svelte  # 언어 선택기
│   │   ├── SearchForm.svelte
│   │   ├── ResultsFilter.svelte
│   │   └── Pagination.svelte
│   ├── i18n/                  # 다국어 지원 시스템
│   │   ├── index.ts           # i18n 핵심 로직
│   │   └── translations/      # 언어별 번역 파일
│   │       ├── ko.js          # 한국어
│   │       ├── en.js          # 영어
│   │       ├── ja.js          # 일본어
│   │       ├── zh.js          # 중국어
│   │       └── es.js          # 스페인어
│   ├── api/
│   │   └── dataverse.ts       # Dataverse API 클라이언트
│   ├── data/
│   │   └── dataverse-instances.ts # 32개 인스턴스 메타데이터
│   └── types/
│       ├── dataverse.ts       # Dataverse 타입 정의
│       └── mcp.ts             # MCP 타입 정의
├── app.html                   # HTML 템플릿
└── app.css                    # 전역 CSS (Vision Pro 스타일)
```

## 🔧 개발 가이드

### 시스템 요구사항
```bash
# Node.js 20.x 이상 필요
node --version  # v20.0.0+

# 패키지 매니저
npm --version   # 9.x+
```

### 코드 스타일

이 프로젝트는 **엄격한 코딩 규칙**을 준수합니다:

- ✅ **SvelteKit v5 룬 문법** 사용 (`$state`, `$derived`, `$effect`)
- ✅ **TypeScript 타입 안전성** (nullable 값 체크 필수)
- ✅ **접근성 준수** (button 요소 사용, ARIA 속성, 키보드 네비게이션)
- ✅ **Vision Pro 스타일** UI 디자인 (글래스모피즘)
- ✅ **모바일 호환성** (터치 친화적, 반응형)
- ✅ **다국어 지원** (i18n 함수 사용)

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 로컬에서 프로덕션 미리보기
npm run preview

# 타입 체크
npm run check

# Vercel에 배포
vercel deploy --prod
```

### 환경 변수

```bash
# .env 파일
VERCEL_URL=dataverse.elpai.org
NODE_ENV=production
```

## 🔍 API 엔드포인트

### GET /api/mcp
MCP 서버 상태 및 기본 정보 조회

```json
{
  "name": "global-dataverse-mcp",
  "version": "2.0.0",
  "description": "AI-powered global Dataverse search and analysis platform",
  "status": "active",
  "instances": {
    "total": 32,
    "active": 31,
    "countries": 22
  },
  "capabilities": [
    "search-datasets",
    "search-global-dataverse", 
    "search-by-country",
    "get-dataset-info",
    "list-dataverse-instances"
  ]
}
```

### POST /api/mcp
MCP 요청 처리 (JSON-RPC 2.0 프로토콜)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search-global-dataverse",
    "arguments": {
      "query": "machine learning",
      "per_page": 10,
      "type": "dataset"
    }
  }
}
```

### POST /api/mcp/search
직접 검색 API (내부 사용)

```json
{
  "query": "climate change",
  "country": "Germany",
  "per_page": 20,
  "start": 0,
  "sort": "relevance"
}
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

### 개발 환경 설정
```bash
# Node.js 20.x 이상 필요
node --version  # v20.0.0+

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npm run check

# 다국어 번역 추가 (새 언어 추가 시)
# 1. src/lib/i18n/translations/에 새 언어 파일 추가
# 2. src/lib/i18n/index.ts에 언어 코드 추가
# 3. supportedLanguages 배열에 추가
```

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP 표준 프로토콜
- [Dataverse Project](https://dataverse.org/) - 오픈 소스 연구 데이터 저장소
- [SvelteKit](https://kit.svelte.dev/) - 차세대 웹 애플리케이션 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크
- [Vercel](https://vercel.com/) - 현대적 배포 플랫폼

---

**Made with ❤️ by ELPAI Team**

전 세계 연구 데이터를 AI의 힘으로 더 쉽게 접근할 수 있도록 만들었습니다. 
32개 인스턴스, 22개 국가, 5개 언어로 연구의 경계를 허물고 있습니다.

### 🌐 배포된 사이트
- **메인 사이트**: https://dataverse.elpai.org
- **GitHub 저장소**: https://github.com/bigdata-coss/dataverse_search
- **MCP 엔드포인트**: https://dataverse.elpai.org/api/mcp 