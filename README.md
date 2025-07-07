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
- 💎 **Vision Pro UI**: 글래스모피즘 디자인과 현대적 인터페이스
- ♿ **완전한 접근성**: WCAG 2.1 AA 준수
- 📱 **모바일 반응형**: 모든 디바이스에서 최적화된 경험

## 🚀 빠른 시작

### 1. 프로젝트 클론 및 설정

```bash
git clone https://github.com/bigdata-coss/dataverse_search.git
cd elpai_dataverse_MCP
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp env.example .env
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173)을 열어 확인하세요.

## 🛠️ 기술 스택

- **Frontend**: SvelteKit v5 + TypeScript
- **Styling**: Tailwind CSS v4 + 글래스모피즘
- **Icons**: Lucide Svelte
- **MCP SDK**: @modelcontextprotocol/sdk
- **Runtime**: Node.js 20.x
- **Deployment**: Vercel
- **Validation**: Zod

## 🎯 MCP 서버 사용법

### Claude Desktop에서 사용

1. Claude Desktop 설정에서 MCP 서버 구성:

```json
{
  "mcpServers": {
    "dataverse-mcp": {
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
"경제학 관련 데이터를 Harvard Dataverse에서 검색해줘"
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
      "name": "search-datasets",
      "arguments": {
        "query": "COVID-19",
        "country": "USA",
        "per_page": 5
      }
    }
  }'
```

#### 2. Claude Desktop 연결 테스트
Claude Desktop에서 MCP 서버가 정상적으로 연결되었는지 확인:
- Claude Desktop 하단에 "🔌 MCP" 아이콘 표시 확인
- "dataverse-mcp" 서버가 연결 목록에 나타나는지 확인
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

### 지원하는 MCP 도구

| 도구 | 설명 | 파라미터 | SSE 지원 |
|------|------|----------|----------|
| `search-datasets` | 데이터셋 검색 | query, type, instance, sort, per_page | ✅ |
| `get-dataset-info` | 데이터셋 상세 정보 | persistent_id, instance | ✅ |
| `list-instances` | 활성 인스턴스 목록 | country (선택사항) | ✅ |

### 지원하는 MCP 리소스

| 리소스 | 설명 | SSE 업데이트 |
|--------|------|-------------|
| `dataverse://guide` | Dataverse 사용 가이드 | ❌ |
| `dataverse://instances` | 인스턴스 목록 | ✅ |
| `dataverse://stats` | 실시간 통계 | ✅ |

## 🌍 지원하는 Dataverse 인스턴스

### 주요 인스턴스 (기본 검색)
- **Harvard Dataverse** (기본): https://dataverse.harvard.edu
- **Demo Dataverse**: https://demo.dataverse.org
- **TU Delft Research Data**: https://data.4tu.nl

### 지역별 인스턴스
- **아시아**: 싱가포르(NTU), 중국(푸단대), 한국(SNU - 비활성)
- **유럽**: 독일(괴팅겐), 네덜란드(DataverseNL), 덴마크(DeiC)
- **아메리카**: 미국(다수), 브라질(FGV, Fiocruz), 아르헨티나(UNR)

*총 32개 인스턴스 지원 (활성: 31개)*

## 📁 프로젝트 구조

```
src/
├── routes/
│   ├── +layout.svelte          # 루트 레이아웃
│   ├── +page.svelte            # 메인 대시보드
│   └── api/
│       └── mcp/
│           ├── +server.ts      # MCP 서버 엔드포인트
│           └── search/
│               └── +server.ts  # 검색 API 엔드포인트
├── lib/
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── InstanceSelector.svelte
│   │   ├── SearchForm.svelte
│   │   ├── ResultsFilter.svelte
│   │   └── Pagination.svelte
│   ├── api/
│   │   └── dataverse.ts        # Dataverse API 클라이언트
│   ├── data/
│   │   └── dataverse-instances.ts # 인스턴스 메타데이터
│   └── types/
│       ├── dataverse.ts        # Dataverse 타입 정의
│       └── mcp.ts              # MCP 타입 정의
├── app.html                    # HTML 템플릿
└── app.css                     # 전역 CSS (Vision Pro 스타일)
```

## 🔧 개발 가이드

### 코드 스타일

이 프로젝트는 **엄격한 코딩 규칙**을 준수합니다:

- ✅ **SvelteKit v5 룬 문법** 사용 (`$state`, `$derived`, `$effect`)
- ✅ **TypeScript 타입 안전성** (nullable 값 체크 필수)
- ✅ **접근성 준수** (button 요소 사용, ARIA 속성, 키보드 네비게이션)
- ✅ **Vision Pro 스타일** UI 디자인 (글래스모피즘)
- ✅ **모바일 호환성** (터치 친화적, 반응형)

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

## 🌟 주요 기능

### 1. AI 기반 검색
- 자연어 쿼리 지원
- 다국어 검색 (한국어, 영어)
- 스마트 필터링 및 정렬
- 결과내 재검색 (클라이언트/서버 사이드)

### 2. Vision Pro 스타일 UI
- 글래스모피즘 디자인
- 부드러운 애니메이션
- 다크 모드 최적화
- 고급 검색 옵션 토글

### 3. 완전한 접근성
- 키보드 네비게이션
- 스크린리더 지원 (ARIA 라벨링)
- 포커스 관리
- 시각적 피드백

### 4. 모바일 반응형
- 터치 친화적 인터페이스
- 적응형 레이아웃
- 성능 최적화
- 오프라인 지원 (준비 중)

### 5. 실시간 업데이트
- Server-Sent Events (SSE)
- 검색 진행 상태 표시
- 실시간 인스턴스 상태 모니터링
- 자동 재연결

## 🔍 API 엔드포인트

### GET /api/mcp
MCP 서버 상태 확인

```json
{
  "name": "dataverse-mcp",
  "version": "1.0.0",
  "status": "active",
  "runtime": "nodejs20.x",
  "capabilities": ["tools", "resources", "sse"],
  "tools": ["search-datasets", "get-dataset-info", "list-instances"],
  "resources": ["dataverse://guide", "dataverse://instances", "dataverse://stats"]
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
    "name": "search-datasets",
    "arguments": {
      "query": "machine learning",
      "country": "USA",
      "per_page": 10,
      "sort": "date",
      "order": "desc"
    }
  }
}
```

### POST /api/mcp/search
직접 검색 API

```json
{
  "query": "climate change",
  "country": "Netherlands",
  "per_page": 20,
  "start": 0,
  "sort": "relevance"
}
```

## 🚨 문제 해결

### Vercel 배포 오류
```bash
# Node.js 런타임 오류 해결
Error: invalid runtime nodejs18.x
→ svelte.config.js에서 runtime: 'nodejs20.x'로 변경
```

### MCP 연결 문제
```bash
# Claude Desktop 연결 확인
1. MCP 서버 URL이 올바른지 확인
2. 네트워크 연결 상태 확인
3. Claude Desktop 재시작
4. MCP 로그 확인: ~/.config/claude-desktop/logs/
```

### SSE 연결 문제
```bash
# 브라우저에서 SSE 테스트
curl -N -H "Accept: text/event-stream" https://dataverse.elpai.org/api/mcp/stream
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
```

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP 표준
- [Dataverse Project](https://dataverse.org/) - 오픈 소스 연구 데이터 저장소
- [SvelteKit](https://kit.svelte.dev/) - 웹 애플리케이션 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크
- [Vercel](https://vercel.com/) - 배포 플랫폼

---

**Made with ❤️ by ELPAI Team**

전 세계 연구 데이터를 AI의 힘으로 더 쉽게 접근할 수 있도록 만들었습니다. 

### 🌐 배포된 사이트
- **메인 사이트**: https://dataverse.elpai.org
- **GitHub 저장소**: https://github.com/bigdata-coss/dataverse_search
- **MCP 엔드포인트**: https://dataverse.elpai.org/api/mcp 