import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createOrder, getUserOrders, getOrderById, updateOrderStatus, cancelOrder } from '../../services/firebase/orders.service'

// Async thunk to create an order
export const createOrderThunk = createAsyncThunk(
  'orders/createOrder',
  async ({ userId, items, shippingAddress }, { rejectWithValue }) => {
    try {
      const order = await createOrder(userId, items, shippingAddress)
      return order
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Async thunk to fetch user's orders
export const fetchUserOrders = createAsyncThunk('orders/fetchUserOrders', async (userId, { rejectWithValue }) => {
  try {
    const orders = await getUserOrders(userId)
    return orders
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk to fetch a single order
export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (orderId, { rejectWithValue }) => {
  try {
    const order = await getOrderById(orderId)
    return order
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk to update order status
export const updateStatusThunk = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const order = await updateOrderStatus(orderId, status)
      return order
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Async thunk to cancel order
export const cancelOrderThunk = createAsyncThunk('orders/cancelOrder', async (orderId, { rejectWithValue }) => {
  try {
    const order = await cancelOrder(orderId)
    return order
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  items: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  filters: {
    status: null,
    dateRange: null,
  },
  lastUpdated: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    selectOrder: (state, action) => {
      state.selectedOrder = action.payload
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.unshift(action.payload) // Add to beginning of list
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Fetch User Orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Fetch Single Order
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedOrder = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Update Status
    builder
      .addCase(updateStatusThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false
        // Update order in items list
        const index = state.items.findIndex((o) => o.orderId === action.payload.orderId)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        // Update selected order if it's the one being updated
        if (state.selectedOrder?.orderId === action.payload.orderId) {
          state.selectedOrder = action.payload
        }
      })
      .addCase(updateStatusThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Cancel Order
    builder
      .addCase(cancelOrderThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.isLoading = false
        // Update order in items list
        const index = state.items.findIndex((o) => o.orderId === action.payload.orderId)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setStatusFilter, clearError, selectOrder } = ordersSlice.actions
export default ordersSlice.reducer
