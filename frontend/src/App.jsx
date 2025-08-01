import { ClerkProvider, SignIn, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Paper } from '@mui/material';

// Context Provider
import { AppProvider } from './contexts/AppContext';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import NotificationSystem from './components/Common/NotificationSystem';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e7fdb',
      dark: '#1a6bb3',
    },
    secondary: {
      main: '#00A86B',
    },
    background: {
      default: '#f8f9fa',
      paper: '#FFFFFF',
    },
    grey: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
    }
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #dee2e6',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f8f9fa',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            color: '#6c757d',
          }
        }
      }
    }
  }
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const AppContent = () => {
  const { isLoaded } = useUser();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box sx={{ color: 'white', fontSize: '1.2rem' }}>Loading...</Box>
      </Box>
    );
  }

  return (
    <>
      <SignedIn>
        <Layout>
          <Dashboard />
        </Layout>
      </SignedIn>
      
      <SignedOut>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        >
          {/* Background overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1,
            }}
          />
          
          {/* Login Modal */}
          <Paper
            elevation={24}
            sx={{
              position: 'relative',
              zIndex: 2,
              borderRadius: 3,
              overflow: 'hidden',
              maxWidth: 400,
              width: '90%',
              backgroundColor: 'white',
            }}
          >
            <SignIn 
              appearance={{
                elements: {
                  rootBox: {
                    backgroundColor: 'transparent',
                  },
                  card: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                  }
                }
              }}
            />
          </Paper>
        </Box>
      </SignedOut>
      <NotificationSystem />
    </>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </AppProvider>
    </ClerkProvider>
  );
}

export default App;