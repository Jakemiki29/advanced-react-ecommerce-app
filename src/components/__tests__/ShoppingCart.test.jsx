import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import cartReducer from '../../store/cartSlice'
import ShoppingCart from '../ShoppingCart'

// Mock Firebase-dependent hooks so no Firebase connection is required
vi.mock('../../store/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: null, isAuthenticated: false })),
}))

vi.mock('../../store/hooks/useOrders', () => ({
  useOrders: vi.fn(() => ({
    createOrder: vi.fn(),
    error: null,
  })),
}))

const mockCartItem = {
  id: 42,
  title: 'Canvas Tote Bag',
  price: 19.95,
  description: 'Eco-friendly canvas tote bag.',
  category: "women's clothing",
  image: 'https://example.com/tote.jpg',
  quantity: 2,
}

function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState,
  })
}

function renderWithProviders(ui, store) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  )
}

describe('ShoppingCart', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('displays an empty cart message when there are no items', () => {
    const store = createTestStore()

    renderWithProviders(<ShoppingCart />, store)

    expect(screen.getByText('Your cart is currently empty.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders cart items with title, price, and quantity when the cart has products', () => {
    const store = createTestStore({
      cart: { items: [mockCartItem], source: 'session', isLoading: false },
    })

    renderWithProviders(<ShoppingCart />, store)

    expect(screen.getByText('Canvas Tote Bag')).toBeInTheDocument()
    expect(screen.getByText('$19.95')).toBeInTheDocument()
    // Quantity input reflects current quantity
    expect(screen.getByRole('spinbutton')).toHaveValue(2)
  })

  it('displays the correct total count and total price summary', () => {
    const store = createTestStore({
      cart: { items: [mockCartItem], source: 'session', isLoading: false },
    })

    renderWithProviders(<ShoppingCart />, store)

    // mockCartItem: quantity=2, price=19.95 → total=39.90
    expect(screen.getByText('Total products: 2')).toBeInTheDocument()
    expect(screen.getByText('Total price: $39.90')).toBeInTheDocument()
  })

  it('removes item from the cart when the Remove button is clicked', () => {
    const store = createTestStore({
      cart: { items: [mockCartItem], source: 'session', isLoading: false },
    })

    renderWithProviders(<ShoppingCart />, store)

    const removeButton = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeButton)

    expect(store.getState().cart.items).toHaveLength(0)
    expect(screen.getByText('Your cart is currently empty.')).toBeInTheDocument()
  })

  it('updates item quantity when the quantity input changes', () => {
    const store = createTestStore({
      cart: { items: [mockCartItem], source: 'session', isLoading: false },
    })

    renderWithProviders(<ShoppingCart />, store)

    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '5' } })

    expect(store.getState().cart.items[0].quantity).toBe(5)
  })
})
