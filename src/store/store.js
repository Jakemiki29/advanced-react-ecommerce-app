import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import productsReducer from './slices/productsSlice'
import ordersReducer from './slices/ordersSlice'
import { cartSyncMiddleware, cartPersistenceMiddleware } from './middleware/cartMiddleware'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    user: userReducer,
    products: productsReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartSyncMiddleware, cartPersistenceMiddleware),
})
