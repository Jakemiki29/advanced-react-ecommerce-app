import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import AuthGuard from './components/Auth/AuthGuard'
import { store } from './store/store'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <App />
        </AuthGuard>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
