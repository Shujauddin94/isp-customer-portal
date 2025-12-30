'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    Typography,
    Checkbox,
    Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api, Package } from '../../lib/api';

interface PackageSelectionProps {
    selectedPackages: string[];
    onNext: (packages: string[]) => void;
    onBack: () => void;
}

export default function PackageSelection({
    selectedPackages: initialSelected,
    onNext,
    onBack,
}: PackageSelectionProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [selected, setSelected] = useState<string[]>(initialSelected);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const response = await api.getPackages();
            setPackages(response.data);
        } catch (error) {
            console.error('Error loading packages:', error);
        }
    };

    const handleToggle = (packageId: string) => {
        setSelected((prev) =>
            prev.includes(packageId)
                ? prev.filter((id) => id !== packageId)
                : [...prev, packageId]
        );
    };

    const handleNext = () => {
        if (selected.length > 0) {
            onNext(selected);
        } else {
            alert('Please select at least one package');
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Select WiFi Packages
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Choose one or more packages for your customer
            </Typography>

            <Grid container spacing={3}>
                {packages.map((pkg) => (
                    <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                        <Card
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                border: 2,
                                borderColor: selected.includes(pkg.id)
                                    ? 'primary.main'
                                    : 'transparent',
                                position: 'relative',
                                '&:hover': {
                                    boxShadow: 6,
                                },
                            }}
                            onClick={() => handleToggle(pkg.id)}
                        >
                            {pkg.isPopular && (
                                <Chip
                                    label="Popular"
                                    color="secondary"
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                    }}
                                />
                            )}

                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">{pkg.name}</Typography>
                                    <Checkbox
                                        checked={selected.includes(pkg.id)}
                                        color="primary"
                                    />
                                </Box>

                                <Typography variant="h4" color="primary" gutterBottom>
                                    ${pkg.monthlyPrice}
                                    <Typography variant="caption" color="text.secondary">
                                        /month
                                    </Typography>
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {pkg.speed}
                                </Typography>

                                <Box sx={{ mt: 2 }}>
                                    {pkg.features.map((feature, index) => (
                                        <Box
                                            key={index}
                                            sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                                        >
                                            <CheckCircleIcon
                                                sx={{ fontSize: 16, mr: 1, color: 'success.main' }}
                                            />
                                            <Typography variant="body2">{feature}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button variant="outlined" onClick={onBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                    Continue ({selected.length} selected)
                </Button>
            </Box>
        </Box>
    );
}
