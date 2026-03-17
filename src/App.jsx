import { useState } from 'react'
import ProductCatalog from './components/ProductCatalog'
import ShoppingCart from './components/ShoppingCart'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-header__eyebrow">Advanced React Ecommerce</p>
        <h1>FakeStore Shopfront</h1>
      </header>

      <main className="app-layout">
        <ProductCatalog
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <ShoppingCart />
      </main>
    </div>
  )
}

export default App
