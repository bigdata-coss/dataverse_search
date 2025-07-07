export default {
  "title": "Dataverse MCP Server",
  "description": "Global Dataverse search platform for MCP clients",
  "header": {
    "title": "Dataverse MCP Server",
    "subtitle": "Search research data from {active} active Dataverse instances worldwide",
    "status": {
      "mcp_active": "MCP Server Active",
      "instances": "{active} instances",
      "countries": "{count} countries"
    }
  },
  "search": {
    "title": "Research Data Search",
    "placeholder": "Enter research topics, keywords, or author names... (e.g., COVID-19, climate change, economic data)",
    "input_label": "Search Query",
    "button": "Search",
    "country_label": "Select Country",
    "instance_label": "Select Specific Instance",
    "advanced": {
      "toggle": "Advanced Search Options",
      "field": "Search Field",
      "field_all": "All Fields",
      "field_title": "Title Only",
      "field_author": "Author Only",
      "field_subject": "Subject Only",
      "sort": "Sort By",
      "sort_date": "Date",
      "sort_name": "Name",
      "order": "Sort Order",
      "order_desc": "Descending (Newest First)",
      "order_asc": "Ascending (Oldest First)",
      "year_range": "Year Range",
      "start_year": "Start Year",
      "start_year_placeholder": "e.g., 2020",
      "end_year": "End Year",
      "end_year_placeholder": "e.g., 2024",
      "results_per_page": "Results per Page",
      "include_files": "Include Files",
      "reset": "Reset Options"
    }
  },
  "results": {
    "title": "Search Results",
    "count": "{count} results",
    "search_scope": "Search Scope",
    "instances_count": "{count} instances",
    "filter": {
      "placeholder": "Filter results...",
      "button": "Re-search",
      "count": "{filtered} / {total} results"
    },
    "actions": {
      "export_csv": "Export CSV",
      "clear_results": "Clear Results"
    },
    "no_results": {
      "title": "No Results Found",
      "message": "No search results found for \"{query}\".",
      "tips": {
        "title": "Search Tips",
        "keywords": "Try different keywords or similar terms",
        "simplify": "Simplify or be more specific with your search terms",
        "english": "Try English keywords (e.g., \"COVID-19\", \"climate change\")",
        "other_instances": "Search in other countries or instances",
        "advanced": "Change search field in advanced options"
      },
      "try_other_instances": "Try searching in other Dataverse instances",
      "actions": {
        "new_search": "New Search",
        "harvard_search": "Search in Harvard Dataverse"
      }
    },
    "metadata": {
      "strategy": "Search Strategy",
      "time": "Search Time",
      "filters": "Applied Filters"
    },
    "suggestions": "Search Suggestions:",
    "view_detail": "View Details"
  },
  "pagination": {
    "page_info": "Page {current} of {total}",
    "total_results": "Total {count} results",
    "page_jump_label": "Go to page:",
    "page_jump_button": "Go",
    "page_size_label": "Page size:",
    "first": "First",
    "previous": "Previous",
    "next": "Next",
    "last": "Last"
  },
  "filter": {
    "placeholder": "Filter results (title, author, subject) - Press Enter to re-search",
    "button": "Re-search",
    "clear": "Clear",
    "clear_tooltip": "Clear filter",
    "search_tooltip": "Re-search with API",
    "filtered_info": "{filtered} results filtered (out of {total} total)",
    "api_search_hint": "Press Enter or 🔍 button to re-search with API"
  },
  "instances": {
    "title": "Supported Dataverse Instances",
    "search_other": "Search in other Dataverse instances with the same query",
    "show_more": "+{count} more",
    "show_less": "Show less"
  },
  "features": {
    "title": "Key Features",
    "mcp_compatible": {
      "title": "MCP Compatible",
      "description": "Ready to use with Claude and other MCP-enabled clients without configuration"
    },
    "unified_search": {
      "title": "Unified Search",
      "description": "Search data from {active} Dataverse instances worldwide with a single interface"
    },
    "global_access": {
      "title": "Global Access",
      "description": "Instant access to all public Dataverse data without configuration"
    }
  },
  "quickstart": {
    "title": "Quick Start Guide",
    "mcp_setup": {
      "title": "1. MCP Server Setup"
    },
    "ai_usage": {
      "title": "2. Use with AI Tools"
    },
    "examples": {
      "0": "Find and analyze COVID-19 research data",
      "1": "Show me the latest trends in climate change data",
      "2": "Find economic datasets and summarize them"
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "Error occurred",
    "retry": "Retry",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "page": "Page",
    "of": "of",
    "total": "Total"
  },
  "language": {
    "select": "Language",
    "korean": "한국어",
    "english": "English",
    "japanese": "日本語",
    "chinese": "中文",
    "spanish": "Español"
  },
  "ui": {
    "no_description": "No description available",
    "unknown": "Unknown",
    "author": "Author",
    "view_detail": "View Details",
    "show_more": "+{count} more",
    "show_less": "Show less",
    "search_strategy": "Search Strategy",
    "search_time": "Search Time",
    "applied_filters": "Applied Filters",
    "search_suggestions": "Search Suggestions",
    "search_other_instances": "Search in other Dataverse instances with the same query",
    "search_hint": "Click to search for \"{query}\" in this instance",
    "country_count": "{country} ({count})",
    "ms": "ms",
    "count_suffix": "",
    "pagination_info": "Filtering results. Pagination available after API re-search (🔍) or clearing filter"
  },
  "errors": {
    "api_error": "Search API error: {status} {message}",
    "search_error": "Search error occurred: {message}",
    "instance_search_error": "Error searching {instance}: {message}",
    "no_results_fetch": "Unable to fetch search results"
  }
}; 