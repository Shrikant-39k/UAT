import React, { useState } from 'react';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import { OpenInNew, CheckCircle, HourglassEmpty, Error } from '@mui/icons-material';

const TransactionHistory = () => {
  // Mock data - replace with API call
  const transactions = [
    {
      id: '3124970',
      from: 'Binance Main',
      to: 'OKX Sub1',
      coin: 'USDT',
      amount: '16200',
      status: 'success',
      fee: '0',
      date: '2025-01-20 14:30:00',
      txHash: '0x1234...5678',
    },
    {
      id: '3121417',
      from: 'OKX Main',
      to: 'Binance Sub2',
      coin: 'USDT',
      amount: '16000',
      status: 'success',
      fee: '0',
      date: '2025-01-20 12:15:00',
      txHash: '0xabcd...efgh',
    },
    {
      id: '2163060',
      from: 'Bybit Main',
      to: 'Binance Main',
      coin: 'USDT',
      amount: '1',
      status: 'pending',
      fee: '0',
      date: '2025-01-20 10:45:00',
      txHash: null,
    },
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case 'success':
        return <Chip icon={<CheckCircle />} label="Success" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<HourglassEmpty />} label="Pending" color="warning" size="small" />;
      case 'failed':
        return <Chip icon={<Error />} label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Coin/Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Fee</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.id}</TableCell>
                <TableCell>{tx.from}</TableCell>
                <TableCell>{tx.to}</TableCell>
                <TableCell>
                  {tx.amount} {tx.coin}
                </TableCell>
                <TableCell>{getStatusChip(tx.status)}</TableCell>
                <TableCell>{tx.fee}</TableCell>
                <TableCell>{tx.date}</TableCell>
                <TableCell>
                  {tx.txHash && (
                    <Tooltip title="View on blockchain">
                      <IconButton size="small">
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionHistory;