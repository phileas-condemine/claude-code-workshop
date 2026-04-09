# System Architecture

Factory Inventory Management System - A full-stack demo application for managing factory operations including inventory tracking, order management, demand forecasting, and spending analytics.

---

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Diagram](#architecture-diagram)
- [Data Flow](#data-flow)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Model](#data-model)
- [Key Design Patterns](#key-design-patterns)

---

## System Overview

The Factory Inventory Management System is a modern, full-stack web application designed to demonstrate best practices in building responsive, data-driven business applications. The system provides real-time visibility into factory operations across multiple warehouses with comprehensive filtering capabilities.

### Key Features

- **Dashboard**: Real-time KPIs, order health metrics, and performance tracking
- **Inventory Management**: Multi-warehouse inventory tracking with low-stock alerts
- **Restocking**: AI-powered budget-based restocking recommendations with order submission
- **Order Processing**: Order lifecycle management with status tracking and submitted restocking orders
- **Demand Forecasting**: Trend analysis and demand prediction
- **Backlog Monitoring**: Delayed order tracking with priority management
- **Spending Analytics**: Budget tracking, category spending, and transaction history
- **Reports**: Quarterly and monthly trend analysis

### Core Capabilities

- **Global Filtering**: 4 filters (Time Period, Warehouse, Category, Order Status) apply consistently across all views
- **Multi-Warehouse**: Track inventory and orders across San Francisco, London, and Tokyo warehouses
- **Real-time Updates**: Reactive UI updates based on filter changes
- **Internationalization**: Support for English and Japanese languages
- **Responsive Design**: Mobile-friendly interface with modern UI components

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue 3** | ^3.4.21 | Progressive JavaScript framework with Composition API |
| **Vue Router** | ^4.3.0 | Client-side routing for SPA navigation |
| **Axios** | ^1.6.7 | HTTP client for API communication |
| **Vite** | ^5.2.0 | Fast development server and build tool |

**Key Frontend Patterns:**
- Composition API for component logic
- Composables for shared state (singleton pattern)
- Reactive refs and computed properties
- Centralized API client

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | >=0.110.0 | Modern Python web framework with automatic OpenAPI docs |
| **Pydantic** | >=2.5.0 | Data validation and serialization |
| **Uvicorn** | >=0.24.0 | ASGI server for serving FastAPI applications |

**Key Backend Patterns:**
- RESTful API design
- Pydantic models for type safety
- In-memory data store (no database)
- Functional filtering approach

### Testing & Development

| Tool | Purpose |
|------|---------|
| **pytest** | Backend testing framework |
| **pytest-asyncio** | Async test support |
| **httpx** | HTTP client for FastAPI testing |
| **uv** | Fast Python package manager |
| **npm** | Node.js package manager |

### Infrastructure

- **Development Servers**: Frontend (port 3000), Backend (port 8001)
- **CORS**: Configured for local development
- **Data Storage**: JSON files loaded into memory at startup
- **No Database**: Simplified demo architecture with in-memory data

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT BROWSER                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Vue 3 Application                            │  │
│  │                    http://localhost:3000                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    │ (Axios)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  App.vue (Root Component)                                        │   │
│  │    ├── Vue Router (Navigation)                                   │   │
│  │    ├── FilterBar (Global State)                                  │   │
│  │    └── Views (7 pages)                                           │   │
│  │         ├── Dashboard.vue                                        │   │
│  │         ├── Inventory.vue                                        │   │
│  │         ├── Orders.vue                                           │   │
│  │         ├── Demand.vue                                           │   │
│  │         ├── Backlog.vue                                          │   │
│  │         ├── Spending.vue                                         │   │
│  │         └── Reports.vue                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Composables (Shared State)                                      │   │
│  │    ├── useFilters.js   → Global filter state                    │   │
│  │    ├── useI18n.js      → Internationalization                   │   │
│  │    └── useAuth.js      → Authentication state                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  api.js (Centralized API Client)                                │   │
│  │    → Handles all HTTP requests to backend                       │   │
│  │    → Constructs query parameters from filters                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    │ /api/*
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  FastAPI Application                                             │   │
│  │    http://localhost:8001                                         │   │
│  │    ├── Interactive Docs: /docs                                   │   │
│  │    └── CORS Middleware                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  API Endpoints (main.py)                                         │   │
│  │    ├── GET /api/inventory            [warehouse, category]      │   │
│  │    ├── GET /api/orders              [warehouse, category,        │   │
│  │    │                                  status, month]             │   │
│  │    ├── GET /api/dashboard/summary   [all filters]               │   │
│  │    ├── GET /api/demand                                           │   │
│  │    ├── GET /api/backlog                                          │   │
│  │    └── GET /api/spending/*          [summary, monthly,          │   │
│  │                                       categories, transactions]  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Business Logic                                                  │   │
│  │    ├── apply_filters()       → Filter by warehouse/category/    │   │
│  │    │                            status                           │   │
│  │    ├── filter_by_month()     → Filter by month/quarter          │   │
│  │    └── Pydantic Models       → Data validation                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Data Loader (mock_data.py)                                     │   │
│  │    → Loads JSON files at startup                                │   │
│  │    → Provides in-memory data access                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ File I/O
                                    │ (At Startup)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  JSON Files (server/data/)                                       │   │
│  │    ├── inventory.json            → 50+ inventory items          │   │
│  │    ├── orders.json               → 1000+ orders (2025 data)     │   │
│  │    ├── demand_forecasts.json     → Demand predictions           │   │
│  │    ├── backlog_items.json        → Delayed orders               │   │
│  │    ├── spending.json             → Budget and spending data     │   │
│  │    ├── transactions.json         → Transaction history          │   │
│  │    └── purchase_orders.json      → Purchase order records       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Filter-Driven Data Flow

The application uses a filter-driven architecture where user selections in the UI cascade through the system:

```
1. USER ACTION
   ↓
   User selects filter in FilterBar component
   (e.g., Warehouse: "San Francisco", Month: "2025-03")

2. STATE UPDATE
   ↓
   useFilters composable updates reactive refs
   - selectedLocation.value = "San Francisco"
   - selectedPeriod.value = "2025-03"
   ↓
   All components watching these refs are notified

3. API REQUEST
   ↓
   Component calls api.js method with filters
   getCurrentFilters() → { warehouse: "San Francisco", month: "2025-03" }
   ↓
   axios.get('/api/orders?warehouse=San Francisco&month=2025-03')

4. BACKEND PROCESSING
   ↓
   FastAPI receives request with query params
   ↓
   apply_filters() filters in-memory data
   ↓
   filter_by_month() applies time filtering
   ↓
   Pydantic validates response structure

5. RESPONSE
   ↓
   JSON array of filtered orders returned
   ↓
   Frontend receives response.data

6. UI UPDATE
   ↓
   Vue component updates refs with new data
   orders.value = response.data
   ↓
   Computed properties recalculate
   filteredOrders = computed(() => ...)
   ↓
   Template re-renders with new data
   
7. USER SEES RESULTS
   ↓
   Charts, tables, and KPIs update reactively
```

### Detailed Data Flow Example: Dashboard Load

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. Component Mount (Dashboard.vue)                                   │
├──────────────────────────────────────────────────────────────────────┤
│   onMounted(() => {                                                  │
│     loadDashboardData()                                              │
│   })                                                                 │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 2. Get Current Filters                                               │
├──────────────────────────────────────────────────────────────────────┤
│   const { getCurrentFilters } = useFilters()                        │
│   const filters = getCurrentFilters()                               │
│   // Returns: { warehouse: 'all', category: 'all', ... }            │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 3. API Call (client/src/api.js)                                     │
├──────────────────────────────────────────────────────────────────────┤
│   async getDashboardSummary(filters) {                              │
│     const params = new URLSearchParams()                            │
│     if (filters.warehouse !== 'all')                                │
│       params.append('warehouse', filters.warehouse)                 │
│     ...                                                              │
│     return axios.get('/api/dashboard/summary?' + params)            │
│   }                                                                  │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 4. FastAPI Endpoint (server/main.py)                                │
├──────────────────────────────────────────────────────────────────────┤
│   @app.get("/api/dashboard/summary")                                │
│   def get_dashboard_summary(                                        │
│     warehouse: Optional[str] = None,                                │
│     category: Optional[str] = None,                                 │
│     status: Optional[str] = None,                                   │
│     month: Optional[str] = None                                     │
│   ):                                                                 │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 5. In-Memory Filtering                                              │
├──────────────────────────────────────────────────────────────────────┤
│   filtered_inventory = apply_filters(                               │
│     inventory_items, warehouse, category                            │
│   )                                                                  │
│   filtered_orders = apply_filters(                                  │
│     orders, warehouse, category, status                             │
│   )                                                                  │
│   filtered_orders = filter_by_month(filtered_orders, month)        │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 6. Calculate Metrics                                                │
├──────────────────────────────────────────────────────────────────────┤
│   total_inventory_value = sum(                                      │
│     item["quantity"] * item["cost"]                                 │
│     for item in filtered_inventory                                  │
│   )                                                                  │
│   low_stock_items = len([...])                                      │
│   pending_orders = len([...])                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 7. Return JSON Response                                             │
├──────────────────────────────────────────────────────────────────────┤
│   {                                                                  │
│     "total_inventory_value": 1234567.89,                            │
│     "low_stock_items": 12,                                          │
│     "pending_orders": 45,                                           │
│     "total_backlog_items": 8                                        │
│   }                                                                  │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 8. Vue Reactive Update                                              │
├──────────────────────────────────────────────────────────────────────┤
│   summary.value = response.data                                     │
│   loading.value = false                                             │
│   // Template automatically re-renders                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App.vue (Root)
├── FilterBar (Global filter controls)
├── ProfileMenu (User profile dropdown)
├── LanguageSwitcher (i18n toggle)
├── TasksModal (Task management)
└── Router View (Current page)
    ├── Dashboard.vue
    │   ├── KPI Cards (5 metrics)
    │   ├── Order Health Chart (Donut chart)
    │   ├── Revenue Trend Chart (Line chart)
    │   └── Low Stock Alerts (Table)
    ├── Inventory.vue
    │   ├── Inventory Summary Cards
    │   ├── Inventory Table
    │   └── InventoryDetailModal (On-demand)
    ├── Restocking.vue
    │   ├── Budget Slider Control
    │   ├── Recommendations Table (AI-powered)
    │   └── Place Order Button
    ├── Orders.vue
    │   ├── Submitted Orders Section (NEW)
    │   ├── Order Status Cards
    │   ├── Orders Table
    │   └── ProductDetailModal (On-demand)
    ├── Demand.vue
    │   ├── Forecast Summary
    │   └── Demand Trends Chart
    ├── Backlog.vue
    │   ├── Backlog Summary
    │   ├── Backlog Table
    │   └── BacklogDetailModal (On-demand)
    ├── Spending.vue
    │   ├── Spending Summary Cards
    │   ├── Monthly Chart
    │   ├── Category Breakdown
    │   ├── Transaction Table
    │   └── CostDetailModal (On-demand)
    └── Reports.vue
        ├── Quarterly Reports
        └── Monthly Trends
```

### State Management Strategy

**Singleton Composables Pattern:**

Instead of Vuex/Pinia, this application uses Vue 3 composables with shared reactive state:

```javascript
// composables/useFilters.js
const selectedPeriod = ref('all')  // Shared across ALL components
const selectedLocation = ref('all')
const selectedCategory = ref('all')
const selectedStatus = ref('all')

export function useFilters() {
  // Any component can access and modify these refs
  return {
    selectedPeriod,
    selectedLocation,
    selectedCategory,
    selectedStatus,
    // ... methods
  }
}
```

**Benefits:**
- Simpler than Vuex for small/medium apps
- Less boilerplate
- Type-safe
- Reactive across all components

### Routing

Client-side routing using Vue Router with history mode:

```javascript
Routes:
  /           → Dashboard.vue
  /inventory  → Inventory.vue
  /restocking → Restocking.vue (NEW)
  /orders     → Orders.vue
  /demand     → Demand.vue
  /backlog    → Backlog.vue (Note: Not in main router, check implementation)
  /spending   → Spending.vue
  /reports    → Reports.vue
```

### Component Communication

**Props Down, Events Up:**
- Parent components pass data via props
- Child components emit events to notify parent

**Shared State (Composables):**
- Global filters managed by `useFilters()`
- Submitted restocking orders in `useSubmittedOrders()` (NEW)
- Authentication state in `useAuth()`
- Internationalization in `useI18n()`

**API Integration:**
- Centralized in `api.js`
- All components import and use the same API client
- Consistent error handling

### Restocking Feature Architecture (NEW)

**Purpose:** Automate restocking decisions by providing budget-based recommendations from demand forecasts.

**Data Flow:**
```
1. Restocking.vue loads demand forecasts + inventory data (parallel API calls)
2. User adjusts budget slider ($0-$100,000)
3. recommendations computed property recalculates:
   - Cross-references demand forecast SKUs with inventory unit costs
   - Filters for 'increasing' or 'stable' trends
   - Sorts by forecasted_demand (descending)
   - Greedy algorithm selects items until budget exhausted
4. User clicks "Place Order"
5. submitOrder() in useSubmittedOrders composable:
   - Generates auto-incrementing order number (RST-2026-0001, 0002, ...)
   - Calculates random delivery date (7-30 days from today)
   - Creates order object matching Order model
   - Adds to singleton ref array (unshift for top placement)
6. Router navigates to /orders
7. Orders.vue displays submitted orders in green-highlighted section at top
```

**Key Implementation Details:**
- **State Management**: Singleton composable pattern with module-level refs
- **Algorithm**: Greedy approach prioritizing highest forecasted demand
- **SKU Matching**: Map-based O(1) lookup from inventory data
- **Persistence**: Frontend only (resets on page refresh)
- **Order Format**: Matches existing Order model for seamless display
- **Reactivity**: Vue refs ensure automatic UI updates across components

---

## Backend Architecture

### Endpoint Organization

The backend follows a resource-based RESTful design:

```
Core Resources:
  GET  /api/inventory              → List inventory items
  GET  /api/inventory/{id}         → Get single item
  GET  /api/orders                 → List orders
  GET  /api/orders/{id}            → Get single order

Analytics:
  GET  /api/dashboard/summary      → Dashboard KPIs
  GET  /api/demand                 → Demand forecasts
  GET  /api/backlog                → Backlog items

Spending:
  GET  /api/spending/summary       → Total spending
  GET  /api/spending/monthly       → Month breakdown
  GET  /api/spending/categories    → Category breakdown
  GET  /api/spending/transactions  → Transaction list

Reports:
  GET  /api/reports/quarterly      → Quarterly reports
  GET  /api/reports/monthly-trends → Monthly trends
```

### Data Loading

**Startup Process:**

```python
# server/mock_data.py
1. Load JSON files from server/data/ directory
2. Parse JSON into Python dicts
3. Store in module-level variables (in-memory)

# server/main.py
4. Import data from mock_data module
5. FastAPI starts with data already loaded
6. Endpoints access data directly from memory
```

**No Database:**
- All data exists in memory during runtime
- Changes don't persist (restart reloads from JSON)
- Fast read performance (no query overhead)
- Suitable for demos and prototypes

### Filtering Architecture

**Two-Stage Filtering:**

```python
# Stage 1: Common filters (warehouse, category, status)
def apply_filters(items, warehouse, category, status):
    filtered = items
    if warehouse and warehouse != 'all':
        filtered = [item for item in filtered 
                   if item['warehouse'] == warehouse]
    if category and category != 'all':
        filtered = [item for item in filtered 
                   if item['category'].lower() == category.lower()]
    if status and status != 'all':
        filtered = [item for item in filtered 
                   if item['status'].lower() == status.lower()]
    return filtered

# Stage 2: Time-based filtering (month/quarter)
def filter_by_month(items, month):
    if not month or month == 'all':
        return items
    if month.startswith('Q'):
        # Handle quarters (Q1-2025, Q2-2025, etc.)
        months = QUARTER_MAP[month]
        return [item for item in items 
               if any(m in item['order_date'] for m in months)]
    else:
        # Handle specific month (2025-01, 2025-02, etc.)
        return [item for item in items 
               if month in item['order_date']]
```

### Data Validation

**Pydantic Models:**

```python
class Order(BaseModel):
    id: str
    order_number: str
    customer: str
    items: List[dict]
    status: str
    order_date: str
    expected_delivery: str
    total_value: float
    actual_delivery: Optional[str] = None
    warehouse: Optional[str] = None
    category: Optional[str] = None
```

**Benefits:**
- Automatic validation of request/response data
- Type hints for IDE support
- Auto-generated OpenAPI documentation
- Runtime type checking

---

## Data Model

### Entity Relationships

```
┌─────────────────┐
│  Inventory Item │
│  ─────────────  │
│  - id           │──┐
│  - sku          │  │
│  - name         │  │
│  - category     │  │
│  - warehouse    │  │
│  - quantity     │  │
│  - reorder_point│  │
│  - unit_cost    │  │
└─────────────────┘  │
                     │ Referenced by SKU
                     │
┌─────────────────┐  │
│     Order       │  │
│  ─────────────  │  │
│  - id           │  │
│  - order_number │  │
│  - customer     │  │
│  - items[]      │──┘ Contains: { sku, name, quantity, price }
│  - status       │
│  - order_date   │
│  - total_value  │
│  - warehouse    │
│  - category     │
└─────────────────┘
        │
        │ May have delays
        ↓
┌─────────────────┐
│  Backlog Item   │
│  ─────────────  │
│  - id           │
│  - order_id     │──→ References Order
│  - item_sku     │──→ References Inventory
│  - qty_needed   │
│  - qty_available│
│  - days_delayed │
│  - priority     │
└─────────────────┘
        │
        │ May have PO
        ↓
┌─────────────────┐
│ Purchase Order  │
│  ─────────────  │
│  - id           │
│  - backlog_id   │──→ References Backlog Item
│  - supplier     │
│  - quantity     │
│  - unit_cost    │
│  - expected_date│
│  - status       │
└─────────────────┘

┌─────────────────┐
│ Demand Forecast │
│  ─────────────  │
│  - id           │
│  - item_sku     │──→ References Inventory
│  - current_qty  │
│  - forecast_qty │
│  - trend        │
│  - period       │
└─────────────────┘

┌─────────────────┐
│   Transaction   │
│  ─────────────  │
│  - id           │
│  - date         │
│  - vendor       │
│  - category     │
│  - description  │
│  - amount       │
└─────────────────┘
```

### Filter Applicability

| Entity | Warehouse | Category | Status | Month |
|--------|-----------|----------|--------|-------|
| Inventory | ✓ | ✓ | ✗ | ✗ |
| Orders | ✓ | ✓ | ✓ | ✓ |
| Dashboard Summary | ✓ | ✓ | ✓ | ✓ |
| Demand Forecast | ✗ | ✗ | ✗ | ✗ |
| Backlog | ✗ | ✗ | ✗ | ✗ |
| Spending | ✗ | ✗ | ✗ | ✗ |

**Note:** Inventory doesn't have a time dimension because it represents current state, not historical data.

### Data Attributes

**Warehouses:**
- San Francisco
- London
- Tokyo

**Categories:**
- Circuit Boards
- Sensors
- Actuators
- Controllers
- Power Supplies

**Order Statuses:**
- Delivered
- Shipped
- Processing
- Backordered

**Time Periods:**
- Specific months: 2025-01 through 2025-12
- Quarters: Q1-2025, Q2-2025, Q3-2025, Q4-2025
- YTD: 'all'

---

## Key Design Patterns

### 1. Singleton State Management

**Pattern:** Shared reactive refs in composables

```javascript
// Defined once at module level
const selectedPeriod = ref('all')

export function useFilters() {
  // Every component gets the SAME ref
  return { selectedPeriod }
}
```

**Why:** Simpler than Vuex, perfect for small/medium apps

### 2. API Client Abstraction

**Pattern:** Centralized API module

```javascript
// api.js
export const api = {
  async getOrders(filters) {
    const params = buildParams(filters)
    return axios.get(`/api/orders?${params}`)
  }
}

// Component
import { api } from '@/api'
const orders = await api.getOrders(filters)
```

**Benefits:**
- Single source of truth for endpoints
- Consistent error handling
- Easy to mock for testing

### 3. Functional Filtering

**Pattern:** Pure filter functions

```python
def apply_filters(items, warehouse, category, status):
    # Returns NEW filtered list, doesn't mutate original
    filtered = items
    if warehouse and warehouse != 'all':
        filtered = [item for item in filtered 
                   if item['warehouse'] == warehouse]
    return filtered
```

**Benefits:**
- Immutable approach (doesn't modify original data)
- Composable (can chain filters)
- Testable (pure functions)

### 4. Reactive Computed Properties

**Pattern:** Derive data from refs using computed

```javascript
const allOrders = ref([])
const selectedWarehouse = ref('all')

// Automatically recalculates when dependencies change
const filteredOrders = computed(() => {
  if (selectedWarehouse.value === 'all') return allOrders.value
  return allOrders.value.filter(o => o.warehouse === selectedWarehouse.value)
})
```

**Why:** Efficient caching, automatic updates

### 5. Component Composition

**Pattern:** Reusable modals and components

```
Large View Component
  └── Renders table/chart
  └── Opens Modal Component (on-demand)
      └── Shows details
      └── Emits events to parent
```

**Benefits:**
- Code reuse
- Separation of concerns
- Lazy loading (modals only mount when opened)

### 6. Quarter Mapping

**Pattern:** Map quarters to months for flexible filtering

```python
QUARTER_MAP = {
    'Q1-2025': ['2025-01', '2025-02', '2025-03'],
    'Q2-2025': ['2025-04', '2025-05', '2025-06'],
    # ...
}

def filter_by_month(items, month):
    if month.startswith('Q'):
        months = QUARTER_MAP[month]
        return [item for item in items 
               if any(m in item['order_date'] for m in months)]
```

**Why:** Allows both granular (month) and aggregate (quarter) filtering

### 7. In-Memory Data Store

**Pattern:** Load JSON once at startup, serve from memory

```python
# Executed once when module loads
inventory_items = load_json_file('inventory.json')
orders = load_json_file('orders.json')

# Endpoints access directly
@app.get("/api/inventory")
def get_inventory():
    return apply_filters(inventory_items, ...)
```

**Tradeoffs:**
- ✓ Fast (no DB queries)
- ✓ Simple (no ORM/migrations)
- ✗ No persistence
- ✗ Not scalable for production

---

## Performance Considerations

### Frontend Optimizations

1. **Computed Properties**: Cached until dependencies change
2. **Component Lazy Loading**: Modals mount on-demand
3. **Scoped Styles**: CSS scoped to component, no global pollution
4. **Vite Development**: Fast HMR (Hot Module Replacement)

### Backend Optimizations

1. **In-Memory Data**: No database query overhead
2. **List Comprehensions**: Fast Python filtering
3. **Functional Approach**: No unnecessary data copying
4. **Uvicorn ASGI**: Async-capable server

### Scalability Path

To scale this application for production:

1. **Add Database**: Replace JSON files with PostgreSQL/MongoDB
2. **Add Caching**: Redis for frequently accessed data
3. **Add Pagination**: Limit result set sizes
4. **Add Indexing**: Database indexes on filter columns
5. **Add Queue**: Background jobs for heavy processing
6. **Add CDN**: Serve static assets from CDN
7. **Add Load Balancer**: Distribute traffic across servers

---

## Security Considerations

### Current State (Demo)

- ✗ No authentication/authorization
- ✗ CORS allows all origins
- ✗ No rate limiting
- ✗ No input sanitization beyond Pydantic types

### Production Requirements

1. **Authentication**: JWT tokens, OAuth2, or session-based
2. **Authorization**: Role-based access control (RBAC)
3. **CORS**: Restrict to specific origins only
4. **Input Validation**: Sanitize all user input
5. **Rate Limiting**: Prevent abuse
6. **HTTPS**: Encrypt all traffic
7. **Secrets Management**: Use environment variables, never commit secrets
8. **SQL Injection**: Use parameterized queries (if adding database)
9. **XSS Protection**: Sanitize rendered content
10. **CSRF Protection**: Use CSRF tokens for state-changing operations

---

## Development Workflow

### Local Development

```bash
# Terminal 1: Backend
cd server
uv run python main.py
# → http://localhost:8001
# → Docs: http://localhost:8001/docs

# Terminal 2: Frontend  
cd client
npm run dev
# → http://localhost:3000
```

### Testing

```bash
# Backend tests
cd tests
uv run pytest backend/ -v

# With coverage
uv run pytest backend/ --cov=server --cov-report=term-missing
```

### Building for Production

```bash
# Frontend build
cd client
npm run build
# → Output: client/dist/

# Backend (no build needed, Python runs directly)
# Deploy: Copy server/ directory and run with production ASGI server
```

---

## Deployment Architecture

### Recommended Production Setup

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    │   (Nginx/ALB)   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐        ┌────────▼────────┐
    │   Static Assets   │        │  API Servers    │
    │   (CDN/S3)        │        │  (Uvicorn +     │
    │   - Vue Bundle    │        │   Gunicorn)     │
    │   - CSS/JS        │        │                 │
    └───────────────────┘        └────────┬────────┘
                                          │
                                  ┌───────▼────────┐
                                  │   Database     │
                                  │  (PostgreSQL)  │
                                  └────────────────┘
```

### Environment Variables

```bash
# Backend
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8001
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://yourdomain.com
SECRET_KEY=...

# Frontend (build-time)
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Conclusion

This architecture demonstrates a modern, scalable approach to building full-stack web applications. The separation of concerns between frontend and backend, combined with reactive state management and RESTful API design, provides a solid foundation for business applications.

**Key Strengths:**
- Clean separation of concerns
- Reactive, efficient UI updates
- Type-safe API layer
- Developer-friendly with fast iteration
- Easy to understand and extend

**Ideal Use Cases:**
- Internal business tools
- Dashboards and analytics platforms
- Inventory and order management systems
- Multi-warehouse operations
- Real-time data visualization

For questions or contributions, see the main [README.md](../README.md) and [CLAUDE.md](../CLAUDE.md) files.
