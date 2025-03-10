import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import WebhookSettings from './pages/WebhookSettings';
import BMManagement from './pages/BMManagement';
import AccountManagement from './pages/AccountManagement';
import ProviderManagement from './pages/ProviderManagement';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/customer/*" element={<CustomerDashboard />} />
          <Route path="/employee/*" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/webhook-settings" element={<WebhookSettings />} />
          <Route path="/bm-management" element={<BMManagement />} />
          <Route path="/account-management" element={<AccountManagement />} />
          <Route path="/provider-management" element={<ProviderManagement />} />
          <Route path="/auth/facebook/callback" element={<AuthCallback />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;