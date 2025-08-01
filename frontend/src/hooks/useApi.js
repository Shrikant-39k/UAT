import { useCallback } from 'react';
import { useApp, ACTION_TYPES } from '../contexts/AppContext';
import { webAuthnService, userService, assetService, notificationService } from '../services/apiService';

// Custom hook for WebAuthn operations
export const useWebAuthn = () => {
  const { state, dispatch } = useApp();
  const { user, jwtToken, webAuthnDevices, hasWebAuthnDevice, webAuthnLoading } = state;

  // Load user's WebAuthn devices
  const loadDevices = useCallback(async () => {
    if (!user) return;
    
    try {
      await webAuthnService.getUserDevices(user.id, jwtToken, dispatch);
    } catch (error) {
      console.log('Failed to load WebAuthn devices, will use mock data for development');
      notificationService.addNotification(
        dispatch,
        'Using mock data for WebAuthn devices (development mode)',
        'info'
      );
    }
  }, [user, jwtToken, dispatch]);

  // Register new WebAuthn device
  const registerDevice = useCallback(async (keyName) => {
    if (!user || !keyName.trim()) {
      throw new Error('Missing required data for registration');
    }

    // Show warning if no JWT token
    if (!jwtToken) {
      notificationService.addNotification(
        dispatch,
        'No authentication token available. This is a development limitation.',
        'warning'
      );
      throw new Error('No authentication token available');
    }

    try {
      // Check WebAuthn support
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported by this browser');
      }

      // Step 1: Get registration options
      const options = await webAuthnService.startRegistration(
        user.id,
        user.primaryEmailAddress?.emailAddress,
        user.fullName || user.primaryEmailAddress?.emailAddress,
        jwtToken,
        dispatch
      );

      // Step 2: Create credentials
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge),
          user: {
            ...options.user,
            id: new Uint8Array(options.user.id),
          },
        },
      });

      // Step 3: Complete registration
      const credentialData = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
        },
        type: credential.type,
      };

      await webAuthnService.completeRegistration(credentialData, keyName.trim(), jwtToken, dispatch);
      
      // Refresh device list
      await loadDevices();
      
      notificationService.addNotification(
        dispatch,
        'Security key registered successfully!',
        'success'
      );

      return true;
    } catch (error) {
      let errorMessage = 'Failed to register security key';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Registration was cancelled or not allowed';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'WebAuthn is not supported by this browser';
      } else if (error.message) {
        errorMessage = error.message;
      }

      notificationService.addNotification(dispatch, errorMessage, 'error');
      throw error;
    }
  }, [user, jwtToken, dispatch, loadDevices]);

  // Validate WebAuthn device
  const validateDevice = useCallback(async () => {
    if (!user) {
      throw new Error('Missing user data for validation');
    }

    // Show warning if no JWT token
    if (!jwtToken) {
      notificationService.addNotification(
        dispatch,
        'No authentication token available. This is a development limitation.',
        'warning'
      );
      throw new Error('No authentication token available');
    }

    try {
      // Check WebAuthn support
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported by this browser');
      }

      // Step 1: Get authentication options
      const options = await webAuthnService.startAuthentication(user.id, jwtToken, dispatch);

      // Step 2: Get assertion
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge),
          allowCredentials: options.allowCredentials?.map(cred => ({
            ...cred,
            id: new Uint8Array(cred.id),
          })),
        },
      });

      // Step 3: Complete authentication
      const assertionData = {
        id: assertion.id,
        rawId: Array.from(new Uint8Array(assertion.rawId)),
        response: {
          authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
          clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
          signature: Array.from(new Uint8Array(assertion.response.signature)),
          userHandle: assertion.response.userHandle ? Array.from(new Uint8Array(assertion.response.userHandle)) : null,
        },
        type: assertion.type,
      };

      await webAuthnService.completeAuthentication(assertionData, jwtToken, dispatch);
      
      notificationService.addNotification(
        dispatch,
        'Security key validated successfully!',
        'success'
      );

      return true;
    } catch (error) {
      let errorMessage = 'Failed to validate security key';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Validation was cancelled or not allowed';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'WebAuthn is not supported by this browser';
      } else if (error.message) {
        errorMessage = error.message;
      }

      notificationService.addNotification(dispatch, errorMessage, 'error');
      throw error;
    }
  }, [user, jwtToken, dispatch]);

  // Delete WebAuthn device
  const deleteDevice = useCallback(async (deviceId) => {
    if (!jwtToken) {
      throw new Error('Missing JWT token');
    }

    try {
      await webAuthnService.deleteDevice(deviceId, jwtToken, dispatch);
      
      // Refresh device list
      await loadDevices();
      
      notificationService.addNotification(
        dispatch,
        'Security key deleted successfully',
        'success'
      );

      return true;
    } catch (error) {
      notificationService.addNotification(
        dispatch,
        error.message || 'Failed to delete security key',
        'error'
      );
      throw error;
    }
  }, [jwtToken, dispatch, loadDevices]);

  return {
    // State
    devices: webAuthnDevices,
    hasDevice: hasWebAuthnDevice,
    loading: webAuthnLoading,
    
    // Actions
    loadDevices,
    registerDevice,
    validateDevice,
    deleteDevice,
  };
};

