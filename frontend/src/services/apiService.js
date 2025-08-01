import { ACTION_TYPES } from '../contexts/AppContext';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Generic API call function
const makeApiCall = async (url, options = {}, dispatch, errorKey) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Only add Authorization header if it exists
    if (options.headers && options.headers.Authorization && options.headers.Authorization !== 'Bearer null') {
      headers.Authorization = options.headers.Authorization;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Clear any previous errors for this endpoint
    if (errorKey) {
      dispatch({ type: ACTION_TYPES.CLEAR_API_ERROR, payload: errorKey });
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${errorKey}):`, error);
    
    // Store error in global state
    if (errorKey && dispatch) {
      dispatch({
        type: ACTION_TYPES.SET_API_ERROR,
        payload: { key: errorKey, error: error.message }
      });
    }
    
    throw error;
  }
};

// WebAuthn API service
export const webAuthnService = {
  // Get user's WebAuthn devices
  getUserDevices: async (userId, jwtToken, dispatch) => {
    dispatch({ type: ACTION_TYPES.SET_WEBAUTHN_LOADING, payload: true });
    
    try {
      const data = await makeApiCall(
        `/webauthn/user/${userId}/devices`,
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
        },
        dispatch,
        'webauthn-devices'
      );
      
      dispatch({ type: ACTION_TYPES.SET_WEBAUTHN_DEVICES, payload: data });
      return data;
    } catch (error) {
      // For development - use mock data when API fails
      console.log('WebAuthn API not available, using mock data for development');
      const mockData = {
        devices: Math.random() > 0.5 ? [
          {
            id: '1',
            name: 'YubiKey 5C',
            createdAt: '2024-01-15T10:30:00Z',
            lastUsed: '2024-01-20T15:45:00Z',
          }
        ] : []
      };
      
      dispatch({ type: ACTION_TYPES.SET_WEBAUTHN_DEVICES, payload: mockData });
      return mockData;
    }
  },

  // Start WebAuthn registration
  startRegistration: async (userId, username, displayName, jwtToken, dispatch) => {
    return await makeApiCall(
      '/webauthn/register/begin',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userId,
          username,
          displayName,
        }),
      },
      dispatch,
      'webauthn-register-begin'
    );
  },

  // Complete WebAuthn registration
  completeRegistration: async (credential, keyName, jwtToken, dispatch) => {
    return await makeApiCall(
      '/webauthn/register/complete',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          credential,
          keyName,
        }),
      },
      dispatch,
      'webauthn-register-complete'
    );
  },

  // Start WebAuthn authentication
  startAuthentication: async (userId, jwtToken, dispatch) => {
    return await makeApiCall(
      '/webauthn/authenticate/begin',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userId,
        }),
      },
      dispatch,
      'webauthn-auth-begin'
    );
  },

  // Complete WebAuthn authentication
  completeAuthentication: async (assertion, jwtToken, dispatch) => {
    return await makeApiCall(
      '/webauthn/authenticate/complete',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          assertion,
        }),
      },
      dispatch,
      'webauthn-auth-complete'
    );
  },

  // Delete WebAuthn device
  deleteDevice: async (deviceId, jwtToken, dispatch) => {
    return await makeApiCall(
      `/webauthn/device/${deviceId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      },
      dispatch,
      'webauthn-delete-device'
    );
  },
};

// User API service
export const userService = {
  // Get user profile
  getProfile: async (userId, jwtToken, dispatch) => {
    return await makeApiCall(
      `/user/${userId}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      },
      dispatch,
      'user-profile'
    );
  },

  // Update user profile
  updateProfile: async (userId, profileData, jwtToken, dispatch) => {
    return await makeApiCall(
      `/user/${userId}/profile`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(profileData),
      },
      dispatch,
      'user-update-profile'
    );
  },
};

// Asset transfer API service
export const assetService = {
  // Get user balances
  getBalances: async (userId, jwtToken, dispatch) => {
    return await makeApiCall(
      `/assets/user/${userId}/balances`,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      },
      dispatch,
      'asset-balances'
    );
  },

  // Transfer assets
  transferAssets: async (transferData, jwtToken, dispatch) => {
    return await makeApiCall(
      '/assets/transfer',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(transferData),
      },
      dispatch,
      'asset-transfer'
    );
  },

  // Get transfer history
  getTransferHistory: async (userId, jwtToken, dispatch) => {
    return await makeApiCall(
      `/assets/user/${userId}/history`,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      },
      dispatch,
      'asset-history'
    );
  },
};

// Notification utility
export const notificationService = {
  // Add notification
  addNotification: (dispatch, message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date().toISOString(),
    };
    
    dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification });
    
    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
      }, duration);
    }
    
    return id;
  },

  // Remove notification
  removeNotification: (dispatch, id) => {
    dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
  },
};
