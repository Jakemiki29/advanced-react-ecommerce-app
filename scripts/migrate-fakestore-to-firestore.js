/**
 * Migration Script: Fetch products from FakeStore API and populate Firestore
 * Run this script once to seed the products collection in Firestore
 *
 * Usage:
 * 1. Make sure .env.local is configured with Firebase credentials
 * 2. Run: node scripts/migrate-fakestore-to-firestore.js
 */

import dotenv from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, writeBatch, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const FAKESTORE_API = 'https://fakestoreapi.com'

/**
 * Fetch all categories from FakeStore API
 */
async function fetchFakeStoreCategories() {
  console.log('Fetching categories from FakeStore API...')

  try {
    const response = await fetch(`${FAKESTORE_API}/products/categories`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch categories:', error.message)
    return []
  }
}

/**
 * Fetch all products from FakeStore API
 */
async function fetchFakeStoreProducts() {
  console.log('Fetching products from FakeStore API...')

  try {
    const response = await fetch(`${FAKESTORE_API}/products`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch products:', error.message)
    return []
  }
}

/**
 * Create categories in Firestore
 */
async function createCategories(categories) {
  console.log(`Creating ${categories.length} categories in Firestore...`)

  const batch = writeBatch(db)
  let count = 0

  for (const category of categories) {
    const categoryRef = doc(db, 'categories', category.replace(/\s+/g, '-').toLowerCase())
    batch.set(categoryRef, {
      name: category,
      description: '',
      displayOrder: count++,
      createdAt: serverTimestamp(),
    })
  }

  await batch.commit()
  console.log(`✓ Created ${categories.length} categories`)
}

/**
 * Create products in Firestore
 */
async function createProducts(products) {
  console.log(`Creating ${products.length} products in Firestore...`)

  // Process in batches of 500 (Firestore batch limit)
  const batchSize = 500
  let createdCount = 0

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = writeBatch(db)
    const batchProducts = products.slice(i, i + batchSize)

    for (const product of batchProducts) {
      const docRef = doc(collection(db, 'products'))
      batch.set(docRef, {
        title: product.title || '',
        description: product.description || '',
        price: product.price || 0,
        image: product.image || '',
        category: product.category || '',
        rating: {
          rate: product.rating?.rate || 0,
          count: product.rating?.count || 0,
        },
        inventory: 100, // Default inventory
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      createdCount++
    }

    await batch.commit()
    console.log(`  Created ${Math.min(createdCount, products.length)}/${products.length} products`)
  }

  console.log(`✓ Created ${createdCount} products`)
}

/**
 * Check if data already exists in Firestore
 */
async function checkExistingData() {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'))
    return productsSnapshot.size > 0
  } catch (error) {
    return false
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('Starting FakeStore → Firestore migration...\n')

  try {
    // Check if data already exists
    const dataExists = await checkExistingData()
    if (dataExists) {
      console.log('⚠ Products already exist in Firestore.')
      console.log('Skipping migration to avoid duplicates.')
      console.log('If you want to re-migrate, delete the products collection in Firebase Console first.')
      process.exit(0)
    }

    // Fetch FakeStore data
    const categories = await fetchFakeStoreCategories()
    const products = await fetchFakeStoreProducts()

    if (!categories.length || !products.length) {
      console.error('✗ Failed to fetch data from FakeStore API')
      process.exit(1)
    }

    // Create Firestore collections
    await createCategories(categories)
    await createProducts(products)

    console.log('\n✓ Migration completed successfully!')
    console.log(`  - ${categories.length} categories`)
    console.log(`  - ${products.length} products`)
    console.log('\nYou can now use your app with Firestore products!')

    process.exit(0)
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration
migrate()
