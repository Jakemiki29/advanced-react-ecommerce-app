import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  createOrderThunk,
  fetchUserOrders,
  fetchOrderById,
  updateStatusThunk,
  cancelOrderThunk,
  setStatusFilter,
  clearError,
  selectOrder,
} from '../slices/ordersSlice'

/**
 * Custom hook to access orders state and actions
 * @returns {Object} Orders state and dispatch functions
 */
export function useOrders() {
  const dispatch = useDispatch()
  const { items, selectedOrder, isLoading, error, filters, lastUpdated } = useSelector((state) => state.orders)

  const createOrder = useCallback(
    (userId, cartItems, shippingAddress) => dispatch(createOrderThunk({ userId, items: cartItems, shippingAddress })),
    [dispatch],
  )
  const fetchOrdersForUser = useCallback((userId) => dispatch(fetchUserOrders(userId)), [dispatch])
  const fetchSingleOrder = useCallback((orderId) => dispatch(fetchOrderById(orderId)), [dispatch])
  const updateOrderStatus = useCallback((orderId, status) => dispatch(updateStatusThunk({ orderId, status })), [dispatch])
  const cancelOrderById = useCallback((orderId) => dispatch(cancelOrderThunk(orderId)), [dispatch])
  const setOrderStatusFilter = useCallback((status) => dispatch(setStatusFilter(status)), [dispatch])
  const selectCurrentOrder = useCallback((order) => dispatch(selectOrder(order)), [dispatch])
  const clearOrderError = useCallback(() => dispatch(clearError()), [dispatch])

  return {
    items,
    selectedOrder,
    isLoading,
    error,
    filters,
    lastUpdated,
    createOrder,
    fetchUserOrders: fetchOrdersForUser,
    fetchOrderById: fetchSingleOrder,
    updateOrderStatus,
    cancelOrder: cancelOrderById,
    setStatusFilter: setOrderStatusFilter,
    selectOrder: selectCurrentOrder,
    clearError: clearOrderError,
  }
}
