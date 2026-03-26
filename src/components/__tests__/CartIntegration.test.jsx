/**
 * Integration Test: Cart ↔ Product interaction
 *
 * Verifies that clicking "Add to cart" on a ProductCard correctly updates
 * the shared Redux store, and that ShoppingCart reflects those changes.
 * Both components share a single store instance — no Firebase middleware
 * is included so tests remain fast and deterministic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import cartReducer from '../../store/cartSlice'
import ProductCard from '../ProductCard'
import ShoppingCart from '../ShoppingCart'

// Prevent Firebase initialisation inside these hooks
vi.mock('../../store/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: null, isAuthenticated: false })),
}))

vi.mock('../../store/hooks/useOrders', () => ({
  useOrders: vi.fn(() => ({
    createOrder: vi.fn(),
    error: null,
  })),
}))

const mockProduct = {
  id: 101,
  title: 'Mechanical Keyboard',
  price: 89.99,
  description: 'Tactile mechanical switches, RGB backlit.',
  category: 'electronics',
  image: 'https://example.com/keyboard.jpg',
  rating: { rate: 4.8, count: 340 },
}

const anotherProduct = {
  id: 202,
  title: 'Ergonomic Mouse',
  price: 34.99,
  description: 'Vertical ergonomic design to reduce wrist strain.',
  category: 'electronics',
  image: 'https://example.com/mouse.jpg',
  rating: { rate: 4.3, count: 210 },
}

function createTestStore() {
  return configureStore({
    // No Firebase middleware — cart reducer handles state synchronously
    reducer: { cart: cartReducer },
  })
}

function renderApp(store, products = [mockProduct]) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <main>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </main>
        <ShoppingCart />
      </MemoryRouter>
    </Provider>,
  )
}

describe('Cart Integration', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('shows empty cart before any product is added', () => {
    const store = createTestStore()
    renderApp(store)

    expect(screen.getByText('Your cart is currently empty.')).toBeInTheDocument()
  })

  it('adds a product to the cart and ShoppingCart reflects the new item', () => {
    const store = createTestStore()
    renderApp(store)

    // Click the product's "Add to cart" button
    const addButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addButton)

    // Scope assertions to the ShoppingCart <aside> (role="complementary")
    const cartAside = screen.getByRole('complementary')
    expect(within(cartAside).getByText('Mechanical Keyboard')).toBeInTheDocument()
    expect(within(cartAside).getByText('$89.99')).toBeInTheDocument()
    expect(screen.queryByText('Your cart is currently empty.')).not.toBeInTheDocument()
  })

  it('shows the correct quantity and total price after adding a product once', () => {
    const store = createTestStore()
    renderApp(store)

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(screen.getByText('Total products: 1')).toBeInTheDocument()
    expect(screen.getByText('Total price: $89.99')).toBeInTheDocument()
  })

  it('increments quantity in the cart when the same product is added multiple times', () => {
    const store = createTestStore()
    renderApp(store)

    const addButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addButton)
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    // Three clicks → quantity should be 3
    const quantityInput = screen.getByRole('spinbutton')
    expect(quantityInput).toHaveValue(3)
    expect(screen.getByText('Total products: 3')).toBeInTheDocument()
    expect(screen.getByText('Total price: $269.97')).toBeInTheDocument()
  })

  it('adds two different products and both appear in the ShoppingCart', () => {
    const store = createTestStore()
    renderApp(store, [mockProduct, anotherProduct])

    // Add both products
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    fireEvent.click(addButtons[0]) // Mechanical Keyboard
    fireEvent.click(addButtons[1]) // Ergonomic Mouse

    // Assert via store state (most direct: 2 distinct items)
    expect(store.getState().cart.items).toHaveLength(2)

    const cartAside = screen.getByRole('complementary')
    expect(within(cartAside).getByText('Mechanical Keyboard')).toBeInTheDocument()
    expect(within(cartAside).getByText('Ergonomic Mouse')).toBeInTheDocument()
    expect(screen.getByText('Total products: 2')).toBeInTheDocument()
  })

  it('removes an item from the cart via the ShoppingCart Remove button', () => {
    const store = createTestStore()
    renderApp(store)

    // Add the product first
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    const cartAside = screen.getByRole('complementary')
    expect(within(cartAside).getByText('Mechanical Keyboard')).toBeInTheDocument()

    // Remove via ShoppingCart
    fireEvent.click(within(cartAside).getByRole('button', { name: /remove/i }))

    expect(screen.getByText('Your cart is currently empty.')).toBeInTheDocument()
    expect(store.getState().cart.items).toHaveLength(0)
  })
})
