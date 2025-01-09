import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, ArrowLeft, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updatePassword, updateNickname } from '../services/supabase/profile';
import { PasswordConfirmDialog } from '../components/PasswordConfirmDialog';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) {
    return null;
  }

  async function handlePasswordChange(currentPassword: string) {
    try {
      await updatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
      setShowPasswordDialog(false);
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      throw err; // Re-throw to let PasswordConfirmDialog handle the error
    }
  }

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowPasswordDialog(true);
  }

  async function handleUpdateNickname(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUpdating(true);

    try {
      const updatedProfile = await updateNickname(nickname);
      await updateUserProfile(updatedProfile);
      setSuccess('Nickname updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update nickname');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium text-gray-900">{user.email}</p>
                </div>
                {user.role !== 'customer' && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-lg font-medium text-gray-900 capitalize">{user.role}</p>
                  </div>
                )}
                {user.role === 'employee' && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Nickname</p>
                    <form onSubmit={handleUpdateNickname} className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={2}
                        disabled={isUpdating}
                      />
                      <button
                        type="submit"
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={isUpdating || nickname === user.nickname}
                      >
                        <UserRound className="h-4 w-4 mr-1" />
                        Update
                      </button>
                    </form>
                  </div>
                )}
                {user.role === 'super_admin' && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Nickname</p>
                    <form onSubmit={handleUpdateNickname} className="mt-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={2}
                        disabled={isUpdating}
                      />
                      <button
                        type="submit"
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={isUpdating || nickname === user.nickname}
                      >
                        <UserRound className="h-4 w-4 mr-1" />
                        Update
                      </button>
                    </form>
                  </div>
                )}
                {user.client_name && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Client Name</p>
                    <p className="text-lg font-medium text-gray-900">{user.client_name}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
              <form onSubmit={handleUpdatePassword} className="max-w-md">
                {error && (
                  <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={!newPassword}
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <PasswordConfirmDialog
        isOpen={showPasswordDialog}
        title="Confirm Password Change"
        message="Please enter your current password to confirm the change."
        onConfirm={handlePasswordChange}
        onCancel={() => setShowPasswordDialog(false)}
      />
    </div>
  );
}