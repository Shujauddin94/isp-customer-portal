'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    InputAdornment,
    Switch,
    FormControlLabel,
    useTheme,
    useMediaQuery,
    CircularProgress,
    CardHeader,
    CardActions,
    Chip,
    Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api, Package } from '../../lib/api';

export default function PackageManager() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState<Partial<Package> | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            setLoading(true);
            const response = await api.getPackages();
            setPackages(response.data);
        } catch (error) {
            console.error('Error loading packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (pkg: Package | null = null) => {
        setSelectedPkg(pkg || {
            name: '',
            speed: '',
            monthlyPrice: 0,
            threeMonthsPrice: 0,
            yearlyPrice: 0,
            features: [],
            isPopular: false
        });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!selectedPkg) return;
        try {
            if (selectedPkg.id) {
                await api.updatePackage(selectedPkg.id, selectedPkg);
            } else {
                await api.createPackage(selectedPkg);
            }
            setOpen(false);
            loadPackages();
        } catch (error) {
            console.error('Error saving package:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        try {
            await api.deletePackage(id);
            loadPackages();
        } catch (error) {
            console.error('Error deleting package:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Package Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add New Package
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : isMobile ? (
                <Grid container spacing={2}>
                    {packages.map((pkg) => (
                        <Grid item xs={12} key={pkg.id}>
                            <Card>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6">{pkg.name}</Typography>
                                            {pkg.isPopular && <Chip label="Popular" color="success" size="small" icon={<CheckCircleIcon />} />}
                                        </Box>
                                    }
                                    subheader={`Speed: ${pkg.speed}`}
                                />
                                <CardContent>
                                    <Grid container spacing={1}>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color="text.secondary">Monthly</Typography>
                                            <Typography variant="body2" fontWeight="bold">${pkg.monthlyPrice}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color="text.secondary">3 Months</Typography>
                                            <Typography variant="body2" fontWeight="bold">${pkg.threeMonthsPrice}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color="text.secondary">Yearly</Typography>
                                            <Typography variant="body2" fontWeight="bold">${pkg.yearlyPrice}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                    <IconButton size="small" color="primary" onClick={() => handleOpen(pkg)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(pkg.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <TableContainer component={Card}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Plan Name</TableCell>
                                <TableCell>Speed</TableCell>
                                <TableCell align="right">Monthly</TableCell>
                                <TableCell align="right">3 Months</TableCell>
                                <TableCell align="right">Yearly</TableCell>
                                <TableCell align="center">Popular</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {packages.map((pkg) => (
                                <TableRow key={pkg.id}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{pkg.name}</TableCell>
                                    <TableCell>{pkg.speed}</TableCell>
                                    <TableCell align="right">${pkg.monthlyPrice}</TableCell>
                                    <TableCell align="right">${pkg.threeMonthsPrice}</TableCell>
                                    <TableCell align="right">${pkg.yearlyPrice}</TableCell>
                                    <TableCell align="center">
                                        {pkg.isPopular ? '✅' : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="primary" onClick={() => handleOpen(pkg)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(pkg.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedPkg?.id ? 'Edit Package' : 'Add New Package'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Package Name"
                                fullWidth
                                value={selectedPkg?.name || ''}
                                onChange={(e) => setSelectedPkg({ ...selectedPkg, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Speed (e.g., 50Mbps)"
                                fullWidth
                                value={selectedPkg?.speed || ''}
                                onChange={(e) => setSelectedPkg({ ...selectedPkg, speed: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="Monthly"
                                type="number"
                                fullWidth
                                value={selectedPkg?.monthlyPrice || 0}
                                onChange={(e) => setSelectedPkg({ ...selectedPkg, monthlyPrice: Number(e.target.value) })}
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="3 Months"
                                type="number"
                                fullWidth
                                value={selectedPkg?.threeMonthsPrice || 0}
                                onChange={(e) => setSelectedPkg({ ...selectedPkg, threeMonthsPrice: Number(e.target.value) })}
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="Yearly"
                                type="number"
                                fullWidth
                                value={selectedPkg?.yearlyPrice || 0}
                                onChange={(e) => setSelectedPkg({ ...selectedPkg, yearlyPrice: Number(e.target.value) })}
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={selectedPkg?.isPopular || false}
                                        onChange={(e) => setSelectedPkg({ ...selectedPkg, isPopular: e.target.checked })}
                                    />
                                }
                                label="Mark as Popular"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
