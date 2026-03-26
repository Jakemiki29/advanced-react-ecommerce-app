import { collection, getDocs, query, where, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../config/firebase.config'

/**
 * Get all categories from Firestore
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'))
    const categories = []

    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        name: doc.data().name,
      })
    })

    // Sort by displayOrder if available
    categories.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999))

    return categories
  } catch (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }
}

/**
 * Get all products from Firestore
 * @returns {Promise<Array>} Array of product objects
 */
export async function getAllProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'))
    const products = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.isActive !== false) {
        // Exclude inactive products
        products.push({
          id: doc.id,
          ...data,
        })
      }
    })

    return products
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }
}

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of product objects
 */
export async function getProductsByCategory(category) {
  try {
    const q = query(collection(db, 'products'), where('category', '==', category), where('isActive', '!=', false))

    const querySnapshot = await getDocs(q)
    const products = []

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return products
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }
}

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product object
 */
export async function getProductById(productId) {
  try {
    const docSnap = await getDoc(doc(db, 'products', productId))

    if (!docSnap.exists()) {
      throw new Error('Product not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    }
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`)
  }
}

/**
 * Create a new product (admin only)
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product with ID
 */
export async function createProduct(productData) {
  try {
    const { id, ...dataWithoutId } = productData

    const docRef = await addDoc(collection(db, 'products'), {
      ...dataWithoutId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    })

    return {
      id: docRef.id,
      ...dataWithoutId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`)
  }
}

/**
 * Update an existing product (admin only)
 * @param {string} productId - Product ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(productId, updates) {
  try {
    const productRef = doc(db, 'products', productId)

    await updateDoc(productRef, {
      ...updates,
      updatedAt: new Date(),
    })

    return await getProductById(productId)
  } catch (error) {
    throw new Error(`Failed to update product: ${error.message}`)
  }
}

/**
 * Delete a product (admin only - soft delete)
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, 'products', productId)

    await updateDoc(productRef, {
      isActive: false,
      deletedAt: new Date(),
    })
  } catch (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }
}

/**
 * Hard delete a product (removes from database)
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function hardDeleteProduct(productId) {
  try {
    await deleteDoc(doc(db, 'products', productId))
  } catch (error) {
    throw new Error(`Failed to hard delete product: ${error.message}`)
  }
}
