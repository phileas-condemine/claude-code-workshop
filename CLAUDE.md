# CLAUDE.md

Factory Inventory Management System Demo with GitHub integration - Full-stack application with Vue 3 frontend, Python FastAPI backend, and in-memory mock data (no database).

## Architecture Overview

**Data Flow**: User filters in Vue → API calls via `client/src/api.js` → FastAPI endpoints → In-memory filtering → Pydantic validation → JSON response → Vue computed properties → UI updates

**4 Global Filters**: Time Period (month), Warehouse, Category, Order Status
- Apply to Dashboard, Orders, Inventory, and Spending views
- Managed via shared state in Vue composables
- Passed as query parameters to API endpoints

## Quick Start

**Fastest way - using skills:**
```bash
/start    # Starts both servers automatically
/stop     # Stops all running servers
```

**Manual startup:**
```bash
# Backend (port 8001)
cd server && uv run python main.py

# Frontend (port 3000)
cd client && npm install && npm run dev
```

**Testing:**
```bash
# Run all backend tests
cd tests && uv run pytest backend/ -v

# Run with coverage
uv run pytest backend/ --cov=server --cov-report=term-missing
```

## Critical Tool Usage Rules

### Agent Tool (Subagents)
Use the **Agent tool** with these specialized subagents for appropriate tasks:

- **vue-expert**: Use for Vue 3 frontend features, UI components, styling, and client-side functionality
  - Examples: Creating components, fixing reactivity issues, performance optimization, complex state management
  - **MANDATORY RULE: ANY time you need to create or significantly modify a .vue file, you MUST delegate to vue-expert**
- **code-reviewer**: Use after writing significant code to review quality and best practices
- **Explore**: Use for understanding codebase structure, searching for patterns, or answering questions about how components work
- **Plan**: Use for planning multi-step implementations before starting work
- **general-purpose**: Use for complex multi-step tasks or when other agents don't fit

### Skills (Slash Commands)
Available skills for common workflows:

- **start**: Start frontend and backend servers with comprehensive logging
- **stop**: Stop all running servers cleanly
- **test**: Run frontend and backend tests with detailed reporting
- **demo-branch**: Create new demo branch with auto-incrementing number (demo-1, demo-2, etc.)
- **reset-branch**: Switch to main and delete previous working branch
- **backend-api-test**: Guidelines for writing backend API tests with pytest and FastAPI TestClient
- **claude-api**: Build Claude API / Anthropic SDK applications
- **optimize**: Optimize codebase for performance and quality
- **simplify**: Review and simplify code for reuse, quality, and efficiency

### MCP Tools
- **ALWAYS use GitHub MCP tools** (`mcp__github__*`) for ALL GitHub operations
  - Exception: Local branches only - use `git checkout -b` instead of `mcp__github__create_branch`
  - Examples: `mcp__github__create_pull_request`, `mcp__github__create_issue`, `mcp__github__list_commits`
- **ALWAYS use Playwright MCP tools** (`mcp__playwright__*`) for browser testing
  - Test against: `http://localhost:3000` (frontend), `http://localhost:8001` (API)
  - Examples: `mcp__playwright__navigate`, `mcp__playwright__click`, `mcp__playwright__screenshot`

### Detailed Documentation
- **Frontend patterns**: See `client/CLAUDE.md` for Vue 3 Composition API, reactivity, components, and styling best practices
- **Backend patterns**: See `server/CLAUDE.md` for FastAPI endpoints, Pydantic models, filtering, and error handling
- **Test guidelines**: See `tests/README.md` and `tests/TEST_SUMMARY.md` for testing patterns and coverage

## Stack
- **Frontend**: Vue 3 + Composition API + Vite (port 3000)
- **Backend**: Python FastAPI + Pydantic + Uvicorn (port 8001)
- **Data**: JSON files in `server/data/` loaded via `server/mock_data.py` (in-memory, no database)
- **Testing**: pytest (backend), Playwright (browser automation)
- **Tooling**: uv (Python), npm (Node.js), Vite (bundler)

