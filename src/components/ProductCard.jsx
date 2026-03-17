import { useDispatch } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import ProductImage from './ProductImage'

function ProductCard({ product }) {
  const dispatch = useDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart(product))
  }

  return (
    <article className="product-card">
      <ProductImage
        src={product.image}
        alt={product.title}
        className="product-card__image"
      />
      <div className="product-card__body">
        <h3>{product.title}</h3>
        <p className="product-card__category">{product.category}</p>
        <p className="product-card__description">{product.description}</p>
        <p className="product-card__rating">Rate: {product.rating?.rate ?? 0}</p>
        <p className="product-card__price">${product.price.toFixed(2)}</p>
        <button type="button" onClick={handleAddToCart}>
          Add to cart
        </button>
      </div>
    </article>
  )
}

export default ProductCard
