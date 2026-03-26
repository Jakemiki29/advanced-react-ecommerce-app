import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../../services/firebase/auth.service'

// Async thunk for user registration
export const register = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const user = await registerUser(credentials.email, credentials.password, credentials.displayName)
    return user
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk for user login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const user = await loginUser(credentials.email, credentials.password)
    return user
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk for user logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutUser()
    return null
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk for initializing auth state (on app load)
export const initializeAuth = createAsyncThunk('auth/initializeAuth', async (_, { rejectWithValue }) => {
  try {
    const user = await getCurrentUser()
    return user
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isInitialized = true
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isInitialized = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isInitialized = true
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isInitialized = true
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