## Key Patterns

**Filter System**: 4 global filters apply across views
1. **Time Period** (`month`): 2025-01 through 2025-12, YTD, 'all'
2. **Warehouse**: North, South, East, West, 'all'
3. **Category**: Electronics, Machinery, Raw Materials, 'all'
4. **Order Status**: pending, in_progress, completed, cancelled, 'all'
- Filters passed as query params: `?warehouse=North&category=Electronics&month=2025-03&status=pending`
- Default 'all' means no filtering on that dimension
- Note: Inventory has no time dimension (current state only)

**Data Flow**:
1. User selects filters in Vue FilterBar component
2. Filters stored in shared composable state
3. API calls triggered via `client/src/api.js` with query params
4. FastAPI endpoints receive and validate params
5. In-memory filtering applied to loaded JSON data
6. Pydantic models validate response structure
7. Vue computed properties derive display values
8. UI updates reactively

**Reactivity Pattern**:
- Raw data in refs: `const allOrders = ref([])`
- Derived data in computed: `const totalRevenue = computed(() => calculateTotal(allOrders.value))`
- Access `.value` in script, not in template
- Watch for changes to trigger side effects

## API Endpoints

**Core Resources:**
- `GET /api/inventory` - List all inventory items
  - Filters: `warehouse`, `category`
  - No time dimension (inventory is current state)
- `GET /api/inventory/{id}` - Get single inventory item by ID
- `GET /api/orders` - List all orders
  - Filters: `warehouse`, `category`, `status`, `month`
- `GET /api/order/{id}` - Get single order by ID
- `GET /api/dashboard/summary` - Dashboard metrics and KPIs
  - Filters: All 4 filters apply

**Analytics:**
- `GET /api/demand` - Demand forecasts (no filters)
- `GET /api/backlog` - Backlog items by priority (no filters)

**Spending:**
- `GET /api/spending/summary` - Total spending overview
- `GET /api/spending/monthly` - Month-by-month spending breakdown
- `GET /api/spending/categories` - Spending grouped by category
- `GET /api/spending/transactions` - Detailed transaction list

**Documentation:**
- Interactive API docs: `http://localhost:8001/docs`

## Common Issues & Gotchas

**Frontend (Vue):**
1. **v-for keys**: Use unique identifiers (`sku`, `id`, `month`), never array `index`
   - Wrong: `:key="index"` ❌
   - Right: `:key="item.sku"` ✅
2. **Date validation**: Always validate before calling `.getMonth()` or other Date methods
   ```javascript
   const date = new Date(order.date)
   if (!isNaN(date.getTime())) { /* safe to use */ }
   ```
3. **Reactivity**: Remember `.value` in `<script>`, not in `<template>`
4. **Computed props**: Never mutate, always return new value

**Backend (FastAPI):**
1. **Pydantic models**: Must match JSON structure exactly - update models when JSON changes
2. **Filter parameters**: Always check for `'all'` value and skip that filter
3. **Case sensitivity**: Use `.lower()` for case-insensitive category matching
4. **Import paths**: In-memory data lives in `mock_data.py` module

**Data Constraints:**
1. **Inventory filters**: No `month` parameter (inventory is current state, not time-series)
2. **Orders filters**: Supports all 4 filters (month, warehouse, category, status)
3. **Revenue goals**: $800K/month (single month), $9.6M (YTD all 12 months)
4. **Date format**: ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)

**Testing:**
1. **TestClient**: Use FastAPI's TestClient, not regular HTTP client
2. **Async**: Tests should be regular functions, not async (TestClient handles this)
3. **Fixtures**: Shared test data in conftest.py
4. **Coverage**: Run with `--cov` flag to see what's tested

## File Locations

**Frontend:**
- **Views** (7 pages): `client/src/views/`
  - `Dashboard.vue`, `Inventory.vue`, `Orders.vue`, `Demand.vue`, `Backlog.vue`, `Spending.vue`, `Reports.vue`
