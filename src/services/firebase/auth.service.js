import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../config/firebase.config'

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars)
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} User object with uid and email
 */
export async function registerUser(email, password, displayName) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await updateProfile(user, { displayName })

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName,
      phone: '',
      profilePicture: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      role: 'user', // Default role is user
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'user',
    }
  } catch (error) {
    throw new Error(_getErrorMessage(error.code))
  }
}

/**
 * Log in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with uid, email, displayName, and role
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userData = userDoc.data() || {}

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || userData.displayName || '',
      role: userData.role || 'user',
    }
  } catch (error) {
    throw new Error(_getErrorMessage(error.code))
  }
}

/**
 * Log out the current user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(_getErrorMessage(error.code))
  }
}

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} Current user object or null if not authenticated
 */
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe()

        if (user) {
          // Fetch user profile from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            const userData = userDoc.data() || {}

            resolve({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || userData.displayName || '',
              role: userData.role || 'user',
            })
          } catch (error) {
            reject(error)
          }
        } else {
          resolve(null)
        }
      },
      reject,
    )
  })
}

/**
 * Re-authenticate the current user with their email and password.
 * Must be called before sensitive operations such as account deletion
 * when the user's session may have expired.
 * @param {string} password - User's current password
 * @returns {Promise<void>}
 */
export async function reauthenticateUser(password) {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error('No authenticated user found.')
    }
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)
  } catch (error) {
    const friendlyMessage = _getErrorMessage(error.code)
    throw new Error(friendlyMessage !== 'An error occurred. Please try again.' ? friendlyMessage : error.message)
  }
}

/**
 * Send password reset email to user
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw new Error(_getErrorMessage(error.code))
  }
}

/**
 * Map Firebase error codes to user-friendly messages
 * @param {string} code - Firebase error code
 * @returns {string} User-friendly error message
 */
function _getErrorMessage(code) {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please log in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/user-not-found': 'No account found with this email. Please register first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
  }

  return errorMessages[code] || 'An error occurred. Please try again.'
}
