import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart, removeFromCart, updateQuantity } from '../store/cartSlice'
import { useAuth } from '../store/hooks/useAuth'
import { useOrders } from '../store/hooks/useOrders'
import ProductImage from './ProductImage'

function ShoppingCart() {
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })

  const items = useSelector((state) => state.cart.items)
  const { user } = useAuth()
  const { createOrder, error: orderError } = useOrders()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const handleQuantityChange = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }))
    setCheckoutMessage('')
  }

  const handleRemove = (id) => {
    dispatch(removeFromCart(id))
    setCheckoutMessage('')
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateAddress = () => {
    const { street, city, state, zipCode, country } = address
    if (!street || !city || !state || !zipCode || !country) {
      setCheckoutMessage('Please fill in all address fields')
      return false
    }
    return true
  }

  const handleCheckout = async () => {
    if (!user?.uid) {
      setCheckoutMessage('You must be logged in to checkout')
      return
    }

    if (!validateAddress()) {
      return
    }

    setIsCheckingOut(true)
    setCheckoutMessage('')

    try {
      const result = await createOrder(user.uid, items, address)

      if (result.payload?.error) {
        setCheckoutMessage(`Error: ${result.payload.error}`)
      } else {
        // Order created successfully
        setCheckoutMessage(`Order created successfully! Order ID: ${result.payload?.orderId || 'N/A'}`)
        dispatch(clearCart())
        setShowAddressForm(false)
        setAddress({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        })

        // Redirect to orders page after a brief delay
        setTimeout(() => {
          navigate('/orders')
        }, 2000)
      }
    } catch (error) {
      setCheckoutMessage(`Error during checkout: ${error.message}`)
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <aside className="cart">
      <h2>Shopping Cart</h2>

      {items.length === 0 ? (
        <p className="status">Your cart is currently empty.</p>
      ) : (
        <>
          <ul className="cart__list">
            {items.map((item) => (
              <li key={item.id} className="cart__item">
                <ProductImage src={item.image} alt={item.title} className="cart__item-image" />
                <div className="cart__item-details">
                  <h3>{item.title}</h3>
                  <p>${item.price.toFixed(2)}</p>
                  <label htmlFor={`quantity-${item.id}`}>Count</label>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      handleQuantityChange(item.id, Number.parseInt(event.target.value, 10) || 1)
                    }
                  />
                </div>
                <button type="button" onClick={() => handleRemove(item.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="cart__summary">
            <p>Total products: {totalCount}</p>
            <p>Total price: ${totalPrice.toFixed(2)}</p>
          </div>

          {showAddressForm ? (
            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
              <h3>Shipping Address</h3>

              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                  disabled={isCheckingOut}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={address.city}
                    onChange={handleAddressChange}
                    required
                    disabled={isCheckingOut}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                    disabled={isCheckingOut}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code</label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    required
                    disabled={isCheckingOut}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={address.country}
                    onChange={handleAddressChange}
                    required
                    disabled={isCheckingOut}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCheckout} disabled={isCheckingOut} className="checkout-btn">
                  {isCheckingOut ? 'Processing...' : 'Complete Order'}
                </button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="cancel-btn">
                  Back
                </button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setShowAddressForm(true)} disabled={items.length === 0} className="checkout-btn">
              Checkout
            </button>
          )}
        </>
      )}

      {checkoutMessage && (
        <p className={`status ${checkoutMessage.includes('Error') ? 'status--error' : 'status--success'}`}>
          {checkoutMessage}
        </p>
      )}
    </aside>
  )
}

export default ShoppingCart

