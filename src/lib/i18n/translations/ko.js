export default {
  "title": "Dataverse MCP 서버",
  "description": "MCP 클라이언트를 위한 글로벌 Dataverse 검색 플랫폼",
  "header": {
    "title": "Dataverse MCP 서버",
    "subtitle": "전 세계 {active}개의 활성 Dataverse 인스턴스에서 연구 데이터를 검색하세요",
    "status": {
      "mcp_active": "MCP 서버 활성",
      "instances": "{active}개 인스턴스",
      "countries": "{count}개 국가"
    }
  },
  "search": {
    "title": "연구 데이터 검색",
    "placeholder": "연구 주제, 키워드, 저자명을 입력하세요... (예: COVID-19, 기후변화, 경제 데이터)",
    "input_label": "검색어 입력",
    "button": "검색하기",
    "country_label": "검색 국가 선택",
    "instance_label": "특정 인스턴스 선택",
    "advanced": {
      "toggle": "고급 검색 옵션",
      "field": "검색 필드",
      "field_all": "전체 검색",
      "field_title": "제목만",
      "field_author": "저자만",
      "field_subject": "주제만",
      "sort": "정렬 기준",
      "sort_date": "날짜순",
      "sort_name": "이름순",
      "order": "정렬 순서",
      "order_desc": "내림차순 (최신부터)",
      "order_asc": "오름차순 (오래된것부터)",
      "year_range": "년도 범위",
      "start_year": "시작 년도",
      "start_year_placeholder": "예: 2020",
      "end_year": "종료 년도",
      "end_year_placeholder": "예: 2024",
      "results_per_page": "페이지당 결과 수",
      "include_files": "파일 포함",
      "reset": "옵션 초기화"
    }
  },
  "results": {
    "title": "검색 결과",
    "count": "{count}개",
    "search_scope": "검색 범위",
    "instances_count": "{count}개 인스턴스",
    "filter": {
      "placeholder": "결과내 검색...",
      "button": "재검색",
      "count": "{filtered}개 / {total}개"
    },
    "actions": {
      "export_csv": "CSV 내보내기",
      "clear_results": "결과 지우기"
    },
    "no_results": {
      "title": "검색 결과가 없습니다",
      "message": "\"{query}\"에 대한 검색 결과를 찾을 수 없습니다.",
      "tips": {
        "title": "검색 팁",
        "keywords": "다른 키워드나 유사한 용어를 사용해보세요",
        "simplify": "검색어를 단순화하거나 더 구체적으로 해보세요",
        "english": "영어 키워드를 시도해보세요 (예: \"COVID-19\", \"climate change\")",
        "other_instances": "다른 국가나 인스턴스에서 검색해보세요",
        "advanced": "고급 검색 옵션에서 검색 필드를 변경해보세요"
      },
      "try_other_instances": "다른 Dataverse 인스턴스에서 검색해보세요",
      "actions": {
        "new_search": "새로운 검색",
        "harvard_search": "Harvard Dataverse에서 검색"
      }
    },
    "metadata": {
      "strategy": "검색 전략",
      "time": "검색 시간",
      "filters": "적용된 필터"
    },
    "suggestions": "검색 제안:",
    "view_detail": "자세히 보기"
  },
  "pagination": {
    "page_info": "페이지 {current} / {total}",
    "total_results": "총 {count}개 결과",
    "page_jump_label": "페이지 이동:",
    "page_jump_button": "이동",
    "page_size_label": "페이지 크기:",
    "first": "처음",
    "previous": "이전", 
    "next": "다음",
    "last": "마지막"
  },
  "filter": {
    "placeholder": "결과내 검색 (제목, 저자, 주제별 필터링) - Enter로 재검색",
    "button": "재검색",
    "clear": "지우기",
    "clear_tooltip": "지우기",
    "search_tooltip": "API로 재검색",
    "filtered_info": "{filtered}개 결과가 필터링됨 (전체 {total}개 중)",
    "api_search_hint": "Enter 키나 🔍 버튼으로 API 재검색 가능"
  },
  "instances": {
    "title": "지원하는 Dataverse 인스턴스",
    "search_other": "다른 Dataverse 인스턴스에서 동일한 검색어로 검색",
    "show_more": "+{count}개 더",
    "show_less": "축소하기"
  },
  "features": {
    "title": "주요 기능",
    "mcp_compatible": {
      "title": "MCP 호환",
      "description": "Claude 등 MCP 지원 클라이언트에서 설정없이 바로 사용 가능"
    },
    "unified_search": {
      "title": "통합 검색",
      "description": "전 세계 {active}개 Dataverse에서 단일 검색 인터페이스로 데이터 검색"
    },
    "global_access": {
      "title": "글로벌 액세스",
      "description": "설정 없이도 모든 공개 Dataverse 데이터에 즉시 액세스"
    }
  },
  "quickstart": {
    "title": "빠른 시작 가이드",
    "mcp_setup": {
      "title": "1. MCP 서버 설정"
    },
    "ai_usage": {
      "title": "2. AI 도구에서 사용"
    },
    "examples": {
      "0": "COVID-19 관련 연구 데이터를 찾아서 분석해줘",
      "1": "기후변화 데이터에서 최신 트렌드를 알려줘",
      "2": "경제 데이터셋을 찾아서 요약해줘"
    }
  },
  "common": {
    "loading": "로딩 중...",
    "error": "오류 발생",
    "retry": "다시 시도",
    "close": "닫기",
    "back": "뒤로",
    "next": "다음",
    "previous": "이전",
    "page": "페이지",
    "of": "의",
    "total": "총"
  },
  "language": {
    "select": "언어 선택",
    "korean": "한국어",
    "english": "English",
    "japanese": "日本語",
    "chinese": "中文",
    "spanish": "Español"
  },
  "ui": {
    "no_description": "설명이 없습니다",
    "unknown": "알 수 없음",
    "author": "저자",
    "view_detail": "자세히 보기",
    "show_more": "+{count}개 더",
    "show_less": "축소하기",
    "search_strategy": "검색 전략",
    "search_time": "검색 시간",
    "applied_filters": "적용된 필터",
    "search_suggestions": "검색 제안",
    "search_other_instances": "다른 Dataverse 인스턴스에서 동일한 검색어로 검색",
    "search_hint": "클릭하면 해당 인스턴스에서 \"{query}\" 검색이 실행됩니다",
    "country_count": "{country} ({count}개)",
    "ms": "ms",
    "count_suffix": "개",
    "pagination_info": "결과내 검색 중입니다. 페이지네이션은 API 재검색(🔍) 또는 필터 해제 후 이용 가능합니다"
  },
  "errors": {
    "api_error": "검색 API 오류: {status} {message}",
    "search_error": "검색 중 오류가 발생했습니다: {message}",
    "instance_search_error": "{instance} 검색 중 오류가 발생했습니다: {message}",
    "no_results_fetch": "검색 결과를 가져올 수 없습니다"
  }
}; 