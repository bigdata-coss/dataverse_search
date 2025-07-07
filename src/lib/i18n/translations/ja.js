export default {
  "title": "Dataverse MCP サーバー",
  "description": "MCP クライアント用グローバル Dataverse 検索プラットフォーム",
  "header": {
    "title": "Dataverse MCP サーバー",
    "subtitle": "世界中の {active} つのアクティブな Dataverse インスタンスから研究データを検索",
    "status": {
      "mcp_active": "MCP サーバー アクティブ",
      "instances": "{active} インスタンス",
      "countries": "{count} カ国"
    }
  },
  "search": {
    "title": "研究データ検索",
    "placeholder": "研究トピック、キーワード、著者名を入力... (例: COVID-19、気候変動、経済データ)",
    "input_label": "検索クエリ",
    "button": "検索",
    "country_label": "国を選択",
    "instance_label": "特定のインスタンスを選択",
    "advanced": {
      "toggle": "高度な検索オプション",
      "field": "検索フィールド",
      "field_all": "すべてのフィールド",
      "field_title": "タイトルのみ",
      "field_author": "著者のみ",
      "field_subject": "主題のみ",
      "sort": "並び替え",
      "sort_date": "日付",
      "sort_name": "名前",
      "order": "並び順",
      "order_desc": "降順（新しいものから）",
      "order_asc": "昇順（古いものから）",
      "year_range": "年の範囲",
      "start_year": "開始年",
      "start_year_placeholder": "例: 2020",
      "end_year": "終了年",
      "end_year_placeholder": "例: 2024",
      "results_per_page": "1ページあたりの結果数",
      "include_files": "ファイルを含む",
      "reset": "オプションをリセット"
    }
  },
  "results": {
    "title": "検索結果",
    "count": "{count} 件",
    "search_scope": "検索範囲",
    "instances_count": "{count} インスタンス",
    "filter": {
      "placeholder": "結果を絞り込み...",
      "button": "再検索",
      "count": "{filtered} / {total} 件"
    },
    "actions": {
      "export_csv": "CSV エクスポート",
      "clear_results": "結果をクリア"
    },
    "no_results": {
      "title": "結果が見つかりません",
      "message": "\"{query}\" の検索結果が見つかりません。",
      "tips": {
        "title": "検索のヒント",
        "keywords": "異なるキーワードや類似の用語を試してみてください",
        "simplify": "検索語を単純化するか、より具体的にしてみてください",
        "english": "英語のキーワードを試してみてください（例: \"COVID-19\", \"climate change\"）",
        "other_instances": "他の国やインスタンスで検索してみてください",
        "advanced": "高度なオプションで検索フィールドを変更してみてください"
      },
      "try_other_instances": "他の Dataverse インスタンスで検索してみてください",
      "actions": {
        "new_search": "新しい検索",
        "harvard_search": "Harvard Dataverse で検索"
      }
    },
    "metadata": {
      "strategy": "検索戦略",
      "time": "検索時間",
      "filters": "適用されたフィルター"
    },
    "suggestions": "検索提案:",
    "view_detail": "詳細を表示"
  },
  "pagination": {
    "page_info": "ページ {current} / {total}",
    "total_results": "合計 {count} 件",
    "page_jump_label": "ページに移動:",
    "page_jump_button": "移動",
    "page_size_label": "ページサイズ:",
    "first": "最初",
    "previous": "前",
    "next": "次",
    "last": "最後"
  },
  "filter": {
    "placeholder": "結果内検索（タイトル、著者、主題でフィルタリング）- Enterで再検索",
    "button": "再検索",
    "clear": "クリア",
    "clear_tooltip": "フィルターをクリア",
    "search_tooltip": "API で再検索",
    "filtered_info": "{filtered} 件の結果がフィルタリングされました（合計 {total} 件中）",
    "api_search_hint": "Enter キーまたは 🔍 ボタンで API 再検索可能"
  },
  "instances": {
    "title": "サポートされている Dataverse インスタンス",
    "search_other": "他の Dataverse インスタンスで同じクエリで検索",
    "show_more": "+{count} 件表示",
    "show_less": "表示を減らす"
  },
  "features": {
    "title": "主要機能",
    "mcp_compatible": {
      "title": "MCP 互換",
      "description": "Claude などの MCP 対応クライアントで設定なしですぐに使用可能"
    },
    "unified_search": {
      "title": "統合検索",
      "description": "世界中の {active} 個の Dataverse から単一インターフェースでデータ検索"
    },
    "global_access": {
      "title": "グローバルアクセス",
      "description": "設定なしですべての公開 Dataverse データに即座にアクセス"
    }
  },
  "quickstart": {
    "title": "クイックスタートガイド",
    "mcp_setup": {
      "title": "1. MCP サーバー設定"
    },
    "ai_usage": {
      "title": "2. AI ツールでの使用"
    },
    "examples": {
      "0": "COVID-19 関連の研究データを見つけて分析してください",
      "1": "気候変動データの最新トレンドを教えてください",
      "2": "経済データセットを見つけて要約してください"
    }
  },
  "common": {
    "loading": "読み込み中...",
    "error": "エラーが発生しました",
    "retry": "再試行",
    "close": "閉じる",
    "back": "戻る",
    "next": "次",
    "previous": "前",
    "page": "ページ",
    "of": "の",
    "total": "合計"
  },
  "language": {
    "select": "言語",
    "korean": "한국어",
    "english": "English",
    "japanese": "日本語",
    "chinese": "中文",
    "spanish": "Español"
  },
  "ui": {
    "no_description": "説明がありません",
    "unknown": "不明",
    "author": "著者",
    "view_detail": "詳細を表示",
    "show_more": "+{count} 件表示",
    "show_less": "表示を減らす",
    "search_strategy": "検索戦略",
    "search_time": "検索時間",
    "applied_filters": "適用されたフィルター",
    "search_suggestions": "検索提案",
    "search_other_instances": "他の Dataverse インスタンスで同じクエリで検索",
    "search_hint": "クリックして \"{query}\" をこのインスタンスで検索",
    "country_count": "{country} ({count})",
    "ms": "ms",
    "count_suffix": "件",
    "pagination_info": "結果をフィルタリング中。API 再検索（🔍）またはフィルタークリア後にページネーション利用可能"
  },
  "errors": {
    "api_error": "検索 API エラー: {status} {message}",
    "search_error": "検索エラーが発生しました: {message}",
    "instance_search_error": "{instance} 検索エラー: {message}",
    "no_results_fetch": "検索結果を取得できません"
  }
}; 