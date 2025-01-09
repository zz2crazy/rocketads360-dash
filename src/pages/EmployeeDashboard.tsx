import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { OrderFilters } from '../components/OrderFilters';
import { LogOut, RefreshCw, UserPlus, User, Webhook, UserCog, Users } from 'lucide-react';
import { signOut } from '../services/supabase/auth';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '../services/supabase/client';
import { createEmployee } from '../services/supabase/employee';
import { fetchOrders, updateOrderStatus, fetchOrderStats, verifyPassword } from '../services/supabase/orders';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderStatistics } from '../components/OrderStatistics';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';
import { PasswordConfirmDialog } from '../components/PasswordConfirmDialog';
import { AddClientDialog } from '../components/AddClientDialog';
import { AddEmployeeDialog } from '../components/AddEmployeeDialog';
import { NameSpecDialog } from '../components/NameSpecDialog';
import type { Order, TimezoneStats } from '../types';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [nameSpecDialog, setNameSpecDialog] = useState({
    isOpen: false,
    specification: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalAccountsProvided: 0,
    timezoneStats: [] as TimezoneStats[]
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    orderId: '',
    newStatus: '' as Order['status'],
    currentStatus: '' as Order['status']
  });
  const [passwordDialog, setPasswordDialog] = useState({
    isOpen: false,
    orderId: '',
    newStatus: '' as Order['status'],
    currentStatus: '' as Order['status']
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, dateRange, selectedClient, selectedStatus]);

  function filterOrders() {
    let filtered = [...orders];

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    // Apply client filter
    if (selectedClient) {
      filtered = filtered.filter(order => 
        order.client_name === selectedClient
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(order => 
        order.status === selectedStatus
      );
    }

    setFilteredOrders(filtered);
  }

  async function loadOrders() {
    try {
      setIsLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setFilteredOrders(data);
      const orderStats = await fetchOrderStats(data);
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: Order['status'], currentStatus: Order['status']) {
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      setPasswordDialog({
        isOpen: true,
        orderId,
        newStatus,
        currentStatus
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        orderId,
        newStatus,
        currentStatus
      });
    }
  }

  async function handleStatusConfirm() {
    try {
      await updateOrderStatus(confirmDialog.orderId, confirmDialog.newStatus);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  }

  async function handlePasswordConfirm(password: string) {
    try {
      await verifyPassword(password);
      await updateOrderStatus(passwordDialog.orderId, passwordDialog.newStatus);
      await loadOrders();
      setPasswordDialog(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      throw error;
    }
  }

  async function handleAddClient(email: string, password: string, clientName: string) {
    await createClient(email, password, clientName);
  }

  async function handleAddEmployee(email: string, password: string, nickname: string) {
    await createEmployee(email, password, nickname);
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Calculate paginated orders
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, selectedClient, selectedStatus]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-semibold">Employee Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
              {user?.role === 'super_admin' && (
                <button
                  onClick={() => navigate('/user-management')}
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </button>
              )}
              {user?.role === 'super_admin' && (
                <button
                  onClick={() => navigate('/webhook-settings')}
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <Webhook className="h-5 w-5 mr-2" />
                  Webhook Settings
                </button>
              )}
              {user?.role === 'super_admin' && (
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <UserCog className="h-5 w-5 mr-2" />
                  Add Employee
                </button>
              )}
              <button
                onClick={() => setShowAddClient(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add Client
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingSpinner size="lg" className="my-12" />
        ) : (
          <>
            <OrderStatistics
              totalOrders={stats.total}
              pendingOrders={stats.pending}
              processingOrders={stats.processing}
              completedOrders={stats.completed}
              cancelledOrders={stats.cancelled}
              totalAccountsProvided={stats.totalAccountsProvided}
              timezoneStats={stats.timezoneStats}
            />
            
            <OrderFilters
              dateRange={dateRange}
              selectedClient={selectedClient}
              selectedStatus={selectedStatus}
              onDateRangeChange={setDateRange}
              onClientChange={setSelectedClient}
              onStatusChange={setSelectedStatus}
              clients={[...new Set(orders.map(order => order.client_name))]}
            />

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Count
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timezone
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name Spec
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {order.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {order.account_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {order.timezone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {order.account_name_spec ? (
                          <button
                            onClick={() => setNameSpecDialog({
                              isOpen: true,
                              specification: order.account_name_spec || ''
                            })}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'], order.status)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          disabled={order.status === 'cancelled' || order.status === 'completed'}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredOrders.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        )}
      </main>

      <AddClientDialog
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        onSubmit={handleAddClient}
      />

      <AddEmployeeDialog
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
        onSubmit={handleAddEmployee}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to change the order status from ${confirmDialog.currentStatus} to ${confirmDialog.newStatus}?`}
        onConfirm={handleStatusConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      <PasswordConfirmDialog
        isOpen={passwordDialog.isOpen}
        title="Password Required"
        message={`Please enter your password to change the order status from ${passwordDialog.currentStatus} to ${passwordDialog.newStatus}.`}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setPasswordDialog(prev => ({ ...prev, isOpen: false }))}
      />
      
      <NameSpecDialog
        isOpen={nameSpecDialog.isOpen}
        onClose={() => setNameSpecDialog(prev => ({ ...prev, isOpen: false }))}
        specification={nameSpecDialog.specification}
      />
    </div>
  );
}