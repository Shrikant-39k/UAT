import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';

const BalanceDisplay = () => {
  // Mock data - replace with API call
  const balances = [
    { asset: 'USDT', available: '3159.47', locked: '0', total: '3159.47', value: '$3,159.47' },
    { asset: 'USDC', available: '2014.16', locked: '0', total: '2014.16', value: '$2,014.16' },
    { asset: 'BNB', available: '3.3731', locked: '0', total: '3.3731', value: '$1,124.37' },
    { asset: 'ETH', available: '0.5342', locked: '0', total: '0.5342', value: '$1,602.60' },
  ];

  const totalValue = balances.reduce((sum, b) => sum + parseFloat(b.value.replace(/[$,]/g, '')), 0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Account Balances
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Available</TableCell>
              <TableCell align="right">Locked</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Value (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.asset}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {balance.asset}
                    <Chip label="Spot" size="small" variant="outlined" />
                  </Box>
                </TableCell>
                <TableCell align="right">{balance.available}</TableCell>
                <TableCell align="right">{balance.locked}</TableCell>
                <TableCell align="right">{balance.total}</TableCell>
                <TableCell align="right">{balance.value}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total Value
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BalanceDisplay;