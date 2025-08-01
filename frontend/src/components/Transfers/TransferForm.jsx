import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import { Send } from '@mui/icons-material';

const TransferForm = () => {
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    coin: 'USDT',
    amount: '',
    chainPriority: 'high',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Transfer data:', formData);
    // API call to initiate transfer
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Inter Exchange Transfer
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="fromAccount"
            label="From Account"
            value={formData.fromAccount}
            onChange={handleChange}
            select
            required
          >
            <MenuItem value="binance_main">Binance Main</MenuItem>
            <MenuItem value="okx_main">OKX Main</MenuItem>
            <MenuItem value="bybit_main">Bybit Main</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            name="toAccount"
            label="To Account"
            value={formData.toAccount}
            onChange={handleChange}
            select
            required
          >
            <MenuItem value="binance_sub1">Binance Sub 1</MenuItem>
            <MenuItem value="okx_sub1">OKX Sub 1</MenuItem>
            <MenuItem value="bybit_sub1">Bybit Sub 1</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="coin"
            label="Coin"
            value={formData.coin}
            onChange={handleChange}
            select
            required
          >
            <MenuItem value="USDT">USDT</MenuItem>
            <MenuItem value="USDC">USDC</MenuItem>
            <MenuItem value="BTC">BTC</MenuItem>
            <MenuItem value="ETH">ETH</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="amount"
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">{formData.coin}</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="chainPriority"
            label="Chain Priority"
            value={formData.chainPriority}
            onChange={handleChange}
            select
            required
          >
            <MenuItem value="high">High (Fast)</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low (Cheap)</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info">
            Estimated fee: 0.1 {formData.coin} | Estimated time: 2-5 minutes
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<Send />}
            fullWidth
          >
            Initiate Transfer
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransferForm;