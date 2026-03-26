import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getCategories,
  getAllProducts,
  getProductsByCategory,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from '../../services/firebase/products.service'

// Async thunk to fetch categories
export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const categories = await getCategories()
    return categories
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk to fetch all products
export const fetchAllProducts = createAsyncThunk('products/fetchAllProducts', async (_, { rejectWithValue }) => {
  try {
    const products = await getAllProducts()
    return products
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk to fetch products by category
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const products = await getProductsByCategory(category)
      return { category, products }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const createProductItem = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const product = await createProductService(productData)
      return product
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateProductItem = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, updates }, { rejectWithValue }) => {
    try {
      const product = await updateProductService(productId, updates)
      return product
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteProductItem = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await deleteProductService(productId)
      return productId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

function matchesSelectedCategory(product, selectedCategory) {
  return selectedCategory === 'all' || product.category === selectedCategory
}

const initialState = {
  items: [],
  categories: [],
  selectedCategory: 'all',
  isLoading: false,
  categoriesLoading: false,
  error: null,
  lastUpdated: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false
        state.error = action.payload
      })

    // Fetch All Products
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.lastUpdated = new Date().toISOString()
        state.selectedCategory = 'all'
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Fetch Products by Category
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.products
        state.lastUpdated = new Date().toISOString()
        state.selectedCategory = action.payload.category
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Create Product
    builder
      .addCase(createProductItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProductItem.fulfilled, (state, action) => {
        state.isLoading = false
        if (matchesSelectedCategory(action.payload, state.selectedCategory)) {
          state.items.unshift(action.payload)
        }
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(createProductItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Update Product
    builder
      .addCase(updateProductItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProductItem.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)

        if (index !== -1) {
          if (matchesSelectedCategory(action.payload, state.selectedCategory)) {
            state.items[index] = action.payload
          } else {
            state.items.splice(index, 1)
          }
        } else if (matchesSelectedCategory(action.payload, state.selectedCategory)) {
          state.items.unshift(action.payload)
        }

        state.lastUpdated = new Date().toISOString()
      })
      .addCase(updateProductItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Delete Product
    builder
      .addCase(deleteProductItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProductItem.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(deleteProductItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { setSelectedCategory, clearError } = productsSlice.actions
export default productsSlice.reducer
