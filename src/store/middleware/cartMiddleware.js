import { getCartFromFirestore, saveCartToFirestore, clearCartInFirestore } from '../../services/firebase/cart.service'
import { setCartFromFirestore, setCartSource, setCartLoading } from '../cartSlice'
import { login, register } from '../slices/authSlice'
import { logout } from '../slices/authSlice'

/**
 * Middleware to sync cart with Firestore when user logs in
 * Loads saved cart from Firestore or clears old sessionStorage cart
 */
export const cartSyncMiddleware = (store) => (next) => async (action) => {
  // First, execute the action
  const result = next(action)

  // After login or register, sync cart from Firestore
  if (action.type === login.fulfilled.type || action.type === register.fulfilled.type) {
    const state = store.getState()
    const userId = state.auth.user?.uid

    if (userId) {
      try {
        store.dispatch(setCartLoading(true))

        // Try to load cart from Firestore
        const firestoreCart = await getCartFromFirestore(userId)

        if (firestoreCart && firestoreCart.length > 0) {
          // Use cart from Firestore
          store.dispatch(setCartFromFirestore(firestoreCart))
          store.dispatch(setCartSource('firestore'))
        } else {
          // No cart in Firestore, switch to Firestore source for future saves
          store.dispatch(setCartSource('firestore'))
        }

        store.dispatch(setCartLoading(false))
      } catch (error) {
        console.error('Error syncing cart on login:', error)
        store.dispatch(setCartLoading(false))
      }
    }
  }

  // On logout, switch back to session storage and clear Firestore cart
  if (action.type === logout.fulfilled.type) {
    const state = store.getState()
    const userId = state.auth.user?.uid // Get userId before logout clears it

    if (userId) {
      try {
        // Clear cart from Firestore
        await clearCartInFirestore(userId)
      } catch (error) {
        console.error('Error clearing cart on logout:', error)
      }
    }

    // Switch back to session storage
    store.dispatch(setCartSource('session'))
  }

  return result
}

/**
 * Middleware to persist cart to Firestore when user is logged in
 * Watches for cart changes and syncs to Firestore
 */
export const cartPersistenceMiddleware = (store) => (next) => async (action) => {
  const result = next(action)

  // After cart modifications for logged-in users, save to Firestore
  const cartActions = ['cart/addToCart', 'cart/updateQuantity', 'cart/removeFromCart', 'cart/clearCart']

  if (cartActions.includes(action.type)) {
    const state = store.getState()
    const { user } = state.auth
    const { items, source } = state.cart

    // Only save to Firestore if user is logged in and source is Firestore
    if (user?.uid && source === 'firestore') {
      try {
        await saveCartToFirestore(user.uid, items)
      } catch (error) {
        console.error('Error persisting cart to Firestore:', error)
        // Continue even if Firestore save fails
      }
    }
  }

  return result
}
