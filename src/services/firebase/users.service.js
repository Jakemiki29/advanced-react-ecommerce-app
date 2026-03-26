import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase.config'
import { deleteUser } from 'firebase/auth'

/**
 * Get user profile from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))

    if (!userDoc.exists()) {
      throw new Error('User profile not found')
    }

    return {
      uid: userId,
      ...userDoc.data(),
    }
  } catch (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }
}

/**
 * Update user profile in Firestore
 * @param {string} userId - User ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUserProfile(userId, updates) {
  try {
    const userRef = doc(db, 'users', userId)

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(userRef, updateData)

    // Return updated profile
    return await getUserProfile(userId)
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}

/**
 * Delete user account data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUserAccount(userId) {
  try {
    await deleteDoc(doc(db, 'users', userId))
  } catch (error) {
    throw new Error(`Failed to delete account: ${error.message}`)
  }
}

/**
 * Hard delete user from Firebase Authentication
 * Should only be called after Firestore user is soft-deleted
 * @param {Object} authUser - Firebase auth user object
 * @returns {Promise<void>}
 */
export async function deleteUserFromAuth(authUser) {
  try {
    if (authUser) {
      await deleteUser(authUser)
    }
  } catch (error) {
    throw new Error(`Failed to delete auth user: ${error.message}`)
  }
}
