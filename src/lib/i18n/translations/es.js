export default {
  "title": "Servidor MCP de Dataverse",
  "description": "Plataforma global de búsqueda Dataverse para clientes MCP",
  "header": {
    "title": "Servidor MCP de Dataverse",
    "subtitle": "Busque datos de investigación de {active} instancias activas de Dataverse en todo el mundo",
    "status": {
      "mcp_active": "Servidor MCP Activo",
      "instances": "{active} instancias",
      "countries": "{count} países"
    }
  },
  "search": {
    "title": "Búsqueda de Datos de Investigación",
    "placeholder": "Ingrese temas de investigación, palabras clave, nombres de autores... (ej: COVID-19, cambio climático, datos económicos)",
    "input_label": "Entrada de búsqueda",
    "button": "Buscar",
    "country_label": "Seleccionar País",
    "instance_label": "Seleccionar Instancia Específica",
    "advanced": {
      "toggle": "Opciones de Búsqueda Avanzada",
      "field": "Campo de Búsqueda",
      "field_all": "Todos los campos",
      "field_title": "Solo título",
      "field_author": "Solo autor",
      "field_subject": "Solo tema",
      "sort": "Ordenar Por",
      "sort_date": "Fecha",
      "sort_name": "Nombre",
      "order": "Orden",
      "order_desc": "Descendente (más reciente primero)",
      "order_asc": "Ascendente (más antiguo primero)",
      "year_range": "Rango de Años",
      "start_year": "Año de Inicio",
      "start_year_placeholder": "ej: 2020",
      "end_year": "Año Final",
      "end_year_placeholder": "ej: 2024",
      "results_per_page": "Resultados por Página",
      "include_files": "Incluir Archivos",
      "reset": "Restablecer Opciones"
    }
  },
  "results": {
    "title": "Resultados de Búsqueda",
    "count": "{count} resultados",
    "search_scope": "Alcance de búsqueda",
    "instances_count": "{count} instancias",
    "filter": {
      "placeholder": "Filtrar resultados...",
      "button": "Re-buscar",
      "count": "{filtered} / {total} resultados"
    },
    "actions": {
      "export_csv": "Exportar CSV",
      "clear_results": "Limpiar Resultados"
    },
    "no_results": {
      "title": "No se Encontraron Resultados",
      "message": "No se encontraron resultados de búsqueda para \"{query}\".",
      "tips": {
        "title": "Consejos de Búsqueda",
        "keywords": "Pruebe con diferentes palabras clave o términos similares",
        "simplify": "Simplifique sus términos de búsqueda o sea más específico",
        "english": "Pruebe con palabras clave en inglés (ej. \"COVID-19\", \"climate change\")",
        "other_instances": "Busque en otros países o instancias",
        "advanced": "Cambie los campos de búsqueda en las opciones avanzadas"
      },
      "try_other_instances": "Intente buscar en otras instancias de Dataverse",
      "actions": {
        "new_search": "Nueva Búsqueda",
        "harvard_search": "Buscar en Harvard Dataverse"
      }
    },
    "metadata": {
      "strategy": "Estrategia de Búsqueda",
      "time": "Tiempo de Búsqueda",
      "filters": "Filtros Aplicados"
    },
    "suggestions": "Sugerencias de Búsqueda:",
    "view_detail": "Ver Detalles"
  },
  "instances": {
    "title": "Instancias de Dataverse Soportadas",
    "search_other": "Buscar con la misma consulta en otras instancias de Dataverse",
    "show_more": "+{count} más",
    "show_less": "Mostrar menos"
  },
  "features": {
    "title": "Características Principales",
    "mcp_compatible": {
      "title": "Compatible con MCP",
      "description": "Funciona instantáneamente con Claude y otros clientes compatibles con MCP sin configuración"
    },
    "unified_search": {
      "title": "Búsqueda Unificada",
      "description": "Busque datos de {active} instancias de Dataverse en todo el mundo a través de una sola interfaz"
    },
    "global_access": {
      "title": "Acceso Global",
      "description": "Acceso instantáneo a todos los datos públicos de Dataverse sin configuración requerida"
    }
  },
  "quickstart": {
    "title": "Guía de Inicio Rápido",
    "mcp_setup": {
      "title": "1. Configuración del Servidor MCP"
    },
    "ai_usage": {
      "title": "2. Usar con Herramientas de IA"
    },
    "examples": {
      "0": "Encuentra y analiza datos de investigación de COVID-19",
      "1": "Muéstrame las últimas tendencias en datos de cambio climático",
      "2": "Encuentra y resume conjuntos de datos económicos"
    }
  },
  "language": {
    "select": "Seleccionar Idioma",
    "korean": "한국어",
    "english": "English",
    "japanese": "日本語",
    "chinese": "中文",
    "spanish": "Español"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ocurrió un error",
    "retry": "Reintentar",
    "close": "Cerrar",
    "back": "Atrás",
    "next": "Siguiente",
    "previous": "Anterior",
    "page": "Página",
    "of": "de",
    "total": "Total"
  },
  "ui": {
    "no_description": "Sin descripción disponible",
    "unknown": "Desconocido",
    "author": "Autor",
    "view_detail": "Ver Detalles",
    "show_more": "+{count} más",
    "show_less": "Mostrar menos",
    "search_strategy": "Estrategia de Búsqueda",
    "search_time": "Tiempo de Búsqueda",
    "applied_filters": "Filtros Aplicados",
    "search_suggestions": "Sugerencias de Búsqueda",
    "search_other_instances": "Buscar con la misma consulta en otras instancias de Dataverse",
    "search_hint": "Haga clic para buscar \"{query}\" en esta instancia",
    "country_count": "{country} ({count} instancias)",
    "ms": "ms",
    "count_suffix": " resultados",
    "pagination_info": "Filtrando resultados. Paginación disponible después de re-buscar API (🔍) o restablecer filtros"
  },
  "pagination": {
    "page_info": "Página {current} / {total}",
    "total_results": "Total {count} resultados",
    "page_jump_label": "Ir a página:",
    "page_jump_button": "Ir",
    "page_size_label": "Tamaño de página:",
    "first": "Primera",
    "previous": "Anterior",
    "next": "Siguiente",
    "last": "Última"
  },
  "filter": {
    "placeholder": "Filtrar resultados (título, autor, tema) - Presiona Enter para re-buscar",
    "button": "Re-buscar",
    "clear": "Limpiar",
    "clear_tooltip": "Limpiar filtro",
    "search_tooltip": "Re-buscar con API",
    "filtered_info": "{filtered} resultados filtrados (de {total} total)",
    "api_search_hint": "Presiona Enter o botón 🔍 para re-buscar con API"
  },
  "errors": {
    "api_error": "Error de API de búsqueda: {status} {message}",
    "search_error": "Ocurrió un error durante la búsqueda: {message}",
    "instance_search_error": "Error buscando en {instance}: {message}",
    "no_results_fetch": "No se pueden obtener los resultados de búsqueda"
  }
}; 