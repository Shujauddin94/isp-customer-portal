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
import EditIcon from '@mui/icons-material/Edit';
import { api, Customer, Payment, Package, Subscription } from '../../lib/api';
import { format } from 'date-fns';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [addSubDialogOpen, setAddSubDialogOpen] = useState(false);
    const [packages, setPackages] = useState<Package[]>([]);
    const [selectedPkgId, setSelectedPkgId] = useState('');
    const [selectedCycle, setSelectedCycle] = useState('monthly');

    // Phase 2 State
    const [editSubDialogOpen, setEditSubDialogOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
    const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        loadCustomers();
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
        return { label: 'Active', color: 'success' as const };
    };

    const getTotalDue = (customer: Customer): number => {
        if (!customer.subscriptions) return 0;
        return customer.subscriptions
            .flatMap(sub => sub.payments || [])
            .filter(p => p.status !== 'paid')
            .reduce((sum, p) => sum + Number(p.pendingAmount || 0), 0);
    };

    const getPaymentIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircleIcon color="success" />;
            case 'partially_paid':
                return <PendingIcon color="info" />;
            case 'pending':
                return <PendingIcon color="warning" />;
            case 'overdue':
                return <ErrorIcon color="error" />;
            default:
                return <PendingIcon />;
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedPayment || !paymentAmount || isNaN(Number(paymentAmount))) return;

        try {
            await api.recordPayment(selectedPayment.id, Number(paymentAmount));
            setRecordPaymentDialogOpen(false);
            setPaymentAmount('');
            loadCustomers();
            if (selectedCustomer) {
                const updated = await api.getCustomers();
                const updatedCustomer = updated.data.find(c => c.id === selectedCustomer.id);
                if (updatedCustomer) setSelectedCustomer(updatedCustomer);
            }
        } catch (error) {
            console.error('Error recording payment:', error);
        }
    };

    const handleOpenPaymentDialog = (payment: Payment) => {
        setSelectedPayment(payment);
        setPaymentAmount(payment.pendingAmount.toString());
        setRecordPaymentDialogOpen(true);
    };

    const handleOpenEditSubDialog = (sub: Subscription) => {
        setSelectedSub(sub);
        setSelectedPkgId(sub.packageId);
        setSelectedCycle(sub.paymentCycle);
        setEditSubDialogOpen(true);
    };

    const handleEditSubscription = async () => {
        if (!selectedSub) return;
        try {
            await api.updateSubscription(selectedSub.id, {
                packageId: selectedPkgId,
                paymentCycle: selectedCycle as any
            });
            setEditSubDialogOpen(false);
            loadCustomers();
            if (selectedCustomer) {
                const updated = await api.getCustomers();
                const updatedCustomer = updated.data.find(c => c.id === selectedCustomer.id);
                if (updatedCustomer) setSelectedCustomer(updatedCustomer);
            }
        } catch (error) {
            console.error('Error editing subscription:', error);
        }
    };

    const handleDeleteSubscription = async (subId: string) => {
        if (!confirm('Are you sure you want to delete this subscription?')) return;
        try {
            await api.deleteSubscription(subId);
            loadCustomers();
            if (selectedCustomer) {
                const updated = await api.getCustomers();
                const updatedCustomer = updated.data.find(c => c.id === selectedCustomer.id);
                if (updatedCustomer) setSelectedCustomer(updatedCustomer);
            }
        } catch (error) {
            console.error('Error deleting subscription:', error);
        }
    };

    const handleAddSubscription = async () => {
        if (!selectedCustomer || !selectedPkgId) return;
        try {
            await api.createSubscription({
                customerId: selectedCustomer.id,
                packageId: selectedPkgId,
                paymentCycle: selectedCycle
            });
            setAddSubDialogOpen(false);
            loadCustomers();
            const updated = await api.getCustomers();
            const updatedCustomer = updated.data.find(c => c.id === selectedCustomer.id);
            if (updatedCustomer) setSelectedCustomer(updatedCustomer);
        } catch (error) {
            console.error('Error adding subscription:', error);
        }
    };

    const handleUpdateSubscriptionStatus = async (subId: string, status: string) => {
        try {
            await api.updateSubscription(subId, { status: status as any });
            loadCustomers();
            if (selectedCustomer) {
                const updated = await api.getCustomers();
                const updatedCustomer = updated.data.find(c => c.id === selectedCustomer.id);
                if (updatedCustomer) setSelectedCustomer(updatedCustomer);
            }
        } catch (error) {
            console.error('Error updating status:', error);
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
                                                            ? format(new Date(customer.subscriptions[0].nextDueDate), 'MMM dd, HH:mm:ss')
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Subscriptions ({selectedCustomer.subscriptions?.length || 0})
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setAddSubDialogOpen(true)}
                                >
                                    Add New Subscription
                                </Button>
                            </Box>

                            {selectedCustomer.subscriptions?.map((subscription) => (
                                <Card key={subscription.id} sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6">
                                                {subscription.package?.name} - {subscription.package?.speed}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <TextField
                                                    select
                                                    size="small"
                                                    value={subscription.status}
                                                    onChange={(e) => handleUpdateSubscriptionStatus(subscription.id, e.target.value)}
                                                    SelectProps={{ native: true }}
                                                    sx={{ width: 120 }}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="suspended">Suspended</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </TextField>
                                                <Chip label={subscription.status} color={subscription.status === 'active' ? 'success' : 'default'} size="small" />
                                            </Box>
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
                                                    {format(new Date(subscription.nextDueDate), 'MMM dd, yyyy HH:mm:ss')}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditSubDialog(subscription)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDeleteSubscription(subscription.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>

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
                                                                    onClick={() => handleOpenPaymentDialog(payment)}
                                                                >
                                                                    Pay
                                                                </Button>
                                                            )
                                                        }
                                                    >
                                                        <Box sx={{ mr: 2 }}>{getPaymentIcon(payment.status)}</Box>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 4 }}>
                                                                    <Typography variant="body2" fontWeight="bold">
                                                                        Total Due: ${Number(Number(payment.totalAmount) + Number(payment.penaltyAmount || 0)).toFixed(2)}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Status: {payment.status.replace('_', ' ')}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box component="div">
                                                                    <Typography variant="caption" display="block">
                                                                        Base: ${Number(payment.totalAmount).toFixed(2)} |
                                                                        Penalty: ${Number(payment.penaltyAmount).toFixed(2)} |
                                                                        Paid: ${Number(payment.paidAmount).toFixed(2)} |
                                                                        Pending: ${Number(payment.pendingAmount).toFixed(2)}
                                                                    </Typography>
                                                                    <Typography variant="caption" display="block">
                                                                        Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy HH:mm:ss')}
                                                                        {payment.paidAt && (
                                                                            <> | Last Payment: {format(new Date(payment.paidAt), 'MMM dd, yyyy HH:mm:ss')}</>
                                                                        )}
                                                                    </Typography>
                                                                </Box>
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

            {/* Add Subscription Dialog */}
            <Dialog
                open={addSubDialogOpen}
                onClose={() => setAddSubDialogOpen(false)}
            >
                <DialogTitle>Add New Subscription</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                        <TextField
                            select
                            label="Select Package"
                            fullWidth
                            value={selectedPkgId}
                            onChange={(e) => setSelectedPkgId(e.target.value)}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            <option value="">-- Select a Package --</option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} (${pkg.monthlyPrice}/mo)
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Payment Cycle"
                            fullWidth
                            value={selectedCycle}
                            onChange={(e) => setSelectedCycle(e.target.value)}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="three_months">3 Months</option>
                            <option value="yearly">Yearly</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddSubDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddSubscription}
                        variant="contained"
                        disabled={!selectedPkgId}
                    >
                        Add Subscription
                    </Button>
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

            {/* Edit Subscription Dialog */}
            <Dialog
                open={editSubDialogOpen}
                onClose={() => setEditSubDialogOpen(false)}
            >
                <DialogTitle>Edit Subscription</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                        <TextField
                            select
                            label="Package"
                            fullWidth
                            value={selectedPkgId}
                            onChange={(e) => setSelectedPkgId(e.target.value)}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} (${pkg.monthlyPrice}/mo)
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Payment Cycle"
                            fullWidth
                            value={selectedCycle}
                            onChange={(e) => setSelectedCycle(e.target.value)}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="three_months">3 Months</option>
                            <option value="yearly">Yearly</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditSubDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSubscription} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog
                open={recordPaymentDialogOpen}
                onClose={() => setRecordPaymentDialogOpen(false)}
            >
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent>
                    {selectedPayment && (
                        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Base Amount</Typography>
                                            <Typography variant="body2">${Number(selectedPayment.totalAmount).toFixed(2)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" sx={{ color: 'error.main' }}>Penalty</Typography>
                                            <Typography variant="body2" sx={{ color: 'error.main' }}>+${Number(selectedPayment.penaltyAmount).toFixed(2)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Already Paid</Typography>
                                            <Typography variant="body2">-${Number(selectedPayment.paidAmount).toFixed(2)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>Total Pending</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                ${Number(selectedPayment.pendingAmount).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            <TextField
                                label="Amount to Pay"
                                fullWidth
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                helperText={`Remaining after this: $${Math.max(0, Number(selectedPayment.pendingAmount) - Number(paymentAmount)).toFixed(2)}`}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecordPaymentDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleRecordPayment}
                        variant="contained"
                        color="success"
                        disabled={!paymentAmount || Number(paymentAmount) <= 0}
                    >
                        Record Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
