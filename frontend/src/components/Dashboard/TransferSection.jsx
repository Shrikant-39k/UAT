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
  TextField,
  Divider,
} from '@mui/material';
import {
  SwapHoriz,
  TrendingUp,
} from '@mui/icons-material';

const TransferSection = () => {
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [coin, setCoin] = useState('');
  const [chainPriority, setChainPriority] = useState('High');
  const [amount, setAmount] = useState('');
  
  const [mainAccount, setMainAccount] = useState('');
  const [subAccount, setSubAccount] = useState('');
  const [direction, setDirection] = useState('Main to Sub');
  const [accountType, setAccountType] = useState('Spot');
  const [subAccountType, setSubAccountType] = useState('spot');
  const [coinAsset, setCoinAsset] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

return (
    <Card sx={{ mb: 3 }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SwapHoriz sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>Transfers</Typography>
            </Box>

            {/* Inter Exchange Transactions */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Inter Exchange Transactions
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>From Account</InputLabel>
                        <Select
                            value={fromAccount}
                            label="From Account"
                            onChange={(e) => setFromAccount(e.target.value)}
                        >
                            <MenuItem value="Select Account">Select Account</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>To Account</InputLabel>
                        <Select
                            value={toAccount}
                            label="To Account"
                            onChange={(e) => setToAccount(e.target.value)}
                        >
                            <MenuItem value="Select Account">Select Account</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Coin</InputLabel>
                        <Select
                            value={coin}
                            label="Coin"
                            onChange={(e) => setCoin(e.target.value)}
                        >
                            <MenuItem value="">Select Coin</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Chain Priority</InputLabel>
                        <Select
                            value={chainPriority}
                            label="Chain Priority"
                            onChange={(e) => setChainPriority(e.target.value)}
                        >
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Button 
                    variant="contained" 
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    GET INFO
                </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Internal Transfers */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Internal Transfers
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Main Account</InputLabel>
                        <Select
                            value={mainAccount}
                            label="Main Account"
                            onChange={(e) => setMainAccount(e.target.value)}
                        >
                            <MenuItem value="Select Account">Select Account</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sub Account</InputLabel>
                        <Select
                            value={subAccount}
                            label="Sub Account"
                            onChange={(e) => setSubAccount(e.target.value)}
                        >
                            <MenuItem value="Select Subaccount">Select Subaccount</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Direction</InputLabel>
                        <Select
                            value={direction}
                            label="Direction"
                            onChange={(e) => setDirection(e.target.value)}
                        >
                            <MenuItem value="Main to Sub">Main to Sub</MenuItem>
                            <MenuItem value="Sub to Main">Sub to Main</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Account Type</InputLabel>
                        <Select
                            value={accountType}
                            label="Account Type"
                            onChange={(e) => setAccountType(e.target.value)}
                        >
                            <MenuItem value="Spot">Spot</MenuItem>
                            <MenuItem value="Futures">Futures</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sub Account Type</InputLabel>
                        <Select
                            value={subAccountType}
                            label="Sub Account Type"
                            onChange={(e) => setSubAccountType(e.target.value)}
                        >
                            <MenuItem value="spot">spot</MenuItem>
                            <MenuItem value="futures">futures</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Coin/Asset</InputLabel>
                        <Select
                            value={coinAsset}
                            label="Coin/Asset"
                            onChange={(e) => setCoinAsset(e.target.value)}
                        >
                            <MenuItem value="">Select Coin/Asset</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Amount"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Enter amount"
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                    variant="contained" 
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    INITIATE TRANSFER
                </Button>
            </Box>
        </CardContent>
    </Card>
);
};

export default TransferSection;
