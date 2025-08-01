import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Security,
  Fingerprint,
  VpnKey,
  Close,
} from '@mui/icons-material';

// Use our global hooks instead of direct Clerk imports
import { useWebAuthn, useNotifications } from '../../hooks/useApi';
import { useAppState } from '../../contexts/AppContext';

const WebAuthnSetup = ({ onClose }) => {
  // Use global state and hooks
  const { user, isUserLoaded } = useAppState();
  const { devices, hasDevice, loading, loadDevices, registerDevice, validateDevice } = useWebAuthn();
  const { notifications } = useNotifications();
  
  // Local state for UI
  const [registering, setRegistering] = useState(false);
  const [validating, setValidating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Load devices when component mounts
  useEffect(() => {
    if (user && isUserLoaded) {
      loadDevices();
    }
  }, [user, isUserLoaded, loadDevices]);

  // Handle device registration
  const handleRegisterDevice = async () => {
    setRegistering(true);
    setLocalError('');
    
    try {
      // Use a default name for now
      const defaultKeyName = `Security Key ${new Date().toLocaleDateString()}`;
      await registerDevice(defaultKeyName);
      setLocalSuccess('Security key registered successfully!');
    } catch (error) {
      setLocalError(error.message || 'Failed to register security key');
    } finally {
      setRegistering(false);
    }
  };

  // Handle device validation
  const handleValidateDevice = async () => {
    setValidating(true);
    setLocalError('');
    
    try {
      await validateDevice();
      setLocalSuccess('Security key validated successfully!');
    } catch (error) {
      setLocalError(error.message || 'Failed to validate security key');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security color="primary" />
              <Typography variant="h6">WebAuthn Setup</Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </>
    );
  }

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            <Typography variant="h6">WebAuthn Setup</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {localSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setLocalSuccess('')}>
            {localSuccess}
          </Alert>
        )}
        
        {localError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError('')}>
            {localError}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            {hasDevice 
              ? 'Your account has WebAuthn security keys configured. You can validate them.'
              : 'No WebAuthn security keys found. Register a security key to enhance your account security.'
            }
          </Typography>
        </Box>

        {/* Single Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {hasDevice ? (
            <Button
              variant="contained"
              startIcon={validating ? <CircularProgress size={20} /> : <VpnKey />}
              onClick={handleValidateDevice}
              disabled={validating}
              size="large"
              sx={{ minWidth: 200 }}
            >
              {validating ? 'Validating...' : 'Validate YubiKey'}
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={registering ? <CircularProgress size={20} /> : <Fingerprint />}
              onClick={handleRegisterDevice}
              disabled={registering}
              size="large"
              sx={{ minWidth: 200 }}
            >
              {registering ? 'Registering...' : 'Register Security Key'}
            </Button>
          )}
        </Box>

        {/* Browser Compatibility Info */}
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <Security fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            WebAuthn is supported by modern browsers and works with security keys like YubiKey, 
            platform authenticators (Touch ID, Windows Hello), and biometric devices.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
};

export default WebAuthnSetup;
