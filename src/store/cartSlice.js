import { createSlice } from '@reduxjs/toolkit'

const SESSION_STORAGE_KEY = 'shopping-cart'

function loadCartFromSessionStorage() {
  const storedCart = sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (!storedCart) {
    return []
  }

  try {
    const parsedCart = JSON.parse(storedCart)
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

function saveCartToSessionStorage(cartItems) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cartItems))
}

const initialState = {
  items: loadCartFromSessionStorage(),
  source: 'session', // 'session' or 'firestore'
  isLoading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload
      const existingItem = state.items.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          ...product,
          quantity: 1,
        })
      }

      // Save to appropriate source
      if (state.source === 'session') {
        saveCartToSessionStorage(state.items)
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((cartItem) => cartItem.id === id)

      if (!item) {
        return
      }

      if (quantity <= 0) {
        state.items = state.items.filter((cartItem) => cartItem.id !== id)
      } else {
        item.quantity = quantity
      }

      // Save to appropriate source
      if (state.source === 'session') {
        saveCartToSessionStorage(state.items)
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((item) => item.id !== id)

      // Save to appropriate source
      if (state.source === 'session') {
        saveCartToSessionStorage(state.items)
      }
    },
    clearCart: (state) => {
      state.items = []

      // Save to appropriate source
      if (state.source === 'session') {
        saveCartToSessionStorage(state.items)
      }
    },
    setCartFromFirestore: (state, action) => {
      state.items = action.payload
      state.source = 'firestore'
    },
    setCartSource: (state, action) => {
      state.source = action.payload
    },
    setCartLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCartFromFirestore,
  setCartSource,
  setCartLoading,
} = cartSlice.actions

export default cartSlice.reducer