- **Components** (9 reusable): `client/src/components/`
  - `FilterBar.vue`, `ProfileMenu.vue`, `LanguageSwitcher.vue`, `TasksModal.vue`
  - Detail modals: `ProductDetailModal.vue`, `InventoryDetailModal.vue`, `BacklogDetailModal.vue`, `CostDetailModal.vue`, `ProfileDetailsModal.vue`
- **API Client**: `client/src/api.js` - All backend communication
- **Main App**: `client/src/App.vue` - Global styles and layout
- **Router**: `client/src/router.js` - Route definitions
- **Entry**: `client/src/main.js` - Vue app initialization

**Backend:**
- **API Server**: `server/main.py` - All endpoints and FastAPI setup
- **Data Loader**: `server/mock_data.py` - Loads JSON data into memory
- **Data Files** (7 files): `server/data/`
  - `inventory.json` (product catalog), `orders.json` (order history)
  - `demand_forecasts.json`, `backlog_items.json`, `spending.json`
  - `transactions.json`, `purchase_orders.json` (not currently used)
- **Config**: `server/pyproject.toml` - Python dependencies via uv

**Testing:**
- **Backend Tests**: `tests/backend/` - pytest test suite
- **Test Config**: `tests/pytest.ini` - pytest configuration
- **Coverage**: `tests/TEST_SUMMARY.md` - Test coverage report

**Scripts:**
- `scripts/start.sh` - Start both servers (used by `/start` skill)
- `scripts/stop.sh` - Stop all servers (used by `/stop` skill)

**Configuration:**
- `CLAUDE.md` - This file (project-level guidance)
- `client/CLAUDE.md` - Vue 3 patterns and best practices
- `server/CLAUDE.md` - FastAPI patterns and best practices
- `.mcp.json` - MCP server configuration (GitHub, Playwright)
- `README.md` - User-facing documentation

## GitHub Workflow

**Branch Management:**
- Use `/demo-branch` to create demo branches (demo-1, demo-2, etc.)
- Use `/reset-branch` to return to main and clean up
- Local branches: `git checkout -b feature-name`
- Remote operations: Use `mcp__github__*` tools

**Commits:**
- Always include: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
- Format: Clear, concise message focused on "why" not "what"
- Review with `git status` and `git diff` before committing

**Pull Requests:**
- Use `mcp__github__create_pull_request` with title and description
- Include test plan and summary of changes
- Link related issues if applicable

**Issues:**
- Create with `mcp__github__create_issue`
- Use labels for categorization
- Reference in commits and PRs with `#issue-number`

## Troubleshooting

**Servers won't start:**
```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :8001  # Backend

# Kill processes if needed
kill -9 <PID>

# Or use the stop skill
/stop
```

**Frontend not showing data:**
- Check backend is running: `curl http://localhost:8001/api/dashboard/summary`
- Check browser console for errors (F12)
- Verify API_BASE_URL in `client/src/api.js`
- Check CORS settings in `server/main.py`

**Tests failing:**
```bash
# Run with verbose output
cd tests && uv run pytest backend/ -v -s

# Run single test file
uv run pytest backend/test_endpoints.py -v

# Clear pytest cache
rm -rf .pytest_cache __pycache__
```

**Data not loading:**
- Verify JSON files exist in `server/data/`
- Check JSON syntax with `python -m json.tool server/data/inventory.json`
- Restart backend to reload data
- Check server logs for Pydantic validation errors

**Vue reactivity issues:**
- Ensure using `.value` in `<script>` with refs
- Check computed dependencies are reactive
- Verify keys in v-for are unique (not array index)
- See `client/CLAUDE.md` for detailed patterns

**Module not found errors:**
```bash
# Backend
cd server && uv sync

# Frontend
cd client && rm -rf node_modules package-lock.json && npm install
```

## Design System
- Colors: Slate/gray (#0f172a, #64748b, #e2e8f0)
- Status: green/blue/yellow/red
- Charts: Custom SVG, CSS Grid for layouts
- No emojis in UI
