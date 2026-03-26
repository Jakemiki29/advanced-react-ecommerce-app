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
