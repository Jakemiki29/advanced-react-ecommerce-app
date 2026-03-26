import { useSelector, useDispatch } from 'react-redux'
import {
  fetchCategories,
  fetchAllProducts,
  fetchProductsByCategory,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  setSelectedCategory,
  clearError,
} from '../slices/productsSlice'

/**
 * Custom hook to access products state and actions
 * @returns {Object} Products state and dispatch functions
 */
export function useProducts() {
  const dispatch = useDispatch()
  const { items, categories, selectedCategory, isLoading, categoriesLoading, error, lastUpdated } = useSelector(
    (state) => state.products,
  )

  return {
    items,
    categories,
    selectedCategory,
    isLoading,
    categoriesLoading,
    error,
    lastUpdated,
    fetchCategories: () => dispatch(fetchCategories()),
    fetchAllProducts: () => dispatch(fetchAllProducts()),
    fetchProductsByCategory: (category) => dispatch(fetchProductsByCategory(category)),
    createProduct: (productData) => dispatch(createProductItem(productData)),
    updateProduct: (productId, updates) => dispatch(updateProductItem({ productId, updates })),
    deleteProduct: (productId) => dispatch(deleteProductItem(productId)),
    setSelectedCategory: (category) => dispatch(setSelectedCategory(category)),
    clearError: () => dispatch(clearError()),
  }
}
