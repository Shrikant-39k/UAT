import React from 'react';
import { 
  Snackbar, 
  Alert, 
  Box,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useNotifications } from '../../hooks/useApi';

const NotificationSystem = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: '400px',
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ position: 'static', transform: 'none' }}
        >
          <Alert
            severity={notification.type}
            variant="filled"
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => removeNotification(notification.id)}
              >
                <Close fontSize="small" />
              </IconButton>
            }
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default NotificationSystem;
