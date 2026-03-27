import { collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase.config'

/**
 * Create a new order
 * @param {string} userId - User ID
 * @param {Array} items - Cart items to order
 * @param {Object} shippingAddress - Shipping address
 * @returns {Promise<Object>} Created order
 */
export async function createOrder(userId, items, shippingAddress) {
  try {
    if (!items || items.length === 0) {
      throw new Error('Cannot create order with empty cart')
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Create order document
    const ordersRef = collection(db, 'orders')
    const estimatedDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    const docRef = await addDoc(ordersRef, {
      userId,
      items,
      totalAmount,
      status: 'pending',
      shippingAddress,
      paymentMethod: 'card', // Default - can be modified later
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      estimatedDelivery: estimatedDeliveryDate,
      notes: '',
    })

    return {
      orderId: docRef.id,
      userId,
      items,
      totalAmount,
      status: 'pending',
      shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: estimatedDeliveryDate.toISOString(),
    }
  } catch (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }
}

/**
 * Get all orders for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of orders
 */
export async function getUserOrders(userId) {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const orders = []

    querySnapshot.forEach((doc) => {
      orders.push({
        orderId: doc.id,
        ...doc.data(),
      })
    })

    return orders
  } catch (error) {
    // Composite index error: orders require an index on (userId ASC, createdAt DESC).
    // Create it in Firebase Console > Firestore > Indexes, or follow the link in
    // the browser console when this query first fails.
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      throw new Error(
        'Unable to fetch orders: a required Firestore composite index is missing. ' +
          'Open the Firebase Console > Firestore > Indexes and create an index on ' +
          'the \'orders\' collection for fields: userId (Ascending), createdAt (Descending).',
      )
    }
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }
}

/**
 * Get a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order object
 */
export async function getOrderById(orderId) {
  try {
    const docSnap = await getDoc(doc(db, 'orders', orderId))

    if (!docSnap.exists()) {
      throw new Error('Order not found')
    }

    return {
      orderId: docSnap.id,
      ...docSnap.data(),
    }
  } catch (error) {
    throw new Error(`Failed to fetch order: ${error.message}`)
  }
}

/**
 * Update order status (admin only)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated order
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`)
    }

    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    return await getOrderById(orderId)
  } catch (error) {
    throw new Error(`Failed to update order status: ${error.message}`)
  }
}

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Updated order
 */
export async function cancelOrder(orderId) {
  try {
    const order = await getOrderById(orderId)

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`)
    }

    return await updateOrderStatus(orderId, 'cancelled')
  } catch (error) {
    throw new Error(`Failed to cancel order: ${error.message}`)
  }
}

/**
 * Get orders with filters
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options (status, dateRange, etc.)
 * @returns {Promise<Array>} Filtered orders
 */
export async function getFilteredOrders(userId, filters = {}) {
  try {
    let q = query(collection(db, 'orders'), where('userId', '==', userId))

    // Apply filters if provided
    // Note: Firestore has limitations on complex queries
    // For MVP, we fetch all and filter in memory
    if (filters.status) {
      q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc'),
      )
    } else {
      q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    }

    const querySnapshot = await getDocs(q)
    const orders = []

    querySnapshot.forEach((doc) => {
      orders.push({
        orderId: doc.id,
        ...doc.data(),
      })
    })

    return orders
  } catch (error) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      throw new Error(
        'Unable to fetch filtered orders: a required Firestore composite index is missing. ' +
          'Open the Firebase Console > Firestore > Indexes and create an index on ' +
          'the \'orders\' collection for fields: userId (Ascending), status (Ascending), ' +
          'createdAt (Descending).',
      )
    }
    throw new Error(`Failed to fetch filtered orders: ${error.message}`)
  }
}
