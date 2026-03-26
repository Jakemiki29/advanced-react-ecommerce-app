import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase.config'

const CART_EXPIRY_DAYS = 30

/**
 * Save cart to Firestore for logged-in user
 * @param {string} userId - User ID
 * @param {Array} cartItems - Cart items array
 * @returns {Promise<void>}
 */
export async function saveCartToFirestore(userId, cartItems) {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS)

    await setDoc(doc(db, 'carts', userId), {
      items: cartItems,
      lastUpdated: serverTimestamp(),
      expiresAt,
    })
  } catch (error) {
    console.error('Failed to save cart to Firestore:', error.message)
    // Don't throw - let app continue even if Firestore fails
  }
}

/**
 * Get cart from Firestore for logged-in user
 * @param {string} userId - User ID
 * @returns {Promise<Array|null>} Cart items or null if not found/expired
 */
export async function getCartFromFirestore(userId) {
  try {
    const cartDoc = await getDoc(doc(db, 'carts', userId))

    if (!cartDoc.exists()) {
      return null
    }

    const cartData = cartDoc.data()

    // Check if cart has expired
    if (cartData.expiresAt && new Date() > new Date(cartData.expiresAt)) {
      // Delete expired cart
      await deleteCartFromFirestore(userId)
      return null
    }

    return cartData.items || []
  } catch (error) {
    console.error('Failed to get cart from Firestore:', error.message)
    return null
  }
}

/**
 * Delete cart from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteCartFromFirestore(userId) {
  try {
    await deleteDoc(doc(db, 'carts', userId))
  } catch (error) {
    console.error('Failed to delete cart from Firestore:', error.message)
  }
}

/**
 * Clear cart in Firestore (set items to empty array)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearCartInFirestore(userId) {
  try {
    await saveCartToFirestore(userId, [])
  } catch (error) {
    console.error('Failed to clear cart in Firestore:', error.message)
  }
}
