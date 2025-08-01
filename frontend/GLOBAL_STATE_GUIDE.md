# Global State Management System

## Overview
This application now uses a comprehensive global state management system that eliminates the need to import Clerk hooks and manage JWT tokens repeatedly throughout the application.

## Architecture

### 🎯 Core Components

1. **AppContext** (`src/contexts/AppContext.jsx`)
   - Central state management using React Context + useReducer
   - Automatically manages user data, JWT tokens, and WebAuthn state
   - Handles all Clerk integration internally

2. **API Service Layer** (`src/services/apiService.js`)
   - Centralized API calling functions
   - Automatic error handling and state updates
   - JWT token management
   - Mock data fallbacks for development

3. **Custom Hooks** (`src/hooks/useApi.js`)
   - High-level hooks for common operations
   - WebAuthn operations, user profile, assets, notifications
   - Built on top of the global state

4. **Notification System** (`src/components/Common/NotificationSystem.jsx`)
   - Global toast notifications
   - Automatic cleanup and positioning

## 🚀 How to Use

### Basic Setup (Already Done)
```jsx
// App.jsx - Already configured
<ClerkProvider publishableKey={clerkPubKey}>
  <AppProvider>  {/* Global state wrapper */}
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  </AppProvider>
</ClerkProvider>
```

### Using Global State in Components

#### Method 1: Direct State Access
```jsx
import { useAppState } from '../contexts/AppContext';

const MyComponent = () => {
  const { user, jwtToken, isUserLoaded, webAuthnDevices, hasWebAuthnDevice } = useAppState();
  
  // Use state directly
  if (!isUserLoaded) return <Loading />;
  
  return (
    <div>
      <h1>Hello {user?.fullName}</h1>
      <p>JWT Available: {jwtToken ? 'Yes' : 'No'}</p>
      <p>WebAuthn Devices: {webAuthnDevices.length}</p>
    </div>
  );
};
```

#### Method 2: High-Level Hooks (Recommended)
```jsx
import { useWebAuthn, useNotifications } from '../hooks/useApi';

const SecurityComponent = () => {
  const { devices, hasDevice, loading, registerDevice, validateDevice } = useWebAuthn();
  const { addNotification } = useNotifications();
  
  const handleRegister = async () => {
    try {
      await registerDevice('My YubiKey');
      addNotification('Device registered successfully!', 'success');
    } catch (error) {
      // Error handling is automatic, but you can add custom logic here
    }
  };
  
  return (
    <div>
      <button onClick={handleRegister} disabled={loading}>
        Register Security Key
      </button>
    </div>
  );
};
```

## 🔧 Available Hooks

### `useWebAuthn()`
```jsx
const {
  devices,          // Array of registered WebAuthn devices
  hasDevice,        // Boolean: user has at least one device
  loading,          // Boolean: operations in progress
  loadDevices,      // Function: refresh device list
  registerDevice,   // Function: register new device
  validateDevice,   // Function: validate existing device
  deleteDevice,     // Function: delete a device
} = useWebAuthn();
```

### `useNotifications()`
```jsx
const {
  notifications,           // Array of active notifications
  addNotification,         // Function: add notification
  removeNotification,      // Function: remove specific notification
  clearAllNotifications,   // Function: clear all notifications
} = useNotifications();

// Usage
addNotification('Operation completed!', 'success', 5000); // message, type, duration
```

### `useAssets()`
```jsx
const {
  getBalances,        // Function: get user balances
  transferAssets,     // Function: transfer assets
  getTransferHistory, // Function: get transfer history
} = useAssets();
```

### `useUserProfile()`
```jsx
const {
  getProfile,      // Function: get user profile
  updateProfile,   // Function: update user profile
} = useUserProfile();
```

## 📡 API Services

### Automatic Features
- **JWT Token Management**: Automatically included in all API calls
- **Error Handling**: Errors are stored in global state and can trigger notifications
- **Loading States**: Automatically managed for WebAuthn operations
- **Mock Data**: Development fallbacks when backend APIs are unavailable

### Service Methods
```jsx
// WebAuthn Service
await webAuthnService.getUserDevices(userId, jwtToken, dispatch);
await webAuthnService.startRegistration(userId, username, displayName, jwtToken, dispatch);
await webAuthnService.completeRegistration(credential, keyName, jwtToken, dispatch);

// User Service  
await userService.getProfile(userId, jwtToken, dispatch);
await userService.updateProfile(userId, profileData, jwtToken, dispatch);

// Asset Service
await assetService.getBalances(userId, jwtToken, dispatch);
await assetService.transferAssets(transferData, jwtToken, dispatch);
```

## 🎨 UI Integration

### Notifications
- Automatically positioned in top-right corner
- Multiple notification types: `success`, `error`, `warning`, `info`
- Auto-dismiss after 5 seconds (configurable)
- Manual dismiss option

### Error Handling
```jsx
import { useApiErrors } from '../hooks/useApi';

const MyComponent = () => {
  const { errors, clearError } = useApiErrors();
  
  if (errors['webauthn-devices']) {
    return <Alert onClose={() => clearError('webauthn-devices')}>
      {errors['webauthn-devices']}
    </Alert>;
  }
};
```

## 🔒 Security Features

### JWT Token Lifecycle
- Automatically retrieved from Clerk session on user login
- Stored in global state for easy access
- Automatically included in API headers
- Cleared on user logout

### WebAuthn Integration
- Complete registration and validation flow
- Device management (list, delete)
- Browser compatibility checking
- Graceful error handling

## 🛠 Development Features

### Debug Panel
Uncomment in `Dashboard.jsx` to enable debugging:
```jsx
import DebugPanel from '../Debug/DebugPanel';
// In component:
<DebugPanel /> // Shows user state, JWT status, session info
```

### Mock Data
- WebAuthn operations fall back to mock data when API is unavailable
- Helps with frontend development without backend
- Console logging for debugging

## 📝 Benefits

1. **No More Repetitive Imports**: No need to import `useUser`, `useSession` everywhere
2. **Centralized JWT Management**: Token automatically handled across all API calls
3. **Consistent Error Handling**: Unified error management and user feedback
4. **Type Safety**: Well-defined state structure and action types
5. **Performance**: Minimal re-renders with optimized context structure
6. **Development Experience**: Mock data, debug tools, comprehensive logging

## 🚀 Migration Guide

### Before (Old Way)
```jsx
const MyComponent = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleAPI = async () => {
    setLoading(true);
    try {
      const token = await user.getToken(); // ❌ Error prone
      const response = await fetch('/api/endpoint', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Manual error handling...
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
};
```

### After (New Way)
```jsx
const MyComponent = () => {
  const { user, jwtToken } = useAppState();
  const { addNotification } = useNotifications();
  
  const handleAPI = async () => {
    try {
      // Use service layer - JWT automatically included
      const result = await someService.doSomething(user.id, jwtToken, dispatch);
      addNotification('Success!', 'success');
    } catch (error) {
      // Error handling is automatic via service layer
    }
  };
};
```

## 🎯 Best Practices

1. **Use High-Level Hooks**: Prefer `useWebAuthn()` over direct API calls
2. **Leverage Notifications**: Use global notifications instead of local state
3. **Check Loading States**: Always handle loading states for better UX
4. **Error Boundaries**: Implement error boundaries for component-level error handling
5. **Debug Mode**: Use DebugPanel during development to understand state flow

This global state system provides a robust, scalable foundation for the application while significantly reducing boilerplate code and improving developer experience.
