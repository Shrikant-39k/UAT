import React from 'react';
import { useUser, useSession } from '@clerk/clerk-react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { useAppState } from '../../contexts/AppContext';

const DebugPanel = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();
  const { user: contextUser, jwtToken, tokenLoading } = useAppState();

  if (!isLoaded) {
    return (
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Typography variant="h6">Debug Panel - Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Debug Panel - Global State Status
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Clerk User Status:</Typography>
          <Chip 
            label={clerkUser ? 'Loaded' : 'Not Loaded'} 
            color={clerkUser ? 'success' : 'error'} 
            size="small" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`Loaded: ${isLoaded}`} 
            color={isLoaded ? 'success' : 'warning'} 
            size="small" 
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Context User:</Typography>
          <Typography variant="body2" color="text.secondary">
            {contextUser ? `ID: ${contextUser.id}` : 'No user in context'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contextUser?.primaryEmailAddress?.emailAddress || 'No email'}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Session Status:</Typography>
          <Chip 
            label={session ? 'Session Active' : 'No Session'} 
            color={session ? 'success' : 'error'} 
            size="small" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`Session Loaded: ${sessionLoaded}`} 
            color={sessionLoaded ? 'success' : 'warning'} 
            size="small" 
          />
          {session && (
            <Typography variant="body2" color="text.secondary">
              Session ID: {session.id}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">JWT Token Status:</Typography>
          <Chip 
            label={tokenLoading ? 'Loading...' : (jwtToken ? 'Available' : 'Not Available')} 
            color={jwtToken ? 'success' : (tokenLoading ? 'warning' : 'error')} 
            size="small" 
          />
          {jwtToken && (
            <Typography variant="body2" color="text.secondary">
              Token Length: {jwtToken.length} characters
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Available Clerk User Methods:</Typography>
          {clerkUser && (
            <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
              <Typography variant="caption" component="pre">
                {Object.getOwnPropertyNames(clerkUser).filter(prop => typeof clerkUser[prop] === 'function').join('\n')}
              </Typography>
            </Box>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle2">Clerk Session & User Info:</Typography>
          <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
            <Typography variant="caption" component="pre">
              {JSON.stringify({
                user: {
                  id: clerkUser?.id,
                  primaryEmailAddress: clerkUser?.primaryEmailAddress?.emailAddress,
                  fullName: clerkUser?.fullName,
                },
                session: {
                  id: session?.id,
                  status: session?.status,
                  hasGetToken: typeof session?.getToken,
                  available: !!session,
                },
                context: {
                  jwtToken: jwtToken ? `${jwtToken.substring(0, 20)}...` : null,
                  tokenLoading,
                }
              }, null, 2)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
