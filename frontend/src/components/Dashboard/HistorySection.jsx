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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    History,
} from '@mui/icons-material';

const HistorySection = () => {
    const [withdrawalAccount, setWithdrawalAccount] = useState('');
    const [withdrawalAccountType, setWithdrawalAccountType] = useState('Spot');
    const [depositAccount, setDepositAccount] = useState('');
    const [depositAccountType, setDepositAccountType] = useState('Spot');

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <History sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>History</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Withdrawal History */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Withdrawal History
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
                                <InputLabel>Main Account</InputLabel>
                                <Select
                                    value={withdrawalAccount}
                                    label="Main Account"
                                    onChange={(e) => setWithdrawalAccount(e.target.value)}
                                >
                                    <MenuItem value="">Select Account</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                                <InputLabel>Account Type</InputLabel>
                                <Select
                                    value={withdrawalAccountType}
                                    label="Account Type"
                                    onChange={(e) => setWithdrawalAccountType(e.target.value)}
                                >
                                    <MenuItem value="Spot">Spot</MenuItem>
                                    <MenuItem value="Futures">Futures</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ 
                                    px: 3,
                                    py: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    borderRadius: 1,
                                    minWidth: 120
                                }}
                            >
                                GET BALANCE
                            </Button>
                        </Box>

                        <TableContainer sx={{ border: '1px solid #dee2e6', borderRadius: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>TRANSACTION ID</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>COIN/ASSET</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>AMOUNT</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>STATUS</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>TRANSACTION FEE</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>TRANSACTION DATE</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                                            No withdrawal history
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* Deposit History */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Deposit History
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
                                <InputLabel>Account</InputLabel>
                                <Select
                                    value={depositAccount}
                                    label="Account"
                                    onChange={(e) => setDepositAccount(e.target.value)}
                                >
                                    <MenuItem value="">Select Account</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                                <InputLabel>Account Type</InputLabel>
                                <Select
                                    value={depositAccountType}
                                    label="Account Type"
                                    onChange={(e) => setDepositAccountType(e.target.value)}
                                >
                                    <MenuItem value="Spot">Spot</MenuItem>
                                    <MenuItem value="Futures">Futures</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ 
                                    px: 3,
                                    py: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    borderRadius: 1,
                                    minWidth: 120
                                }}
                            >
                                GET BALANCE
                            </Button>
                        </Box>

                        <TableContainer sx={{ border: '1px solid #dee2e6', borderRadius: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>TRANSACTION ID</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>COIN/ASSET</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>AMOUNT</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>STATUS</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>TRANSACTION FEE</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', color: '#6c757d' }}>TRANSACTION DATE</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                                            No deposit history
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default HistorySection;
