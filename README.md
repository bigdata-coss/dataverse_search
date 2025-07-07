# Dataverse MCP Server

A **Model Context Protocol (MCP) server** that enables AI tools to search and analyze research data from Dataverse instances worldwide.

![Vision Pro Style](https://img.shields.io/badge/UI-Vision%20Pro%20Style-blue?style=for-the-badge)
![SvelteKit v5](https://img.shields.io/badge/SvelteKit-v5-ff6b00?style=for-the-badge&logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)

## ✨ Features

- 🔍 **AI-Powered Search**: Natural language research data discovery
- 🌐 **Multi-Instance Support**: Unified search across 32 global Dataverse instances
- 🤖 **MCP Compatible**: Direct integration with Claude, ChatGPT, and other AI tools
- 📡 **SSE Support**: Real-time search status updates via Server-Sent Events
- 🌍 **Multilingual**: Support for Korean, English, Japanese, Chinese, and Spanish
- 💎 **Vision Pro UI**: Glassmorphism design with modern interface
- ♿ **Full Accessibility**: WCAG 2.1 AA compliant
- 📱 **Mobile Responsive**: Optimized experience across all devices

## 🚀 Quick Start

### 1. System Requirements
- **Node.js 20.0.0 or higher** required
- npm or yarn package manager

### 2. Clone and Setup

```bash
git clone https://github.com/bigdata-coss/dataverse_search.git
cd elpai_dataverse_MCP
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Configuration

```bash
cp env.example .env
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Tech Stack

- **Frontend**: SvelteKit v5 + TypeScript
- **Styling**: Tailwind CSS v4 + Glassmorphism
- **Icons**: Lucide Svelte
- **MCP SDK**: @modelcontextprotocol/sdk v1.13.2
- **i18n**: Custom multilingual support system
- **Runtime**: Node.js 20.x
- **Deployment**: Vercel
- **Validation**: Zod

## 🎯 Using the MCP Server

### Claude Desktop Integration

1. Configure MCP server in Claude Desktop settings:

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

2. Restart Claude and try queries like:

```
"Find COVID-19 related research data and analyze it"
"Show me climate change datasets and trends"
"Search for economics data in the US"
"Find machine learning datasets across all Dataverse instances"
```

### 🧪 Testing MCP SSE

To test if the MCP server supports Server-Sent Events (SSE):

#### 1. Manual Testing
```bash
# Check MCP server status
curl -X GET https://dataverse.elpai.org/api/mcp

# Test search request (JSON-RPC 2.0)
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

#### 2. Claude Desktop Connection Test
Verify MCP server connection in Claude Desktop:
- Check for "🔌 MCP" icon at bottom of Claude Desktop
- Verify "global-dataverse-mcp" appears in connection list
- Measure response time after executing search commands

#### 3. SSE Streaming Test
```javascript
// Run in browser developer tools
const eventSource = new EventSource('https://dataverse.elpai.org/api/mcp/stream');
eventSource.onmessage = function(event) {
  console.log('SSE Message:', event.data);
};
eventSource.onerror = function(event) {
  console.error('SSE Error:', event);
};
```

### 🔧 Supported MCP Tools

| Tool | Description | Parameters | Example Use |
|------|-------------|------------|-------------|
| `search-datasets` | Search datasets in specific instance | query, instance_url, type, per_page | Search "cancer" in Harvard Dataverse |
| `search-global-dataverse` | Search across all active instances globally | query, type, per_page | Global search for "climate change" |
| `search-by-country` | Search within specific country instances | query, country, type, per_page | Search "AI" data in Germany |
| `get-dataset-info` | Get detailed dataset info by DOI/Handle | persistent_id, instance_url | Retrieve dataset metadata by DOI |
| `list-dataverse-instances` | List available instances | country (optional) | Get all active instances or by country |

### 📊 Supported MCP Resources

| Resource | Description | Real-time Updates |
|----------|-------------|-------------------|
| `dataverse://guide` | Dataverse usage guide | ❌ |
| `dataverse://instances` | Instance list and status | ✅ |
| `dataverse://stats` | Real-time statistics and metrics | ✅ |

## 🌍 Supported Dataverse Instances

### 📈 Statistics Summary
- **Total Instances**: 32
- **Active Instances**: 31
- **Supported Countries**: 22
- **Inactive Instances**: 1 (SNU Dataverse)

### 🌟 Major Instances (Default Search)
- **Harvard Dataverse** (USA): https://dataverse.harvard.edu
- **TU Delft Research Data** (Netherlands): https://data.4tu.nl
- **DataverseNL** (Netherlands): http://dataverse.nl
- **Göttingen Research Online** (Germany): https://data.goettingen-research-online.de

### 🌍 Regional Instance Distribution

#### 🇺🇸 **Americas (9 instances)**
- **USA (6)**: Harvard, Johns Hopkins, George Mason, Florida International, Yale, UNC
- **Brazil (2)**: FGV Dataverse, Arca Dados (Fiocruz)
- **Argentina (1)**: UNR Academic Data Repository

#### 🇪🇺 **Europe (12 instances)**
- **Germany (3)**: Göttingen, DaRUS Stuttgart, IIT
- **Netherlands (2)**: DataverseNL, TU Delft
- **Spain (2)**: CORA-CSUC, e-cienciaDatos
- **Denmark, Norway, Belgium, France, Portugal** (1 each)

#### 🌏 **Asia-Pacific (4 instances)**
- **China**: Fudan University
- **Singapore**: NTU Data Repository
- **Australia**: ADA Dataverse
- **South Korea**: SNU Dataverse (currently inactive)

#### 🌍 **Other Regions (7 instances)**
- **Ukraine**: DataverseUA
- **Kenya**: World Agroforestry
- **Mexico**: CIMMYT Research Data
- **Ecuador**: CEDIA Indata
- **Uruguay**: ANII Redata

## 🌐 Multilingual Support

### Supported Languages
- 🇰🇷 **Korean (ko)**: Default language
- 🇺🇸 **English (en)**: International standard
- 🇯🇵 **Japanese (ja)**: Japanese researcher support
- 🇨🇳 **Chinese (zh)**: Chinese researcher support
- 🇪🇸 **Spanish (es)**: Spanish-speaking researcher support

### Automatic Language Detection
- Browser language setting-based auto-detection
- User preference storage (localStorage)
- Real-time UI updates on language change

## 📁 Project Structure

```
src/
├── routes/
│   ├── +layout.svelte          # Root layout (multilingual support)
│   ├── +page.svelte            # Main dashboard
│   └── api/
│       └── mcp/
│           ├── +server.ts      # MCP server endpoint (5 tools)
│           └── search/
│               └── +server.ts  # Search API endpoint
├── lib/
│   ├── components/             # Reusable components
│   │   ├── InstanceSelector.svelte
│   │   ├── LanguageSelector.svelte  # Language selector
│   │   ├── SearchForm.svelte
│   │   ├── ResultsFilter.svelte
│   │   └── Pagination.svelte
│   ├── i18n/                  # Multilingual support system
│   │   ├── index.ts           # i18n core logic
│   │   └── translations/      # Language-specific translation files
│   │       ├── ko.js          # Korean
│   │       ├── en.js          # English
│   │       ├── ja.js          # Japanese
│   │       ├── zh.js          # Chinese
│   │       └── es.js          # Spanish
│   ├── api/
│   │   └── dataverse.ts       # Dataverse API client
│   ├── data/
│   │   └── dataverse-instances.ts # 32 instance metadata
│   └── types/
│       ├── dataverse.ts       # Dataverse type definitions
│       └── mcp.ts             # MCP type definitions
├── app.html                   # HTML template
└── app.css                    # Global CSS (Vision Pro style)
```

## 🔧 Development Guide

### System Requirements
```bash
# Node.js 20.x or higher required
node --version  # v20.0.0+

# Package manager
npm --version   # 9.x+
```

### Code Style

This project follows **strict coding standards**:

- ✅ **SvelteKit v5 Runes Syntax** (`$state`, `$derived`, `$effect`)
- ✅ **TypeScript Type Safety** (mandatory nullable value checks)
- ✅ **Accessibility Compliance** (button elements, ARIA attributes, keyboard navigation)
- ✅ **Vision Pro Style** UI design (glassmorphism)
- ✅ **Mobile Compatibility** (touch-friendly, responsive)
- ✅ **Multilingual Support** (i18n function usage)

### Build and Deployment

```bash
# Production build
npm run build

# Local production preview
npm run preview

# Type checking
npm run check

# Deploy to Vercel
vercel deploy --prod
```

### Environment Variables

```bash
# .env file
VERCEL_URL=dataverse.elpai.org
NODE_ENV=production
```

## 🔍 API Endpoints

### GET /api/mcp
Get MCP server status and basic information

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
Process MCP requests (JSON-RPC 2.0 protocol)

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
Direct search API (internal use)

```json
{
  "query": "climate change",
  "country": "Germany",
  "per_page": 20,
  "start": 0,
  "sort": "relevance"
}
```

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Environment Setup
```bash
# Node.js 20.x or higher required
node --version  # v20.0.0+

# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run check

# Adding multilingual translations (for new languages)
# 1. Add new language file to src/lib/i18n/translations/
# 2. Add language code to src/lib/i18n/index.ts
# 3. Add to supportedLanguages array
```

## 📝 License

This project is distributed under the MIT License. See [LICENSE](LICENSE) file for more information.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP standard protocol
- [Dataverse Project](https://dataverse.org/) - Open source research data repository
- [SvelteKit](https://kit.svelte.dev/) - Next-generation web application framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vercel](https://vercel.com/) - Modern deployment platform

---

**Made with ❤️ by ELPAI Team**

Making global research data more accessible through the power of AI.
Connecting 32 instances, 22 countries, and 5 languages to break down research barriers.

### 🌐 Deployed Sites
- **Main Site**: https://dataverse.elpai.org
- **GitHub Repository**: https://github.com/bigdata-coss/dataverse_search
- **MCP Endpoint**: https://dataverse.elpai.org/api/mcp 