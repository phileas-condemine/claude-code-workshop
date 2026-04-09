import { ref } from 'vue'

// Singleton state - shared across all component instances
const submittedOrders = ref([])
let orderCounter = 1

export function useSubmittedOrders() {
  const submitOrder = (items, totalCost) => {
    // Generate auto-incrementing order number
    const orderNumber = `RST-2026-${String(orderCounter++).padStart(4, '0')}`

    // Current date
    const orderDate = new Date().toISOString()

    // Calculate random delivery date (7-30 days from now)
    const deliveryDays = Math.floor(Math.random() * 24) + 7
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays)

    // Create order object matching Order model structure
    const order = {
      id: `rst-${Date.now()}`,
      order_number: orderNumber,
      customer: 'Restocking Order',
      items: items.map(item => ({
        sku: item.sku,
        name: item.name,
        quantity: item.order_quantity,
        unit_price: item.unit_cost
      })),
      status: 'Processing',
      warehouse: 'All Warehouses',
      category: 'Restocking',
      order_date: orderDate,
      expected_delivery: deliveryDate.toISOString(),
      total_value: totalCost,
      actual_delivery: null
    }

    // Add to beginning of array
    submittedOrders.value.unshift(order)
  }

  return {
    submittedOrders,
    submitOrder
  }
}