// Custom hook for user operations
export const useUserProfile = () => {
  const { state, dispatch } = useApp();
  const { user, jwtToken } = state;

  const getProfile = useCallback(async () => {
    if (!user || !jwtToken) return;

    try {
      return await userService.getProfile(user.id, jwtToken, dispatch);
    } catch (error) {
      notificationService.addNotification(
        dispatch,
        'Failed to load user profile',
        'error'
      );
      throw error;
    }
  }, [user, jwtToken, dispatch]);

  const updateProfile = useCallback(async (profileData) => {
    if (!user || !jwtToken) {
      throw new Error('Missing user data or JWT token');
    }

    try {
      const result = await userService.updateProfile(user.id, profileData, jwtToken, dispatch);
      
      notificationService.addNotification(
        dispatch,
        'Profile updated successfully',
        'success'
      );

      return result;
    } catch (error) {
      notificationService.addNotification(
        dispatch,
        error.message || 'Failed to update profile',
        'error'
      );
      throw error;
    }
  }, [user, jwtToken, dispatch]);

  return {
    getProfile,
    updateProfile,
  };
};

// Custom hook for asset operations
export const useAssets = () => {
  const { state, dispatch } = useApp();
  const { user, jwtToken } = state;

  const getBalances = useCallback(async () => {
    if (!user || !jwtToken) return;

    try {
      return await assetService.getBalances(user.id, jwtToken, dispatch);
    } catch (error) {
      notificationService.addNotification(
        dispatch,
        'Failed to load balances',
        'error'
      );
      throw error;
    }
  }, [user, jwtToken, dispatch]);

  const transferAssets = useCallback(async (transferData) => {
    if (!user || !jwtToken) {
      throw new Error('Missing user data or JWT token');
    }

    try {
      const result = await assetService.transferAssets(transferData, jwtToken, dispatch);
      
      notificationService.addNotification(
        dispatch,
        'Asset transfer completed successfully',
        'success'
      );

      return result;
    } catch (error) {
      notificationService.addNotification(
        dispatch,
        error.message || 'Failed to transfer assets',
        'error'
      );
      throw error;
    }
  }, [user, jwtToken, dispatch]);

  const getTransferHistory = useCallback(async () => {
    if (!user || !jwtToken) return;

    try {
      return await assetService.getTransferHistory(user.id, jwtToken, dispatch);
    } catch (error) {
      notificationService.addNotification(
        dispatch,
        'Failed to load transfer history',
        'error'
      );
      throw error;
    }
  }, [user, jwtToken, dispatch]);

  return {
    getBalances,
    transferAssets,
    getTransferHistory,
  };
};

// Custom hook for notifications
export const useNotifications = () => {
  const { state, dispatch } = useApp();
  const { notifications } = state;

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    return notificationService.addNotification(dispatch, message, type, duration);
  }, [dispatch]);

  const removeNotification = useCallback((id) => {
    notificationService.removeNotification(dispatch, id);
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    notifications.forEach(notification => {
      removeNotification(notification.id);
    });
  }, [notifications, removeNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
};

// Custom hook for API errors
export const useApiErrors = () => {
  const { state, dispatch } = useApp();
  const { apiErrors } = state;

  const clearError = useCallback((key) => {
    dispatch({ type: ACTION_TYPES.CLEAR_API_ERROR, payload: key });
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    Object.keys(apiErrors).forEach(key => {
      clearError(key);
    });
  }, [apiErrors, clearError]);

  return {
    errors: apiErrors,
    clearError,
    clearAllErrors,
  };
};
