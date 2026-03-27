# Advanced React E-Commerce Application

A full-stack React e-commerce application built with Firebase and Firestore. Features user authentication, product management, shopping cart, and order tracking with a modern, responsive UI.

**Live app:** https://advanced-react-ecommerce-app.vercel.app

## Firestore Security Rules

The file [`firestore.rules`](firestore.rules) at the project root contains the recommended Firestore Security Rules. Deploy them with:

```bash
firebase deploy --only firestore:rules
```

Or paste the contents directly into **Firebase Console → Firestore Database → Rules**.

### What the rules enforce

| Collection | Who can read | Who can write |
|---|---|---|
| `users/{userId}` | Owner only | Owner only (create requires matching UID) |
| `carts/{userId}` | Owner only | Owner only |
| `orders/{orderId}` | Owner only (matched by `userId` field) | Owner only; deletion is disallowed |
| `products` | Everyone (public catalog) | Admin role only |
| `categories` | Everyone | Admin role only |

---

## Required Firestore Composite Indexes

Firestore requires composite indexes for queries that combine equality and inequality filters, or that combine `where` with `orderBy` on different fields. The following indexes must be created in **Firebase Console → Firestore → Indexes** before the queries below will work in production.

| Collection | Fields | Used by |
|---|---|---|
| `orders` | `userId` ASC, `createdAt` DESC | `getUserOrders()` |
| `orders` | `userId` ASC, `status` ASC, `createdAt` DESC | `getFilteredOrders()` with status filter |
| `products` | `category` ASC, `isActive` ASC | `getProductsByCategory()` |

> When a query fails with `failed-precondition`, Firebase logs a direct link to create the missing index — click it to provision immediately.

---

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
| [React Router v7](https://reactrouter.com) | Client-side routing |
| [Redux Toolkit](https://redux-toolkit.js.org) | Global state management (cart, auth, products, orders) |
| [TanStack Query v5](https://tanstack.com/query) | Server state & data fetching |
| [Firebase](https://firebase.google.com) | Authentication & backend |
| [Cloud Firestore](https://firebase.google.com/products/firestore) | Database for products, users, orders |
| [Vitest](https://vitest.dev) | Test runner (Vite-native) |
| [React Testing Library](https://testing-library.com/react) | Component rendering & user interaction testing |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline (test → build → deploy) |
| [Vercel](https://vercel.com) | Hosting & production deployment |

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

### Test Files

```
src/components/__tests__/
├── ProductCard.test.jsx      # Unit tests — ProductCard component
├── ShoppingCart.test.jsx     # Unit tests — ShoppingCart component
└── CartIntegration.test.jsx  # Integration tests — add-to-cart flow
```

### Unit Tests

- **`ProductCard.test.jsx`** (4 tests) — renders the card in isolation against a lightweight Redux store; verifies rendering, `addToCart` dispatch, quantity accumulation, and missing-rating fallback.
- **`ShoppingCart.test.jsx`** (5 tests) — renders the cart in isolation with `useAuth` and `useOrders` mocked; covers empty state, item rendering, totals, remove, and quantity update.

### Integration Test

- **`CartIntegration.test.jsx`** (6 tests) — renders `ProductCard` and `ShoppingCart` against a single live Redux store with no mocks; simulates add, quantity accumulation, multiple products, and remove flows end-to-end.

---

## Environment Variables

The app reads Firebase credentials from a `.env.local` file at the project root (never committed to source control). Create it before running the dev server:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For production, add these same variables in **Vercel → Project → Settings → Environment Variables** (never commit them to source control or `vercel.json`).

---

## Data Migration Script

A one-time seeding script (`scripts/migrate-fakestore-to-firestore.js`) fetches products from the [FakeStore API](https://fakestoreapi.com) and writes them to Firestore. Run it after setting up your Firebase project:

```bash
node scripts/migrate-fakestore-to-firestore.js
```

The script requires `.env.local` to be present with valid Firebase credentials. It:
- Creates `categories` documents (slugified IDs) using `writeBatch`
- Creates `products` documents using `addDoc` with duplicate checks
- Attaches `serverTimestamp()` to all documents

---

## State Management

Redux Toolkit manages all client state. The store is configured in `src/store/store.js` with five slices and two custom middleware functions.

### Slices

| Slice | Key State | Purpose |
|---|---|---|
| `auth` | `user`, `isLoading`, `isInitialized` | Firebase Auth session |
| `user` | `profile`, `lastUpdated` | Firestore user profile document |
| `cart` | `items[]`, `source`, `isLoading` | Shopping cart (session or Firestore-backed) |
| `products` | `items[]`, `categories[]`, `selectedCategory` | Product catalog and category filter |
| `orders` | `items[]`, `selectedOrder`, `filters` | Order history and detail |

### Cart Middleware

Two middleware functions in `src/store/middleware/cartMiddleware.js` handle cart persistence transparently:

- **`cartSyncMiddleware`** — on `login.fulfilled` / `register.fulfilled`, loads the user's Firestore cart into the store; on `logout.fulfilled`, clears the Firestore cart and reverts to session storage.
- **`cartPersistenceMiddleware`** — after any cart mutation (`addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`) while a user is logged in, automatically writes the updated cart to Firestore.

### Custom Hooks

All slices are exposed through hooks in `src/store/hooks/`: `useAuth`, `useUser`, `useProducts`, `useOrders`.

---

## CI/CD Pipeline

Continuous integration and deployment are handled by GitHub Actions (`.github/workflows/main.yml`). The pipeline triggers automatically on every push to `main`.

### Workflow Jobs

```
push to main
    │
    ▼
┌─────────────────────────┐
│   build-and-test        │  ubuntu-latest · Node 20
│  1. actions/checkout    │
│  2. npm ci              │
│  3. npm run test:run    │  ← Vitest (fails build if any test fails)
│  4. npm run build       │  ← Vite production build
└────────────┬────────────┘
             │ (must pass)
             ▼
┌─────────────────────────┐
│   deploy                │
│  amondnet/vercel-action │  ← deploys to production
└─────────────────────────┘
```

The `deploy` job only runs if `build-and-test` passes — a failing test or broken build blocks the deployment.

### Required GitHub Secrets

Add these in **GitHub → Repository → Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel → Team/Account Settings → General |
| `VERCEL_PROJECT_ID` | Vercel → Project → Settings → General |

> Firebase credentials do **not** need to be in GitHub Secrets — Vercel injects them at build time from its own Environment Variables store.

---

## Vercel Deployment

The app is deployed to Vercel and configured via `vercel.json` at the project root.

### SPA Routing

`vercel.json` contains a single rewrite rule that redirects all routes to `index.html`, enabling React Router's client-side routing without 404s on direct URL access or refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Manual Deployment

```bash
npm install -g vercel
vercel        # preview
vercel --prod # production
```