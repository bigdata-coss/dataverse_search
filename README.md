# Dataverse MCP Server

전 세계 Dataverse 인스턴스에서 연구 데이터를 검색하고 AI가 분석할 수 있도록 하는 **Model Context Protocol (MCP) 서버**입니다.

![Vision Pro Style](https://img.shields.io/badge/UI-Vision%20Pro%20Style-blue?style=for-the-badge)
![SvelteKit v5](https://img.shields.io/badge/SvelteKit-v5-ff6b00?style=for-the-badge&logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ 주요 특징

- 🔍 **AI 기반 검색**: 자연어로 연구 데이터 검색
- 🌐 **다중 인스턴스 지원**: 전 세계 주요 Dataverse 인스턴스 통합 검색
- 🤖 **MCP 호환**: Claude, ChatGPT 등 AI 도구에서 바로 사용
- 💎 **Vision Pro UI**: 글래스모피즘 디자인과 현대적 인터페이스
- ♿ **완전한 접근성**: WCAG 2.1 AA 준수
- 📱 **모바일 반응형**: 모든 디바이스에서 최적화된 경험

## 🚀 빠른 시작

### 1. 프로젝트 클론 및 설정

```bash
git clone https://github.com/your-username/elpai_dataverse_MCP.git
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
- **Deployment**: Vercel (Node.js 18.x)
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
        "https://your-domain.vercel.app/api/mcp"
      ]
    }
  }
}
```

2. Claude를 재시작하고 다음과 같이 질문:

```
"COVID-19 관련 연구 데이터를 찾아서 분석해줘"
"기후변화 데이터셋에서 최신 트렌드를 알려줘"
```

### 지원하는 MCP 도구

| 도구 | 설명 | 파라미터 |
|------|------|----------|
| `search-datasets` | 데이터셋 검색 | query, type, instance, sort, per_page |
| `get-dataset-info` | 데이터셋 상세 정보 | persistent_id, instance |

### 지원하는 MCP 리소스

| 리소스 | 설명 |
|--------|------|
| `dataverse://guide` | Dataverse 사용 가이드 |

## 🌍 지원하는 Dataverse 인스턴스

- **서울대학교 Dataverse**: https://snu.dataverse.ac.kr
- **Harvard Dataverse**: https://dataverse.harvard.edu
- **Demo Dataverse**: https://demo.dataverse.org

## 📁 프로젝트 구조

```
src/
├── routes/
│   ├── +layout.svelte          # 루트 레이아웃
│   ├── +page.svelte            # 메인 대시보드
│   └── api/
│       └── mcp/
│           └── +server.ts      # MCP 서버 엔드포인트
├── lib/
│   ├── api/
│   │   └── dataverse.ts        # Dataverse API 클라이언트
│   └── types/
│       ├── dataverse.ts        # Dataverse 타입 정의
│       └── mcp.ts              # MCP 타입 정의
├── app.html                    # HTML 템플릿
└── app.css                     # 전역 CSS (Vision Pro 스타일)
```

## 🔧 개발 가이드

### 코드 스타일

이 프로젝트는 **엄격한 코딩 규칙**을 준수합니다:

- ✅ **SvelteKit v5 룬 문법** 사용
- ✅ **TypeScript 타입 안전성** (nullable 값 체크 필수)
- ✅ **접근성 준수** (button 요소 사용, ARIA 속성)
- ✅ **Vision Pro 스타일** UI 디자인

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 로컬에서 프로덕션 미리보기
npm run preview

# 타입 체크
npm run check

# Vercel에 배포
vercel deploy
```

## 🌟 주요 기능

### 1. AI 기반 검색
- 자연어 쿼리 지원
- 다국어 검색 (한국어, 영어)
- 스마트 필터링 및 정렬

### 2. Vision Pro 스타일 UI
- 글래스모피즘 디자인
- 부드러운 애니메이션
- 다크 모드 최적화

### 3. 완전한 접근성
- 키보드 네비게이션
- 스크린리더 지원
- 포커스 관리
- ARIA 라벨링

### 4. 모바일 반응형
- 터치 친화적 인터페이스
- 적응형 레이아웃
- 성능 최적화

## 🔍 API 엔드포인트

### GET /api/mcp
MCP 서버 상태 확인

```json
{
  "name": "dataverse-mcp",
  "version": "1.0.0",
  "status": "active",
  "capabilities": ["tools", "resources"],
  "tools": ["search-datasets", "get-dataset-info"],
  "resources": ["dataverse://guide"]
}
```

### POST /api/mcp
MCP 요청 처리 (JSON-RPC 2.0 프로토콜)

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP 표준
- [Dataverse Project](https://dataverse.org/) - 오픈 소스 연구 데이터 저장소
- [SvelteKit](https://kit.svelte.dev/) - 웹 애플리케이션 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크

---

**Made with ❤️ by ELPAI Team**

전 세계 연구 데이터를 AI의 힘으로 더 쉽게 접근할 수 있도록 만들었습니다. 