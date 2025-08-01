import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useUser, useSession } from '@clerk/clerk-react';

// Initial state
const initialState = {
  // User data
  user: null,
  isUserLoaded: false,
  
  // JWT token
  jwtToken: null,
  tokenLoading: false,
  
  // WebAuthn data
  webAuthnDevices: [],
  hasWebAuthnDevice: false,
  webAuthnLoading: false,
  
  // API states
  apiErrors: {},
  lastUpdated: null,
  
  // UI states
  notifications: [],
};

// Action types
const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  SET_USER_LOADED: 'SET_USER_LOADED',
  SET_JWT_TOKEN: 'SET_JWT_TOKEN',
  SET_TOKEN_LOADING: 'SET_TOKEN_LOADING',
  SET_WEBAUTHN_DEVICES: 'SET_WEBAUTHN_DEVICES',
  SET_WEBAUTHN_LOADING: 'SET_WEBAUTHN_LOADING',
  SET_API_ERROR: 'SET_API_ERROR',
  CLEAR_API_ERROR: 'CLEAR_API_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    
    case ACTION_TYPES.SET_USER_LOADED:
      return {
        ...state,
        isUserLoaded: action.payload,
      };
    
    case ACTION_TYPES.SET_JWT_TOKEN:
      return {
        ...state,
        jwtToken: action.payload,
        tokenLoading: false,
        lastUpdated: new Date().toISOString(),
      };
    
    case ACTION_TYPES.SET_TOKEN_LOADING:
      return {
        ...state,
        tokenLoading: action.payload,
      };
    
    case ACTION_TYPES.SET_WEBAUTHN_DEVICES:
      return {
        ...state,
        webAuthnDevices: action.payload.devices || [],
        hasWebAuthnDevice: (action.payload.devices || []).length > 0,
        webAuthnLoading: false,
        lastUpdated: new Date().toISOString(),
      };
    
    case ACTION_TYPES.SET_WEBAUTHN_LOADING:
      return {
        ...state,
        webAuthnLoading: action.payload,
      };
    
    case ACTION_TYPES.SET_API_ERROR:
      return {
        ...state,
        apiErrors: {
          ...state.apiErrors,
          [action.payload.key]: action.payload.error,
        },
      };
    
    case ACTION_TYPES.CLEAR_API_ERROR:
      const newErrors = { ...state.apiErrors };
      delete newErrors[action.payload];
      return {
        ...state,
        apiErrors: newErrors,
      };
    
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case ACTION_TYPES.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// Create contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, isLoaded } = useUser();
  const { session } = useSession();

  // Update user data when Clerk user changes
  useEffect(() => {
    dispatch({ type: ACTION_TYPES.SET_USER, payload: user });
    dispatch({ type: ACTION_TYPES.SET_USER_LOADED, payload: isLoaded });
  }, [user, isLoaded]);

  // Get fresh JWT token when user or session changes
  useEffect(() => {
    const getToken = async () => {
      if (user && isLoaded && session) {
        try {
          dispatch({ type: ACTION_TYPES.SET_TOKEN_LOADING, payload: true });
          
          // Get token from session - this is the correct way for Clerk
          const token = await session.getToken();
          
          dispatch({ type: ACTION_TYPES.SET_JWT_TOKEN, payload: token });
        } catch (error) {
          
          // For development, continue without token
          dispatch({ type: ACTION_TYPES.SET_JWT_TOKEN, payload: null });
          dispatch({ type: ACTION_TYPES.SET_API_ERROR, payload: { 
            key: 'jwt', 
            error: `Token retrieval failed: ${error.message}` 
          }});
        } finally {
          dispatch({ type: ACTION_TYPES.SET_TOKEN_LOADING, payload: false });
        }
      } else {
        dispatch({ type: ACTION_TYPES.SET_JWT_TOKEN, payload: null });
        dispatch({ type: ACTION_TYPES.SET_TOKEN_LOADING, payload: false });
      }
    };

    getToken();
  }, [user, isLoaded, session]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// Custom hooks for using the context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
};

// Combined hook for convenience
export const useApp = () => {
  return {
    state: useAppState(),
    dispatch: useAppDispatch(),
  };
};

// Export action types for use in components
export { ACTION_TYPES };
