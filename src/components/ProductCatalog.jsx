import { useQuery } from '@tanstack/react-query'
import { getAllProducts, getCategories, getProductsByCategory } from '../api/fakeStoreApi'
import ProductCard from './ProductCard'

function ProductCatalog({ selectedCategory, onCategoryChange }) {
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const {
    data: products = [],
    isLoading: isProductsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () =>
      selectedCategory === 'all'
        ? getAllProducts()
        : getProductsByCategory(selectedCategory),
  })

  return (
    <section className="catalog">
      <div className="catalog__header">
        <h2>Product Catalog</h2>
        <label htmlFor="category-select">Category</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          disabled={isCategoriesLoading || Boolean(categoriesError)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {categoriesError ? (
        <p className="status">Unable to load categories.</p>
      ) : null}

      {isProductsLoading ? <p className="status">Loading products...</p> : null}
      {productsError ? <p className="status">Unable to load products.</p> : null}

      <div className="catalog__grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default ProductCatalog
