<template>
  <div class="restocking">
    <div class="page-header">
      <h2>Restocking</h2>
      <p>Set your budget and get AI-powered recommendations for restocking based on demand forecasts</p>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Budget Control Card -->
      <div class="card budget-card">
        <div class="card-header">
          <h3 class="card-title">Budget Control</h3>
        </div>
        <div class="budget-content">
          <div class="budget-slider-container">
            <label for="budget-slider" class="budget-label">
              Available Budget: <span class="budget-value">${{ budget.toLocaleString() }}</span>
            </label>
            <input
              id="budget-slider"
              v-model.number="budget"
              type="range"
              min="0"
              max="100000"
              step="1000"
              class="budget-slider"
            />
            <div class="budget-range-labels">
              <span>$0</span>
              <span>$100,000</span>
            </div>
          </div>
          <p class="budget-info">
            Items are prioritized by highest forecasted demand within your budget
          </p>
        </div>
      </div>

      <!-- Recommendations Table Card -->
      <div class="card recommendations-card">
        <div class="card-header">
          <h3 class="card-title">Recommended Restocking Items ({{ recommendations.length }})</h3>
          <button
            @click="handlePlaceOrder"
            :disabled="recommendations.length === 0"
            class="place-order-button"
          >
            Place Order (${{ totalCost.toLocaleString() }})
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="recommendations.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="empty-text">
            {{ budget === 0 ? 'Set a budget to see recommendations' : 'No items within budget' }}
          </p>
        </div>

        <!-- Recommendations Table -->
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-sku">SKU</th>
                <th class="col-name">Item Name</th>
                <th class="col-demand">Forecasted Demand</th>
                <th class="col-cost">Unit Cost</th>
                <th class="col-quantity">Order Quantity</th>
                <th class="col-total">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recommendations" :key="item.sku">
                <td class="col-sku"><strong>{{ item.sku }}</strong></td>
                <td class="col-name">{{ item.name }}</td>
                <td class="col-demand">{{ item.forecasted_demand }}</td>
                <td class="col-cost">${{ item.unit_cost.toLocaleString() }}</td>
                <td class="col-quantity">{{ item.order_quantity }}</td>
                <td class="col-total"><strong>${{ item.line_total.toLocaleString() }}</strong></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-row">
                <td colspan="4" class="summary-label">
                  <strong>Total ({{ recommendations.length }} items)</strong>
                </td>
                <td class="summary-quantity">
                  <strong>{{ recommendations.reduce((sum, item) => sum + item.order_quantity, 0) }}</strong>
                </td>
                <td class="summary-total">
                  <strong>${{ totalCost.toLocaleString() }}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { useSubmittedOrders } from '../composables/useSubmittedOrders'

export default {
  name: 'Restocking',
  setup() {
    const router = useRouter()
    const { submitOrder } = useSubmittedOrders()

    const loading = ref(true)
    const error = ref(null)
    const budget = ref(50000)
    const demandForecasts = ref([])
    const inventoryItems = ref([])

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null

        const [forecastsData, inventoryData] = await Promise.all([
          api.getDemandForecasts(),
          api.getInventory()
        ])

        demandForecasts.value = forecastsData
        inventoryItems.value = inventoryData
      } catch (err) {
        error.value = 'Failed to load data: ' + err.message
        console.error('Load error:', err)
      } finally {
        loading.value = false
      }
    }

    const recommendations = computed(() => {
      // Create a Map of inventory items keyed by SKU for fast lookup
      const inventoryMap = new Map()
      inventoryItems.value.forEach(item => {
        inventoryMap.set(item.sku, item)
      })

      // Filter for increasing or stable trends
      const filteredForecasts = demandForecasts.value.filter(
        forecast => forecast.trend === 'increasing' || forecast.trend === 'stable'
      )

      // Sort by forecasted demand (descending)
      const sortedForecasts = [...filteredForecasts].sort(
        (a, b) => b.forecasted_demand - a.forecasted_demand
      )

      // Greedy algorithm to select items within budget
      const selected = []
      let runningTotal = 0

      for (const forecast of sortedForecasts) {
        const inventoryItem = inventoryMap.get(forecast.item_sku)

        if (!inventoryItem) {
          console.warn(`Inventory item not found for SKU: ${forecast.item_sku}`)
          continue
        }

        const lineTotal = forecast.forecasted_demand * inventoryItem.unit_cost

        if (runningTotal + lineTotal <= budget.value) {
          selected.push({
            sku: forecast.item_sku,
            name: forecast.item_name,
            forecasted_demand: forecast.forecasted_demand,
            unit_cost: inventoryItem.unit_cost,
            order_quantity: forecast.forecasted_demand,
            line_total: lineTotal
          })
          runningTotal += lineTotal
        }
      }

      return selected
    })

    const totalCost = computed(() => {
      return recommendations.value.reduce((sum, item) => sum + item.line_total, 0)
    })

    const handlePlaceOrder = () => {
      if (recommendations.value.length === 0) return

      submitOrder(recommendations.value, totalCost.value)
      router.push('/orders')
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      error,
      budget,
      recommendations,
      totalCost,
      handlePlaceOrder
    }
  }
}
</script>

<style scoped>
/* Budget Card Styles */
.budget-card {
  margin-bottom: 1.5rem;
}

.budget-content {
  padding: 1rem;
}

.budget-slider-container {
  margin-bottom: 1rem;
}

.budget-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 1rem;
}

.budget-value {
  color: #3b82f6;
  font-size: 1.25rem;
}

.budget-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, #e2e8f0 0%, #3b82f6 100%);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.budget-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}

.budget-slider::-webkit-slider-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.5);
}

.budget-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}

.budget-slider::-moz-range-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.5);
}

.budget-range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.813rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.budget-info {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

/* Recommendations Card Styles */
.recommendations-card {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.place-order-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.place-order-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.place-order-button:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
}

.empty-text {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
}

/* Table Column Widths */
.col-sku {
  width: 120px;
}

.col-name {
  width: 240px;
}

.col-demand {
  width: 160px;
}

.col-cost {
  width: 120px;
}

.col-quantity {
  width: 140px;
}

.col-total {
  width: 140px;
}

/* Summary Row */
.summary-row {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
}

.summary-row td {
  padding: 1rem 0.75rem;
  font-size: 0.938rem;
}

.summary-label {
  text-align: right;
  color: #0f172a;
}

.summary-quantity {
  color: #0f172a;
}

.summary-total {
  color: #3b82f6;
  font-size: 1.125rem;
}

/* Table Hover Effect */
tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: #f8fafc;
}
</style>
