import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks/useAuth'
import { useOrders } from '../../store/hooks/useOrders'
import './Orders.css'

function OrderHistory() {
  const { user } = useAuth()
  const { items: orders, isLoading, error, fetchUserOrders, selectOrder } = useOrders()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.uid) {
      fetchUserOrders(user.uid)
    }
  }, [user?.uid, fetchUserOrders])

  const handleViewOrder = (order) => {
    selectOrder(order)
    navigate(`/orders/${order.orderId}`)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#0dcaf0',
      shipped: '#0d6efd',
      delivered: '#198754',
      cancelled: '#dc3545',
    }
    return colors[status] || '#6c757d'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return <div className="orders-loading">Loading orders...</div>
  }

  return (
    <div className="orders-history">
      <h2>Order History</h2>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.orderId.substring(0, 8)}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              <div className="order-details">
                <p>
                  <strong>Items:</strong> {order.items.length}
                </p>
                <p>
                  <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Delivery:</strong> {formatDate(order.estimatedDelivery)}
                </p>
              </div>

              <button onClick={() => handleViewOrder(order)} className="view-btn">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistory
