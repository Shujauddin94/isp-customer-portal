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
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import { api, Customer, Payment } from '../../lib/api';
import { format } from 'date-fns';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await api.getCustomers();
            setCustomers(response.data);
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return;

        try {
            await api.deleteCustomer(customerToDelete.id);
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
            loadCustomers();
        } catch (error: any) {
            console.error('Error deleting customer:', error);
            const message = error.response?.data?.message || 'Error deleting customer';
            alert(message);
        }
    };

    const handleView = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDialogOpen(true);
    };

    const handleMarkAsPaid = async (paymentId: string) => {
        try {
            await api.markPaymentAsPaid(paymentId);
            loadCustomers();
            if (selectedCustomer) {
                const updated = await api.getCustomers();
                const updatedCustomer = updated.data.find(c => c.id === selectedCustomer.id);
                if (updatedCustomer) setSelectedCustomer(updatedCustomer);
            }
        } catch (error) {
            console.error('Error marking payment as paid:', error);
        }
    };

    const getCustomerStatus = (customer: Customer) => {
        if (!customer.subscriptions || customer.subscriptions.length === 0) {
            return { label: 'No Subscription', color: 'default' as const };
        }

        const hasOverdue = customer.subscriptions.some(sub =>
            sub.payments?.some(p => p.status === 'overdue')
        );
        const hasPending = customer.subscriptions.some(sub =>
            sub.payments?.some(p => p.status === 'pending')
        );

        if (hasOverdue) return { label: 'Overdue', color: 'error' as const };
        if (hasPending) return { label: 'Pending', color: 'warning' as const };
        return { label: 'All Paid', color: 'success' as const };
    };

    const getTotalDue = (customer: Customer): number => {
        if (!customer.subscriptions) return 0;
        return customer.subscriptions
            .flatMap(sub => sub.payments || [])
            .filter(p => p.status === 'pending' || p.status === 'overdue')
            .reduce((sum, p) => sum + Number(p.amount), 0);
    };

    const getPaymentIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircleIcon color="success" />;
            case 'pending':
                return <PendingIcon color="warning" />;
            case 'overdue':
                return <ErrorIcon color="error" />;
            default:
                return <PendingIcon />;
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobileNumber.includes(searchTerm)
    );

    return (
        <Box sx={{ p: 3 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">Customer Management</Typography>
                        <Chip label={`${customers.length} Total Customers`} color="primary" />
                    </Box>

                    <TextField
                        fullWidth
                        placeholder="Search by name, email, or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Mobile</TableCell>
                                    <TableCell align="center">Subscriptions</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Next Payment</TableCell>
                                    <TableCell align="right">Amount Due</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="text.secondary">
                                                {searchTerm ? 'No customers found' : 'No customers yet'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCustomers.map((customer) => {
                                        const status = getCustomerStatus(customer);
                                        const totalDue = getTotalDue(customer);

                                        return (
                                            <TableRow key={customer.id} hover>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body1">{customer.fullName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {customer.email}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{customer.mobileNumber}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={customer.subscriptions?.length || 0}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={status.label} color={status.color} size="small" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2">
                                                        {customer.subscriptions?.[0]?.nextDueDate
                                                            ? format(new Date(customer.subscriptions[0].nextDueDate), 'MMM dd, HH:mm')
                                                            : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        color={totalDue > 0 ? 'error.main' : 'success.main'}
                                                    >
                                                        ${Number(totalDue).toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleView(customer)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(customer)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Customer Details Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Customer Details</DialogTitle>
                <DialogContent>
                    {selectedCustomer && (
                        <Box>
                            {/* Customer Info */}
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Full Name
                                            </Typography>
                                            <Typography>{selectedCustomer.fullName}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                CNIC/Passport
                                            </Typography>
                                            <Typography>{selectedCustomer.cnicPassport}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Mobile
                                            </Typography>
                                            <Typography>{selectedCustomer.mobileNumber}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography>{selectedCustomer.email}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Subscriptions */}
                            <Typography variant="h6" gutterBottom>
                                Subscriptions ({selectedCustomer.subscriptions?.length || 0})
                            </Typography>

                            {selectedCustomer.subscriptions?.map((subscription) => (
                                <Card key={subscription.id} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6">
                                                {subscription.package?.name} - {subscription.package?.speed}
                                            </Typography>
                                            <Chip label={subscription.status} color="primary" size="small" />
                                        </Box>

                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid item xs={4}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Payment Cycle
                                                </Typography>
                                                <Typography>
                                                    {subscription.paymentCycle === 'three_months' ? '3 Months' : subscription.paymentCycle}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Price
                                                </Typography>
                                                <Typography>${Number(subscription.price).toFixed(2)}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Next Due
                                                </Typography>
                                                <Typography>
                                                    {format(new Date(subscription.nextDueDate), 'MMM dd, yyyy HH:mm')}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" gutterBottom>
                                            Payment History
                                        </Typography>

                                        {subscription.payments && subscription.payments.length > 0 ? (
                                            <List dense>
                                                {subscription.payments.map((payment) => (
                                                    <ListItem
                                                        key={payment.id}
                                                        sx={{
                                                            border: 1,
                                                            borderColor: 'divider',
                                                            borderRadius: 1,
                                                            mb: 1,
                                                        }}
                                                        secondaryAction={
                                                            payment.status !== 'paid' && (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    onClick={() => handleMarkAsPaid(payment.id)}
                                                                >
                                                                    Mark Paid
                                                                </Button>
                                                            )
                                                        }
                                                    >
                                                        <Box sx={{ mr: 2 }}>{getPaymentIcon(payment.status)}</Box>
                                                        <ListItemText
                                                            primary={`$${Number(payment.amount).toFixed(2)} - ${payment.status}`}
                                                            secondary={
                                                                <>
                                                                    Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy HH:mm')}
                                                                    {payment.paidDate && (
                                                                        <> | Paid: {format(new Date(payment.paidDate), 'MMM dd, yyyy HH:mm')}</>
                                                                    )}
                                                                </>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No payment history
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{customerToDelete?.fullName}</strong>?
                        This will also remove all associated subscriptions and payments.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
