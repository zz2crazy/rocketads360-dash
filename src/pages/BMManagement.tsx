import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AddBMDialog } from '../components/AddBMDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { fetchBusinessManagers, addBusinessManager, syncBusinessManager, removeBusinessManager } from '../services/supabase/bm';
import type { BusinessManager, BMProvider } from '../types';

export default function BMManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{
    isOpen: boolean;
    bm: BusinessManager | null;
  }>({
    isOpen: false,
    bm: null
  });

  // Redirect if not employee or admin
  useEffect(() => {
    if (user?.role !== 'employee' && user?.role !== 'super_admin') {
      navigate('/');
      return;
    }
    // Load BMs when component mounts
    loadBusinessManagers();
  }, [user, navigate]);

  async function loadBusinessManagers() {
    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors
      const data = await fetchBusinessManagers();
      setBusinessManagers(data);
    } catch (error) {
      setError('Failed to load business managers');
      console.error('Error loading BMs:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddBM(provider: BMProvider, bmId: string) {
    try {
      await addBusinessManager(provider, bmId);
      await loadBusinessManagers(); // Reload the list after adding
    } catch (error) {
      throw error;
    }
  }

  async function handleSync(id: string) {
    try {
      setSyncingIds(prev => new Set(prev).add(id));
      const updated = await syncBusinessManager(id);
      setBusinessManagers(prev => 
        prev.map(bm => bm.id === id ? updated : bm)
      );
    } catch (error) {
      console.error('Error syncing BM:', error);
      setError('Failed to sync business manager');
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleRemove() {
    if (!confirmRemove.bm || isRemoving) return;

    try {
      setIsRemoving(true);
      setError('');
      await removeBusinessManager(confirmRemove.bm.id);
      setBusinessManagers(prev => prev.filter(bm => bm.id !== confirmRemove.bm?.id));
    } catch (error) {
      console.error('Error removing BM:', error);
      setError('Failed to remove business manager');
    } finally {
      setIsRemoving(false);
      setConfirmRemove({ isOpen: false, bm: null });
    }
  }

  const filteredBMs = businessManagers.filter(bm =>
    bm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bm.bm_id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-semibold">BM Management</h1>
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
              <h2 className="text-xl font-semibold">Business Manager Accounts</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => loadBusinessManagers()}
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
                Add BM Account
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search BM accounts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BM ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Sync
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBMs.map((bm) => (
                    <tr key={bm.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bm.bm_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bm.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bm.provider?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bm.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : bm.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bm.status.charAt(0).toUpperCase() + bm.status.slice(1)}
                        </span>
                        {bm.error_message && (
                          <p className="mt-1 text-xs text-red-600">{bm.error_message}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bm.last_sync).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleSync(bm.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          disabled={syncingIds.has(bm.id)}
                        >
                          {syncingIds.has(bm.id) ? (
                            <span className="flex items-center">
                              <LoadingSpinner size="sm" className="mr-1" />
                              Syncing...
                            </span>
                          ) : (
                            'Sync'
                          )}
                        </button>
                        <button 
                          onClick={() => setConfirmRemove({ isOpen: true, bm })}
                          className="text-red-600 hover:text-red-900"
                          disabled={isRemoving}
                        >
                          {isRemoving && confirmRemove.bm?.id === bm.id ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBMs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No business managers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AddBMDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddBM}
      />

      <ConfirmDialog
        isOpen={confirmRemove.isOpen}
        title="Remove Business Manager"
        message={
          confirmRemove.bm
            ? `Are you sure you want to remove the business manager "${confirmRemove.bm.name}" (${confirmRemove.bm.bm_id})? This action cannot be undone.`
            : ''
        }
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove({ isOpen: false, bm: null })}
      />
    </div>
  );
}