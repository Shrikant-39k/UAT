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
    Paper,
    Chip,
    Divider,
} from '@mui/material';
import {
    AccountBalance,
    SwapHoriz,
    History,
    Assessment,
    GetApp,
} from '@mui/icons-material';

const BalanceSection = () => {
    const [mainAccount, setMainAccount] = useState('');
    const [accountType, setAccountType] = useState('Spot');
    const [subAccount, setSubAccount] = useState('');
    const [subAccountType, setSubAccountType] = useState('Spot');

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>Balances</Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Account Balances */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Main Account Balances
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                                <InputLabel>Main Account</InputLabel>
                                <Select
                                    value={mainAccount}
                                    label="Main Account"
                                    onChange={(e) => setMainAccount(e.target.value)}
                                >
                                    <MenuItem value="">Select Account</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
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
                            <FormControl size="small" sx={{ minWidth: 120, maxWidth: '20%', flex: 1 }}>
                                <Button
                                    variant="contained"
                                >
                                    GET BALANCE
                                </Button>
                            </FormControl>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>ASSET</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>AVAILABLE</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>USDT VALUE</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>TOTAL</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>TOTAL USDT VALUE</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                                            No balances found
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* Subaccount Balances */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Subaccount Balances
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 120, maxWidth: '25%', flex: 1 }}>
                                <InputLabel>Main Account</InputLabel>
                                <Select
                                    value={mainAccount}
                                    label="Main Account"
                                    onChange={(e) => setMainAccount(e.target.value)}
                                >
                                    <MenuItem value="">Select Account</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120, maxWidth: '25%', flex: 1 }}>
                                <InputLabel>Subaccounts</InputLabel>
                                <Select
                                    value={subAccount}
                                    label="Subaccounts"
                                    onChange={(e) => setSubAccount(e.target.value)}
                                >
                                    <MenuItem value="">Select Subaccount</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120, maxWidth: '25%', flex: 1 }}>
                                <InputLabel>Subaccount Type</InputLabel>
                                <Select
                                    value={subAccountType}
                                    label="Subaccount Type"
                                    onChange={(e) => setSubAccountType(e.target.value)}
                                >
                                    <MenuItem value="Spot">Spot</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 120, maxWidth: '20%', flex: 1 }}>
                                <Button
                                    variant="contained"
                                >
                                    GET BALANCE
                                </Button>
                            </FormControl>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>ASSET</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>AVAILABLE</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>USDT VALUE</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>TOTAL</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>TOTAL USDT VALUE</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                                            No balances found
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

export default BalanceSection;
