'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
} from '@mui/material';
import { api, Package } from '../../lib/api';

interface PaymentPlanProps {
    packageIds: string[];
    paymentCycle: string;
    onNext: (cycle: string) => void;
    onBack: () => void;
}

export default function PaymentPlan({
    packageIds,
    paymentCycle: initialCycle,
    onNext,
    onBack,
}: PaymentPlanProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [cycle, setCycle] = useState(initialCycle);

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

    const calculateTotal = (cycle: string) => {
        return packages.reduce((sum, pkg) => {
            const mPrice = Number(pkg.monthlyPrice);
            const tPrice = Number(pkg.threeMonthsPrice);
            const yPrice = Number(pkg.yearlyPrice);

            if (cycle === 'monthly') return sum + mPrice;
            if (cycle === 'three_months') return sum + tPrice;
            if (cycle === 'yearly') return sum + yPrice;
            return sum;
        }, 0);
    };

    const calculateSavings = (cycle: string) => {
        const monthlyTotal = calculateTotal('monthly');
        const cycleTotal = calculateTotal(cycle);
        const months = cycle === 'three_months' ? 3 : cycle === 'yearly' ? 12 : 1;
        const savings = monthlyTotal * months - cycleTotal;
        return savings > 0 ? savings : 0;
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Select Payment Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Choose your preferred billing cycle
            </Typography>

            <RadioGroup value={cycle} onChange={(e) => setCycle(e.target.value)}>
                <Grid container spacing={3}>
                    {/* Monthly */}
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                border: 2,
                                borderColor: cycle === 'monthly' ? 'primary.main' : 'transparent',
                                cursor: 'pointer',
                            }}
                            onClick={() => setCycle('monthly')}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel
                                            value="monthly"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="h6">Monthly</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pay every month
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Box>
                                    <Typography variant="h4" color="primary">
                                        ${calculateTotal('monthly').toFixed(2)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 3 Months */}
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                border: 2,
                                borderColor: cycle === 'three_months' ? 'primary.main' : 'transparent',
                                cursor: 'pointer',
                            }}
                            onClick={() => setCycle('three_months')}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel
                                            value="three_months"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="h6">3 Months</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pay every 3 months
                                                    </Typography>
                                                    {calculateSavings('three_months') > 0 && (
                                                        <Typography variant="caption" color="success.main">
                                                            Save ${calculateSavings('three_months').toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </Box>
                                    <Typography variant="h4" color="primary">
                                        ${calculateTotal('three_months').toFixed(2)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Yearly */}
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                border: 2,
                                borderColor: cycle === 'yearly' ? 'primary.main' : 'transparent',
                                cursor: 'pointer',
                            }}
                            onClick={() => setCycle('yearly')}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel
                                            value="yearly"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="h6">Yearly</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pay annually
                                                    </Typography>
                                                    {calculateSavings('yearly') > 0 && (
                                                        <Typography variant="caption" color="success.main">
                                                            Save ${calculateSavings('yearly').toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </Box>
                                    <Typography variant="h4" color="primary">
                                        ${calculateTotal('yearly').toFixed(2)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </RadioGroup>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button variant="outlined" onClick={onBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={() => onNext(cycle)}>
                    Continue
                </Button>
            </Box>
        </Box>
    );
}
