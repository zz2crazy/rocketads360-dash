import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { LogOut, Plus, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCustomerOrders, createOrder } from '../services/supabase/orders';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { CustomerOrderFilters } from '../components/CustomerOrderFilters';
import { Pagination } from '../components/Pagination';
import { NewOrderDialog } from '../components/NewOrderDialog';
import { NameSpecDialog } from '../components/NameSpecDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Order } from '../types';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [nameSpecDialog, setNameSpecDialog] = useState({
    isOpen: false,
    specification: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, dateRange, selectedStatus]);

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

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(order => 
        order.status === selectedStatus
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }

  async function loadOrders() {
    try {
      setIsLoading(true);
      const data = await fetchCustomerOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateOrder(accountCount: number, timezone: string, accountNameSpec?: string) {
    await createOrder(accountCount, timezone, accountNameSpec);
    await loadOrders();
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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-semibold">Customer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
              <button
                onClick={() => setShowNewOrder(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Order
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
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
                <p className="text-sm text-gray-600 mt-1">Contact our support team on Telegram</p>
              </div>
              <a
                href="https://t.me/JohnnyMAq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[#0088cc] text-white rounded-md hover:bg-[#0077b5] transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.411-.168.56-.314 1.045-.434 1.449-.119.404-.209.707-.269.91-.159.547-.296.652-.433.662-.369.029-1.204-.873-1.204-.873l-2.41-1.559-.03-.02c.008-.006 2.159-1.373 2.209-1.406.299-.199 0-.299-.329-.1L8.98 15.824l-2.02-.62c-.296-.094-.402-.296-.1-.5.101-.069 4.631-1.777 7.471-2.89.601-.238 2.561-.995 2.561-.995s.911-.362.831.342z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>

          <CustomerOrderFilters
            dateRange={dateRange}
            selectedStatus={selectedStatus}
            onDateRangeChange={setDateRange}
            onStatusChange={setSelectedStatus}
          />

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
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

      <NewOrderDialog
        isOpen={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        onSubmit={handleCreateOrder}
      />
      
      <NameSpecDialog
        isOpen={nameSpecDialog.isOpen}
        onClose={() => setNameSpecDialog(prev => ({ ...prev, isOpen: false }))}
        specification={nameSpecDialog.specification}
      />
    </div>
  );
}