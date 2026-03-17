# FakeStore Shopfront

An advanced React e-commerce application built as part of the Coding Temple curriculum. It fetches products from the [FakeStore API](https://fakestoreapi.com) and provides a fully interactive shopping experience with a persistent cart.

## Features

- **Product Catalog** — Browse all products or filter by category using a dropdown.
- **Shopping Cart** — Add items, adjust quantities, remove individual items, or clear the entire cart.
- **Session Persistence** — The cart is saved to `sessionStorage` so it survives page refreshes within the same browser tab.
- **Checkout Flow** — A simulated checkout clears the cart and displays a confirmation message.

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI library |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Redux Toolkit](https://redux-toolkit.js.org) | Global cart state management |
| [TanStack React Query](https://tanstack.com/query) | Server-state fetching & caching |
| [FakeStore API](https://fakestoreapi.com) | Product & category data |

## Project Structure

```
src/
├── api/
│   └── fakeStoreApi.js       # Fetch helpers for products and categories
├── components/
│   ├── ProductCard.jsx        # Individual product tile with Add to Cart
│   ├── ProductCatalog.jsx     # Grid of products with category filter
│   ├── ProductImage.jsx       # Lazy-loaded product image
│   └── ShoppingCart.jsx       # Cart sidebar with quantity controls
└── store/
    ├── cartSlice.js           # Redux slice (add, update, remove, clear)
    └── store.js               # Redux store configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Other Scripts

| Command | Description |
|---|---|
| `npm run build` | Production build output to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
