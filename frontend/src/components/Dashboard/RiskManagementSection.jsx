import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Assessment,
} from '@mui/icons-material';

const RiskManagementSection = () => {
  const [account, setAccount] = useState('');
  const [accountType, setAccountType] = useState('Futures');

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>Risk Management</Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Account</InputLabel>
              <Select
                value={account}
                label="Account"
                onChange={(e) => setAccount(e.target.value)}
              >
                <MenuItem value="Select Account">Select Account</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Account Type</InputLabel>
              <Select
                value={accountType}
                label="Account Type"
                onChange={(e) => setAccountType(e.target.value)}
              >
                <MenuItem value="Futures">Futures</MenuItem>
                <MenuItem value="Spot">Spot</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{ borderRadius: 2, py: 1 }}
            >
              GET IM DATA
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RiskManagementSection;
