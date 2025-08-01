import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
  Dialog,
} from '@mui/material';
import {
  Security,
  VpnKey,
} from '@mui/icons-material';

// webauthn components
import WebAuthnSetup from '../Security/WebAuthnSetup';

const Header = () => {
  const { user } = useUser();
  const [webAuthnDialogOpen, setWebAuthnDialogOpen] = useState(false);

  const handleWebAuthnOpen = () => {
    setWebAuthnDialogOpen(true);
  };

  const handleWebAuthnClose = () => {
    setWebAuthnDialogOpen(false);
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1e7fdb 0%, #0d6efd 100%)',
        padding: '0.5rem 0',
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'white',
              color: '#1e7fdb',
              width: 50,
              height: 50,
              fontSize: '1.2rem',
              fontWeight: 700,
              mr: 2
            }}
          >
            39K
          </Avatar>
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: 700, color: 'white' }}
          >
            Unified Asset Transfer System
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />


        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <>
              {/* WebAuthn Setup Button */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Security />}
                onClick={handleWebAuthnOpen}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                  }
                }}
              >
                WebAuthn
              </Button>

              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                {user?.primaryEmailAddress?.emailAddress}
              </Typography>
              <UserButton />
            </>
          )}
        </Box>
      </Toolbar>

      {/* WebAuthn Setup Dialog */}
      <Dialog
        open={webAuthnDialogOpen}
        onClose={handleWebAuthnClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <WebAuthnSetup onClose={handleWebAuthnClose} />
      </Dialog>
    </AppBar>
  );
};

export default Header;