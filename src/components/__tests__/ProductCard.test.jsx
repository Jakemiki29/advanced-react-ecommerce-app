import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../../store/cartSlice'
import ProductCard from '../ProductCard'

const mockProduct = {
  id: 1,
  title: 'Test Wireless Headphones',
  price: 49.99,
  description: 'High quality wireless headphones with noise cancellation.',
  category: 'electronics',
  image: 'https://example.com/headphones.jpg',
  rating: { rate: 4.5, count: 120 },
}

function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState,
  })
}

describe('ProductCard', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders all product information correctly', () => {
    const store = createTestStore()

    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>,
    )

    expect(screen.getByText('Test Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText('$49.99')).toBeInTheDocument()
    expect(screen.getByText('electronics')).toBeInTheDocument()
    expect(screen.getByText('High quality wireless headphones with noise cancellation.')).toBeInTheDocument()
    expect(screen.getByText('Rate: 4.5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Test Wireless Headphones' })).toBeInTheDocument()
  })

  it('dispatches addToCart and updates the store when "Add to cart" is clicked', () => {
    const store = createTestStore()

    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>,
    )

    const button = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(button)

    const { items } = store.getState().cart
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(1)
    expect(items[0].title).toBe('Test Wireless Headphones')
    expect(items[0].quantity).toBe(1)
  })

  it('increments quantity when the same product is added twice', () => {
    const store = createTestStore()

    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>,
    )

    const button = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(button)
    fireEvent.click(button)

    const { items } = store.getState().cart
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it('shows a fallback rating of 0 when the product has no rating', () => {
    const store = createTestStore()
    const productWithoutRating = { ...mockProduct, rating: undefined }

    render(
      <Provider store={store}>
        <ProductCard product={productWithoutRating} />
      </Provider>,
    )

    expect(screen.getByText('Rate: 0')).toBeInTheDocument()
  })
})
