import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrders } from '../../store/hooks/useOrders'
import ProductImage from '../ProductImage'

function OrderDetail() {
  const { orderId } = useParams()
  const { selectedOrder, isLoading, error, fetchOrderById } = useOrders()
  const navigate = useNavigate()

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId)
    }
  }, [orderId, fetchOrderById])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  if (isLoading) {
    return <div className="order-loading">Loading order details...</div>
  }

  if (error) {
    return (
      <div className="order-error">
        <p>{error}</p>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    )
  }

  if (!selectedOrder) {
    return (
      <div className="order-not-found">
        <p>Order not found</p>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    )
  }

  const { orderId: id, items, totalAmount, status, shippingAddress, createdAt, estimatedDelivery } = selectedOrder

  return (
    <div className="order-detail">
      <div className="order-detail-header">
        <div>
          <h2>Order #{id.substring(0, 8)}</h2>
          <p className="order-date">Placed on {formatDate(createdAt)}</p>
        </div>
        <div className="order-status-large" style={{ backgroundColor: getStatusColor(status) }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="order-sections">
        {/* Items Section */}
        <section className="order-section">
          <h3>Order Items</h3>
          <div className="order-items">
            {items.map((item, index) => (
              <div key={index} className="order-item">
                <ProductImage src={item.image} alt={item.title} className="order-item-image" />
                <div className="order-item-info">
                  <h4>{item.title}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price per item: ${item.price.toFixed(2)}</p>
                  <p className="item-total">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Address Section */}
        <section className="order-section">
          <h3>Shipping Address</h3>
          <div className="address-box">
            <p>{shippingAddress.street}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.country}</p>
          </div>
        </section>

        {/* Order Summary Section */}
        <section className="order-section">
          <h3>Order Summary</h3>
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <p className="estimated-delivery">
              Estimated Delivery: {formatDate(estimatedDelivery)}
            </p>
          </div>
        </section>
      </div>

      <div className="order-actions">
        <button onClick={() => navigate('/orders')} className="back-btn">
          Back to Orders
        </button>
      </div>
    </div>
  )
}

export default OrderDetail
