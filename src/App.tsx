import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import WebhookSettings from './pages/WebhookSettings';
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
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;