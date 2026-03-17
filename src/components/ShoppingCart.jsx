import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearCart, removeFromCart, updateQuantity } from '../store/cartSlice'
import ProductImage from './ProductImage'

function ShoppingCart() {
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const items = useSelector((state) => state.cart.items)
  const dispatch = useDispatch()

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const handleQuantityChange = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }))
    setCheckoutMessage('')
  }

  const handleRemove = (id) => {
    dispatch(removeFromCart(id))
    setCheckoutMessage('')
  }

  const handleCheckout = () => {
    dispatch(clearCart())
    setCheckoutMessage('Checkout complete! Your cart has been cleared.')
  }

  return (
    <aside className="cart">
      <h2>Shopping Cart</h2>

      {items.length === 0 ? (
        <p className="status">Your cart is currently empty.</p>
      ) : (
        <ul className="cart__list">
          {items.map((item) => (
            <li key={item.id} className="cart__item">
              <ProductImage
                src={item.image}
                alt={item.title}
                className="cart__item-image"
              />
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
                    handleQuantityChange(
                      item.id,
                      Number.parseInt(event.target.value, 10) || 1,
                    )
                  }
                />
              </div>
              <button type="button" onClick={() => handleRemove(item.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="cart__summary">
        <p>Total products: {totalCount}</p>
        <p>Total price: ${totalPrice.toFixed(2)}</p>
      </div>

      <button type="button" onClick={handleCheckout} disabled={items.length === 0}>
        Checkout
      </button>

      {checkoutMessage ? <p className="status status--success">{checkoutMessage}</p> : null}
    </aside>
  )
}

export default ShoppingCart
