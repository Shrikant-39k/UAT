// Example of how to use the global state system in any component

import React, { useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useWebAuthn, useNotifications, useAppState } from '../hooks/useApi';

const ExampleComponent = () => {
  // Get global state and functions
  const { user, jwtToken, isUserLoaded } = useAppState();
  const { devices, hasDevice, loading, loadDevices, registerDevice, validateDevice } = useWebAuthn();
  const { addNotification } = useNotifications();

  // Load data when component mounts
  useEffect(() => {
    if (user && isUserLoaded) {
      loadDevices();
    }
  }, [user, isUserLoaded, loadDevices]);

  // Example of using the API functions
  const handleQuickValidation = async () => {
    try {
      await validateDevice();
      addNotification('Quick validation successful!', 'success');
    } catch (error) {
      addNotification('Quick validation failed', 'error');
    }
  };

  if (!isUserLoaded) {
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Global State Example
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            User: {user?.primaryEmailAddress?.emailAddress || 'Not available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            JWT Available: {jwtToken ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            WebAuthn Devices: {devices.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Has Device: {hasDevice ? 'Yes' : 'No'}
          </Typography>
        </Box>

        {hasDevice && (
          <Button 
            variant="contained" 
            onClick={handleQuickValidation}
            disabled={loading}
          >
            Quick Validate
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ExampleComponent;
