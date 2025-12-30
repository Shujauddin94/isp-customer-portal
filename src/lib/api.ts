import axios from 'axios';

const API_URL = 'http://localhost:4000';

export interface Customer {
    id: string;
    fullName: string;
    cnicPassport: string;
    mobileNumber: string;
    email: string;
    address: string;
    homeAddress: string;
    isActive: boolean;
    createdAt: string;
    subscriptions?: Subscription[];
}

export interface Package {
    id: string;
    name: string;
    speed: string;
    monthlyPrice: number;
    threeMonthsPrice: number;
    yearlyPrice: number;
    features: string[];
    isPopular: boolean;
}

export interface Subscription {
    id: string;
    customerId: string;
    packageId: string;
    paymentCycle: 'monthly' | 'three_months' | 'yearly';
    status: 'active' | 'suspended' | 'cancelled';
    price: number;
    startDate: string;
    nextDueDate: string;
    package?: Package;
    payments?: Payment[];
}

export interface Payment {
    id: string;
    subscriptionId: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'failed';
    dueDate: string;
    paidDate: string | null;
    transactionId: string | null;
}

export const api = {
    // Customers
    getCustomers: () => axios.get<Customer[]>(`${API_URL}/customers`),
    createCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'subscriptions'>) =>
        axios.post<Customer>(`${API_URL}/customers`, data),
    deleteCustomer: (id: string) => axios.delete(`${API_URL}/customers/${id}`),

    // Packages
    getPackages: () => axios.get<Package[]>(`${API_URL}/packages`),

    // Subscriptions
    createSubscription: (data: {
        customerId: string;
        packageId: string;
        paymentCycle: string;
    }) => axios.post<Subscription>(`${API_URL}/subscriptions`, data),

    // Payments
    markPaymentAsPaid: (id: string) =>
        axios.patch<Payment>(`${API_URL}/payments/${id}/mark-paid`),
};
