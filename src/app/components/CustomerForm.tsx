'use client';
import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    Typography,
} from '@mui/material';
import { api } from '../../lib/api';

interface CustomerFormProps {
    onSubmit: (customer: any) => void;
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        cnicPassport: '',
        mobileNumber: '',
        email: '',
        address: '',
        homeAddress: '',
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.cnicPassport.trim())
            newErrors.cnicPassport = 'CNIC/Passport is required';
        if (!formData.mobileNumber.trim())
            newErrors.mobileNumber = 'Mobile number is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.homeAddress.trim())
            newErrors.homeAddress = 'Home address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await api.createCustomer(formData);
                onSubmit(response.data);
            } catch (error) {
                console.error('Error creating customer:', error);
                alert('Error creating customer. Please try again.');
            }
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Customer Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Enter customer details to create a new subscription
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    error={!!errors.fullName}
                                    helperText={errors.fullName}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="CNIC / Passport Number"
                                    value={formData.cnicPassport}
                                    onChange={(e) => handleChange('cnicPassport', e.target.value)}
                                    error={!!errors.cnicPassport}
                                    helperText={errors.cnicPassport}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Mobile Number"
                                    value={formData.mobileNumber}
                                    onChange={(e) => handleChange('mobileNumber', e.target.value)}
                                    error={!!errors.mobileNumber}
                                    helperText={errors.mobileNumber}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    error={!!errors.address}
                                    helperText={errors.address}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Home Address"
                                    value={formData.homeAddress}
                                    onChange={(e) => handleChange('homeAddress', e.target.value)}
                                    error={!!errors.homeAddress}
                                    helperText={errors.homeAddress}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        sx={{ px: 4 }}
                                    >
                                        Continue to Packages
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
