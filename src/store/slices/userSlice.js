import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserProfile, updateUserProfile, deleteUserAccount } from '../../services/firebase/users.service'

// Async thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (userId, { rejectWithValue }) => {
  try {
    const profile = await getUserProfile(userId)
    return profile
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk to update user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      const profile = await updateUserProfile(userId, updates)
      return profile
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Async thunk to delete user account
export const deleteAccount = createAsyncThunk('user/deleteAccount', async (userId, { rejectWithValue }) => {
  try {
    await deleteUserAccount(userId)
    return null
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetProfile: (state) => {
      state.profile = null
      state.lastUpdated = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Delete Account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false
        state.profile = null
        state.lastUpdated = null
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, resetProfile } = userSlice.actions
export default userSlice.reducer
