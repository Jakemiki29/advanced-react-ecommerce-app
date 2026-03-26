import MainLayout from '../components/Layouts/MainLayout'
import ProductCatalog from '../components/ProductCatalog'
import ShoppingCart from '../components/ShoppingCart'

function HomePage() {
  return (
    <MainLayout>
      <div className="app-layout">
        <ProductCatalog />
        <ShoppingCart />
      </div>
    </MainLayout>
  )
}

export default HomePage

