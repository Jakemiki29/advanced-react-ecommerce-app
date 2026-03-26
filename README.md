# Advanced React E-Commerce Application

A full-stack React e-commerce application built with Firebase and Firestore. Features user authentication, product management, shopping cart, and order tracking with a modern, responsive UI.

## Features

- **User Authentication** — Firebase Authentication with email/password registration and login.
- **User Profiles** — Create and manage user profiles with address information stored in Firestore.
- **Product Management** — Create, read, update, and delete products directly in the app (stored in Firestore).
- **Product Catalog** — Browse all products or filter by category.
- **Shopping Cart** — Add items, adjust quantities, remove individual items, or clear the entire cart.
- **Order Management** — Place orders with shipping addresses, view order history, and track order status.
- **Account Deletion** — Users can securely delete their accounts and all associated data.
- **Persistent State** — Cart state managed with Redux and persisted across sessions.

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI library |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Redux Toolkit](https://redux-toolkit.js.org) | Global state management (cart, auth, products, orders) |
| [Firebase](https://firebase.google.com) | Authentication & backend |
| [Cloud Firestore](https://firebase.google.com/products/firestore) | Database for products, users, orders |
| [Vitest](https://vitest.dev) | Test runner (Vite-native) |
| [React Testing Library](https://testing-library.com/react) | Component rendering & user interaction testing |

## Project Structure

```
src/
├── api/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AuthGuard.jsx
│   ├── Orders/
│   │   ├── OrderHistory.jsx
│   │   └── OrderDetail.jsx
│   ├── User/
│   │   └── UserProfile.jsx
│   ├── ProductCard.jsx
│   ├── ProductCatalog.jsx
│   ├── ShoppingCart.jsx
│   └── Layouts/
│       └── MainLayout.jsx
├── config/
│   └── firebase.config.js     # Firebase initialization
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   └── OrdersPage.jsx
├── services/
│   └── firebase/
│       ├── auth.service.js
│       ├── products.service.js
│       ├── orders.service.js
│       ├── users.service.js
│       └── cart.service.js
└── store/
    ├── slices/
    │   ├── authSlice.js
    │   ├── cartSlice.js
    │   ├── productsSlice.js
    │   ├── ordersSlice.js
    │   └── userSlice.js
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useCart.js
    │   ├── useProducts.js
    │   ├── useOrders.js
    │   └── useUser.js
    └── store.js
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
| `npm test` | Run tests in interactive watch mode |
| `npm run test:run` | Run all tests once (CI mode) |

## Testing

The project uses **Vitest** as the test runner and **React Testing Library** for component and interaction testing. All tests run in a `jsdom` environment — no browser or Firebase connection required.

### Running Tests

```bash
# Watch mode (re-runs on file changes)
npm test

# Single run — suitable for CI pipelines
npm run test:run
```

### Test Files

```
src/components/__tests__/
├── ProductCard.test.jsx      # Unit tests — ProductCard component
├── ShoppingCart.test.jsx     # Unit tests — ShoppingCart component
└── CartIntegration.test.jsx  # Integration tests — add-to-cart flow
```

### Unit Tests

#### `ProductCard.test.jsx` (4 tests)

Tests the `ProductCard` component in isolation against a lightweight Redux store (cart reducer only, no Firebase middleware).

| Test | What it verifies |
|---|---|
| Renders all product information correctly | Title, price, category, description, rating, image, and "Add to cart" button are all present in the DOM |
| Dispatches `addToCart` on button click | Clicking "Add to cart" updates the Redux store with the correct product and `quantity: 1` |
| Increments quantity on repeated clicks | Clicking the button twice results in `quantity: 2` — no duplicate entries |
| Falls back to rating 0 when absent | Products without a `rating` field display `Rate: 0` rather than crashing |

#### `ShoppingCart.test.jsx` (5 tests)

Tests the `ShoppingCart` component in isolation. `useAuth` and `useOrders` are mocked to eliminate Firebase dependencies.

| Test | What it verifies |
|---|---|
| Shows empty message with no items | Renders "Your cart is currently empty." and no list element |
| Renders item details from store | Pre-populated cart item shows title, price, and an input reflecting the current quantity |
| Displays correct totals | `Total products` and `Total price` match the preloaded cart state |
| Remove button clears the item | Clicking Remove dispatches `removeFromCart` and reverts to the empty state |
| Quantity input updates the store | Changing the quantity input dispatches `updateQuantity` with the new value |

### Integration Test

#### `CartIntegration.test.jsx` (6 tests)

Renders `ProductCard` and `ShoppingCart` together sharing a **single live Redux store** — no mocks on the store itself. Simulates full end-to-end user interactions.

| Test | What it verifies |
|---|---|
| Empty cart on initial load | Cart shows empty message before any interaction |
| Add product → cart updates | Clicking "Add to cart" causes the item to appear immediately in `ShoppingCart` |
| Total price after one add | Summary shows the correct unit price |
| Multiple clicks accumulate quantity | Clicking "Add to cart" three times results in `quantity: 3` and the correct total |
| Two different products both appear | Each product gets its own cart entry; total count is 2 |
| Remove via cart clears the item | Clicking Remove in the cart removes the entry and restores the empty message |
