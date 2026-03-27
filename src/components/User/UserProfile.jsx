import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks/useAuth'
import { useUser } from '../../store/hooks/useUser'
import { auth } from '../../config/firebase.config'
import { deleteUserFromAuth } from '../../services/firebase/users.service'
import { reauthenticateUser } from '../../services/firebase/auth.service'
import './UserProfile.css'

function UserProfile() {
  const { user: authUser, logout } = useAuth()
  const { profile, isLoading, error, fetchProfile, updateProfile, deleteAccount, clearError } = useUser()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  })

  // Load user profile on component mount
  useEffect(() => {
    if (authUser?.uid) {
      fetchProfile(authUser.uid)
    }
  }, [authUser?.uid, fetchProfile])

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      })
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (authUser?.uid) {
      const result = await updateProfile(authUser.uid, formData)
      if (!result.payload?.error) {
        setIsEditing(false)
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!authUser?.uid) return

    setDeleteError('')

    // First click — reveal the password-confirmation form
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password to confirm account deletion.')
      return
    }

    clearError()
    setIsDeleting(true)

    try {
      // Re-authenticate before deleting to satisfy Firebase's recency requirement
      await reauthenticateUser(deletePassword)

      const result = await deleteAccount(authUser.uid)

      if (!result.payload?.error) {
        await deleteUserFromAuth(auth.currentUser)
        await logout()
        navigate('/register')
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account. Please check your password and try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!profile && isLoading) {
    return <div className="profile-loading">Loading profile...</div>
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-section">
        <h3>Account Information</h3>
        <div className="profile-info">
          <div className="info-row">
            <label>Email:</label>
            <span>{authUser?.email || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Display Name:</label>
            <span>{profile?.displayName || 'Not set'}</span>
          </div>
          <div className="info-row">
            <label>Phone:</label>
            <span>{profile?.phone || 'Not set'}</span>
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <h3>Edit Profile</h3>

          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-section">
            <h4>Address</h4>

            <div className="form-group">
              <label htmlFor="street">Street</label>
              <input
                id="street"
                name="street"
                type="text"
                value={formData.address.street}
                onChange={handleAddressChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={formData.address.zipCode}
                  onChange={handleAddressChange}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isLoading || isDeleting} className="submit-btn">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                clearError()
              }}
              disabled={isDeleting}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-address">
          <h3>Address</h3>
          <div className="address-info">
            {profile?.address?.street ? (
              <>
                <p>{profile.address.street}</p>
                <p>
                  {profile.address.city}, {profile.address.state} {profile.address.zipCode}
                </p>
                <p>{profile.address.country}</p>
              </>
            ) : (
              <p>No address set</p>
            )}
          </div>

          <button onClick={() => setIsEditing(true)} className="edit-btn">
            Edit Profile
          </button>

          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p>Delete your account and remove your profile data from Firestore.</p>
            {showDeleteConfirm ? (
              <div className="delete-confirm">
                <p>Enter your password to confirm. This action cannot be undone.</p>
                {deleteError && <div className="error-message">{deleteError}</div>}
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isDeleting}
                  className="password-input"
                />
                <div className="form-actions">
                  <button type="button" onClick={handleDeleteAccount} disabled={isDeleting} className="delete-btn">
                    {isDeleting ? 'Deleting Account...' : 'Confirm Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeletePassword('')
                      setDeleteError('')
                    }}
                    disabled={isDeleting}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={handleDeleteAccount} disabled={isDeleting} className="delete-btn">
                Delete Account
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
