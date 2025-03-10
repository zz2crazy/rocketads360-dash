import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, RefreshCw, Search, Shield } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export default function AccountManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not employee or admin
  React.useEffect(() => {
    if (user?.role !== 'employee' && user?.role !== 'super_admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-semibold">Account Management</h1>
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold">Ad Accounts</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-secondary flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh List
              </button>
              <button className="btn-primary flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Add Ad Account
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ad accounts..."
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
                    Account ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BM Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Sample row - replace with actual data */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    987654321
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Sample Ad Account
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    BM-123456789
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2024-01-08
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}