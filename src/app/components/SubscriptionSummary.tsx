'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { api, Package } from '../../lib/api';

interface SubscriptionSummaryProps {
    customer: any;
    packageIds: string[];
    paymentCycle: string;
    onConfirm: () => void;
    onBack: () => void;
}

export default function SubscriptionSummary({
    customer,
    packageIds,
    paymentCycle,
    onConfirm,
    onBack,
}: SubscriptionSummaryProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const response = await api.getPackages();
            const filtered = response.data.filter((pkg) =>
                packageIds.includes(pkg.id)
            );
            setPackages(filtered);
        } catch (error) {
            console.error('Error loading packages:', error);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            // Create subscriptions for each package
            for (const packageId of packageIds) {
                await api.createSubscription({
                    customerId: customer.id,
                    packageId,
                    paymentCycle,
                });
            }
            onConfirm();
        } catch (error) {
            console.error('Error creating subscriptions:', error);
            alert('Error creating subscriptions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPrice = (pkg: Package) => {
        if (paymentCycle === 'monthly') return Number(pkg.monthlyPrice);
        if (paymentCycle === 'three_months') return Number(pkg.threeMonthsPrice);
        if (paymentCycle === 'yearly') return Number(pkg.yearlyPrice);
        return 0;
    };

    const totalAmount = packages.reduce((sum, pkg) => sum + getPrice(pkg), 0);

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Subscription Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Review and confirm your subscription
            </Typography>

            <Grid container spacing={3}>
                {/* Customer Info */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Customer Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List dense>
                                <ListItem>
                                    <ListItemText
                                        primary="Name"
                                        secondary={customer.fullName}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Email"
                                        secondary={customer.email}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Mobile"
                                        secondary={customer.mobileNumber}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="CNIC/Passport"
                                        secondary={customer.cnicPassport}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Package Info */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Selected Packages
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List dense>
                                {packages.map((pkg) => (
                                    <ListItem key={pkg.id}>
                                        <ListItemText
                                            primary={`${pkg.name} - ${pkg.speed}`}
                                            secondary={`$${getPrice(pkg).toFixed(2)} / ${paymentCycle === 'three_months'
                                                ? '3 months'
                                                : paymentCycle
                                                }`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment Summary */}
                <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">
                                    Total Amount ({paymentCycle === 'three_months' ? '3 Months' : paymentCycle})
                                </Typography>
                                <Typography variant="h3">
                                    ${totalAmount.toFixed(2)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button variant="outlined" onClick={onBack} disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleConfirm}
                    disabled={loading}
                    startIcon={
                        loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <CheckCircleOutlineIcon />
                        )
                    }
                >
                    {loading ? 'Creating...' : 'Confirm Subscription'}
                </Button>
            </Box>
        </Box>
    );
}
