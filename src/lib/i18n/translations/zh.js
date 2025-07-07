export default {
  "title": "Dataverse MCP 服务器",
  "description": "面向MCP客户端的全球Dataverse搜索平台",
  "header": {
    "title": "Dataverse MCP 服务器",
    "subtitle": "从全球{active}个活跃的Dataverse实例中搜索研究数据",
    "status": {
      "mcp_active": "MCP服务器激活",
      "instances": "{active}个实例",
      "countries": "{count}个国家"
    }
  },
  "search": {
    "title": "研究数据搜索",
    "placeholder": "输入研究主题、关键词、作者姓名...（例如：COVID-19、气候变化、经济数据）",
    "input_label": "搜索输入",
    "button": "搜索",
    "country_label": "选择国家",
    "instance_label": "选择特定实例",
    "advanced": {
      "toggle": "高级搜索选项",
      "field": "搜索字段",
      "field_all": "全部字段",
      "field_title": "仅标题",
      "field_author": "仅作者",
      "field_subject": "仅主题",
      "sort": "排序方式",
      "sort_date": "日期",
      "sort_name": "名称",
      "order": "排序",
      "order_desc": "降序（最新优先）",
      "order_asc": "升序（最旧优先）",
      "year_range": "年份范围",
      "start_year": "开始年份",
      "start_year_placeholder": "例：2020",
      "end_year": "结束年份",
      "end_year_placeholder": "例：2024",
      "results_per_page": "每页结果数",
      "include_files": "包含文件",
      "reset": "重置选项"
    }
  },
  "results": {
    "title": "搜索结果",
    "count": "{count}个结果",
    "search_scope": "搜索范围",
    "instances_count": "{count}个实例",
    "filter": {
      "placeholder": "结果内搜索...",
      "button": "重新搜索",
      "count": "{filtered} 个 / {total} 个"
    },
    "actions": {
      "export_csv": "导出CSV",
      "clear_results": "清除结果"
    },
    "no_results": {
      "title": "未找到搜索结果",
      "message": "未找到\"{query}\"的搜索结果。",
      "tips": {
        "title": "搜索提示",
        "keywords": "尝试使用不同的关键词或相似的术语",
        "simplify": "简化您的搜索词或更加具体",
        "english": "尝试英语关键词（例如：COVID-19、climate change）",
        "other_instances": "在其他国家或实例中搜索",
        "advanced": "在高级选项中更改搜索字段"
      },
      "try_other_instances": "尝试在其他Dataverse实例中搜索",
      "actions": {
        "new_search": "新搜索",
        "harvard_search": "在哈佛Dataverse中搜索"
      }
    },
    "metadata": {
      "strategy": "搜索策略",
      "time": "搜索时间",
      "filters": "应用的过滤器"
    },
    "suggestions": "搜索建议：",
    "view_detail": "查看详情"
  },
  "pagination": {
    "page_info": "第 {current} / {total} 页",
    "total_results": "共 {count} 个结果",
    "page_jump_label": "跳转到页面:",
    "page_jump_button": "跳转",
    "page_size_label": "页面大小:",
    "first": "首页",
    "previous": "上一页",
    "next": "下一页",
    "last": "末页"
  },
  "filter": {
    "placeholder": "结果内搜索（标题、作者、主题）- 按Enter重新搜索",
    "button": "重新搜索",
    "clear": "清除",
    "clear_tooltip": "清除过滤器",
    "search_tooltip": "API重新搜索",
    "filtered_info": "已过滤 {filtered} 个结果（共 {total} 个）",
    "api_search_hint": "按Enter键或🔍按钮进行API重新搜索"
  },
  "instances": {
    "title": "支持的Dataverse实例",
    "search_other": "在其他 Dataverse 实例中使用相同查询搜索",
    "show_more": "+{count} 个更多",
    "show_less": "收起"
  },
  "features": {
    "title": "主要功能",
    "mcp_compatible": {
      "title": "MCP兼容",
      "description": "在Claude等MCP兼容客户端中无需配置即可立即使用"
    },
    "unified_search": {
      "title": "统一搜索",
      "description": "通过单一界面搜索全球{active}个Dataverse的数据"
    },
    "global_access": {
      "title": "全球访问",
      "description": "无需任何设置即可即时访问所有公开的Dataverse数据"
    }
  },
  "quickstart": {
    "title": "快速开始指南",
    "mcp_setup": {
      "title": "1. MCP服务器设置"
    },
    "ai_usage": {
      "title": "2. 在AI工具中使用"
    },
    "examples": {
      "0": "查找并分析 COVID-19 研究数据",
      "1": "显示气候变化数据的最新趋势",
      "2": "查找并总结经济数据集"
    }
  },
  "language": {
    "select": "选择语言",
    "korean": "한국어",
    "english": "English",
    "japanese": "日本語",
    "chinese": "中文",
    "spanish": "Español"
  },
  "common": {
    "loading": "加载中...",
    "error": "发生错误",
    "retry": "重试",
    "close": "关闭",
    "back": "返回",
    "next": "下一页",
    "previous": "上一页",
    "page": "页",
    "of": "的",
    "total": "总计"
  },
  "ui": {
    "no_description": "无描述",
    "unknown": "未知",
    "author": "作者",
    "view_detail": "查看详情",
    "show_more": "+{count}个更多",
    "show_less": "收起",
    "search_strategy": "搜索策略",
    "search_time": "搜索时间",
    "applied_filters": "应用的过滤器",
    "search_suggestions": "搜索建议",
    "search_other_instances": "在其他Dataverse实例中使用相同查询搜索",
    "search_hint": "点击在此实例中搜索\"{query}\"",
    "country_count": "{country} ({count}个实例)",
    "ms": "毫秒",
    "count_suffix": "个",
    "pagination_info": "正在过滤结果。分页功能在API重新搜索(🔍)或重置过滤器后可用"
  },
  "errors": {
    "api_error": "搜索API错误: {status} {message}",
    "search_error": "搜索过程中发生错误: {message}",
    "instance_search_error": "搜索{instance}时出错: {message}",
    "no_results_fetch": "无法获取搜索结果"
  }
}; 