import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AddProviderDialog } from '../components/AddProviderDialog';
import { fetchProviders, createProvider, updateProviderStatus } from '../services/supabase/provider';
import type { BMProvider } from '../types';

export default function ProviderManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<BMProvider[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Redirect if not employee or admin
  useEffect(() => {
    if (user?.role !== 'employee' && user?.role !== 'super_admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      setIsLoading(true);
      const data = await fetchProviders();
      setProviders(data);
    } catch (error) {
      setError('Failed to load providers');
      console.error('Error loading providers:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddProvider(name: string) {
    try {
      await createProvider(name);
      await loadProviders();
    } catch (error) {
      throw error;
    }
  }

  async function handleStatusChange(id: string, status: 'active' | 'inactive') {
    try {
      await updateProviderStatus(id, status);
      await loadProviders();
    } catch (error) {
      console.error('Error updating provider status:', error);
      setError('Failed to update provider status');
    }
  }

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-semibold">Provider Management</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold">BM Providers</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => loadProviders()}
                className="btn-secondary flex items-center"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh List
              </button>
              <button
                onClick={() => setShowAddDialog(true)}
                className="btn-primary flex items-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Add Provider
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search providers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {provider.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        provider.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {provider.created_by_profile?.nickname || provider.created_by_profile?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(provider.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleStatusChange(
                          provider.id,
                          provider.status === 'active' ? 'inactive' : 'active'
                        )}
                        className={`${
                          provider.status === 'active'
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {provider.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProviders.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No providers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AddProviderDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddProvider}
      />
    </div>
  );
}