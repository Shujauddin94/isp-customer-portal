'use client';
import { useState } from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import MenuIcon from '@mui/icons-material/Menu';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CustomerForm from './components/CustomerForm';
import PackageSelection from './components/PackageSelection';
import PaymentPlan from './components/PaymentPlan';
import SubscriptionSummary from './components/SubscriptionSummary';
import CustomerManagement from './components/CustomerManagement';
import PackageManager from './components/PackageManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [paymentCycle, setPaymentCycle] = useState<string>('monthly');
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      handleReset();
    }
  };

  const handleMobileNavClick = (index: number) => {
    setActiveTab(index);
    setMobileOpen(false);
    if (index === 0) {
      handleReset();
    }
  };

  const handleCustomerSubmit = (customer: any) => {
    setCurrentCustomer(customer);
    setCurrentStep(1);
  };

  const handlePackageSelection = (packages: string[]) => {
    setSelectedPackages(packages);
    setCurrentStep(2);
  };

  const handlePaymentPlanSelect = (cycle: string) => {
    setPaymentCycle(cycle);
    setCurrentStep(3);
  };

  const handleConfirmSubscription = () => {
    setActiveTab(1);
    setRefreshKey((prev) => prev + 1);
    handleReset();
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCurrentCustomer(null);
    setSelectedPackages([]);
    setPaymentCycle('monthly');
  };

  const getPageTitle = () => {
    if (activeTab === 0) return 'New Subscription';
    if (activeTab === 1) return 'Customer Management';
    if (activeTab === 2) return 'Package Management';
    return 'SwiftConnect WiFi';
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        SwiftConnect
      </Typography>
      <List>
        {[
          { text: 'New Subscription', icon: <PersonAddIcon /> },
          { text: 'Customer Management', icon: <PeopleIcon /> },
          { text: 'Package Management', icon: <SettingsIcon /> },
        ].map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleMobileNavClick(index)} selected={activeTab === index}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <WifiIcon sx={{ mr: 2, fontSize: 32, display: { xs: 'none', sm: 'block' } }} />
          <Box>
            <Typography variant="h6" component="div">
              {isMobile ? getPageTitle() : 'SwiftConnect WiFi'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: { xs: 'none', sm: 'block' } }}>
              WiFi Services Management System
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ borderBottom: 1, borderColor: 'divider', display: { xs: 'none', sm: 'flex' } }}
          >
            <Tab icon={<PersonAddIcon />} label="New Subscription" />
            <Tab icon={<PeopleIcon />} label="Customer Management" />
            <Tab icon={<SettingsIcon />} label="Package Management" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            {currentStep === 0 && (
              <CustomerForm onSubmit={handleCustomerSubmit} />
            )}
            {currentStep === 1 && (
              <PackageSelection
                selectedPackages={selectedPackages}
                onNext={handlePackageSelection}
                onBack={() => setCurrentStep(0)}
              />
            )}
            {currentStep === 2 && (
              <PaymentPlan
                packageIds={selectedPackages}
                paymentCycle={paymentCycle}
                onNext={handlePaymentPlanSelect}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && currentCustomer && (
              <SubscriptionSummary
                customer={currentCustomer}
                packageIds={selectedPackages}
                paymentCycle={paymentCycle}
                onConfirm={handleConfirmSubscription}
                onBack={() => setCurrentStep(2)}
              />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <CustomerManagement key={refreshKey} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <PackageManager />
          </TabPanel>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © 2025 SwiftConnect WiFi Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
