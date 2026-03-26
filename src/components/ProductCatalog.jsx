import { useEffect, useState } from 'react'
import { useProducts } from '../store/hooks/useProducts'
import ProductCard from './ProductCard'

const emptyProductForm = {
  title: '',
  price: '',
  category: '',
  image: '',
  description: '',
}

function ProductCatalog() {
  const {
    items,
    categories,
    selectedCategory,
    isLoading,
    categoriesLoading,
    error,
    fetchCategories,
    fetchAllProducts,
    fetchProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    setSelectedCategory,
  } = useProducts()

  const [formData, setFormData] = useState(emptyProductForm)
  const [editingProductId, setEditingProductId] = useState(null)

  // Fetch categories and all products on mount
  useEffect(() => {
    fetchCategories()
    fetchAllProducts()
  }, [])

  const resetForm = () => {
    setFormData(emptyProductForm)
    setEditingProductId(null)
  }

  const handleCategoryChange = (event) => {
    const category = event.target.value
    setSelectedCategory(category)

    if (category === 'all') {
      fetchAllProducts()
    } else {
      fetchProductsByCategory(category)
    }
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product.id)
    setFormData({
      title: product.title || '',
      price: String(product.price ?? ''),
      category: product.category || '',
      image: product.image || '',
      description: product.description || '',
    })
  }

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Delete this product from the catalog?')
    if (!confirmed) {
      return
    }

    const result = await deleteProduct(productId)
    if (!result.payload?.error && editingProductId === productId) {
      resetForm()
    }
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()

    const trimmedTitle = formData.title.trim()
    const trimmedCategory = formData.category.trim()
    const trimmedImage = formData.image.trim()
    const trimmedDescription = formData.description.trim()
    const parsedPrice = Number(formData.price)

    if (!trimmedTitle || !trimmedCategory || !trimmedImage || !trimmedDescription || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return
    }

    const payload = {
      title: trimmedTitle,
      price: parsedPrice,
      category: trimmedCategory,
      image: trimmedImage,
      description: trimmedDescription,
    }

    if (editingProductId) {
      await updateProduct(editingProductId, payload)
    } else {
      await createProduct(payload)
    }

    resetForm()
  }

  // Format category names for display
  const categoryNames = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    displayName: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
  }))

  return (
    <section className="catalog">
      <div className="catalog__header">
        <h2>Product Catalog</h2>
        <label htmlFor="category-select">Category</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={categoriesLoading}
        >
          <option value="all">All Categories</option>
          {categoryNames.map((category) => (
            <option key={category.id} value={category.name}>
              {category.displayName}
            </option>
          ))}
        </select>
      </div>

      <form className="product-manager" onSubmit={handleProductSubmit}>
        <h3>{editingProductId ? 'Edit Product' : 'Add Product'}</h3>
        <div className="product-manager__grid">
          <input
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            placeholder="Product title"
            disabled={isLoading}
            required
          />
          <input
            name="price"
            value={formData.price}
            onChange={handleFormChange}
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
            disabled={isLoading}
            required
          />
          <input
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            placeholder="Category"
            list="category-options"
            disabled={isLoading}
            required
          />
          <datalist id="category-options">
            {categoryNames.map((category) => (
              <option key={category.id} value={category.name} />
            ))}
          </datalist>
          <input
            name="image"
            value={formData.image}
            onChange={handleFormChange}
            placeholder="Image URL"
            disabled={isLoading}
            required
          />
          <input
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Description"
            disabled={isLoading}
            required
          />
        </div>

        <div className="product-manager__actions">
          <button type="submit" disabled={isLoading}>
            {editingProductId ? 'Update Product' : 'Create Product'}
          </button>
          {editingProductId ? (
            <button type="button" className="catalog-secondary-btn" onClick={resetForm} disabled={isLoading}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      {error ? <p className="status">Unable to load products. {error}</p> : null}

      {isLoading ? <p className="status">Loading products...</p> : null}

      {!isLoading && items.length === 0 ? <p className="status">No products found.</p> : null}

      <div className="catalog__grid">
        {items.map((product) => (
          <div key={product.id} className="catalog__item">
            <ProductCard product={product} />
            <div className="catalog__item-actions">
              <button type="button" className="catalog-secondary-btn" onClick={() => handleEditProduct(product)} disabled={isLoading}>
                Edit
              </button>
              <button type="button" className="catalog-danger-btn" onClick={() => handleDeleteProduct(product.id)} disabled={isLoading}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProductCatalog

