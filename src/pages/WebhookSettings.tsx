import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { LogOut, Plus, User, Webhook, Settings, ArrowLeft, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DEFAULT_MESSAGE_TEMPLATES } from '../services/webhook/types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AddWebhookDialog } from '../components/AddWebhookDialog';
import { WebhookPayloadDialog } from '../components/WebhookPayloadDialog';
import { 
  fetchWebhookSettings, 
  createWebhookSetting, 
  updateWebhookSetting, 
  deleteWebhookSetting,
  updateWebhookPayloadConfig,
  updateGlobalWebhookConfig,
  getGlobalWebhookConfig
} from '../services/supabase/webhook';
import type { WebhookSetting, WebhookPayloadConfig } from '../types';

export default function WebhookSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookSetting | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGlobalConfig, setShowGlobalConfig] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [globalConfig, setGlobalConfig] = useState<WebhookPayloadConfig | null>(null);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  async function loadData() {
    try {
      setIsLoading(true);
      const [webhooksData, globalConfigData] = await Promise.all([
        fetchWebhookSettings(),
        getGlobalWebhookConfig()
      ]);
      setWebhooks(webhooksData);
      setGlobalConfig(globalConfigData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadWebhooks() {
    try {
      setIsLoading(true);
      const data = await fetchWebhookSettings();
      setWebhooks(data);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddWebhook(clientId: string, webhookUrl: string) {
    try {
      await createWebhookSetting(clientId, webhookUrl);
      await loadWebhooks();
      setShowAddWebhook(false);
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  }

  async function handleToggleWebhook(webhook: WebhookSetting) {
    try {
      await updateWebhookSetting(webhook.id, { is_active: !webhook.is_active });
      await loadWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  }

  async function handleDeleteWebhook() {
    if (!selectedWebhook) return;
    try {
      await deleteWebhookSetting(selectedWebhook.id);
      await loadWebhooks();
      setShowDeleteConfirm(false);
      setSelectedWebhook(null);
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  }

  async function handleGlobalConfigUpdate(config: WebhookPayloadConfig) {
    try {
      await updateGlobalWebhookConfig(config);
      await loadData(); // Reload all data to ensure consistency
      setGlobalConfig(config);
      setShowGlobalConfig(false);
    } catch (error) {
      console.error('Error updating global webhook config:', error);
      throw error;
    }
  }

  async function handleWebhookConfigUpdate(config: WebhookPayloadConfig) {
    if (!selectedWebhook) return;
    try {
      await updateWebhookPayloadConfig(selectedWebhook.id, config, selectedWebhook.webhook_url);
      await loadData(); // Reload all data to ensure consistency
      setShowWebhookConfig(false);
      setSelectedWebhook(null);
    } catch (error) {
      console.error('Error updating webhook config:', error);
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-semibold">Webhook Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
              <button
                onClick={() => signOut()}
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Webhook className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Client Webhooks</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowGlobalConfig(true)}
              className="btn-secondary flex items-center"
            >
              <Globe className="h-5 w-5 mr-2" />
              Global Webhook
            </button>
            <button
              onClick={() => setShowAddWebhook(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Webhook
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner size="lg" className="my-12" />
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Webhook URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhooks.map((webhook) => (
                    <tr key={webhook.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {webhook.client?.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {webhook.client?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {webhook.webhook_url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          webhook.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(webhook.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-3">
                        <button
                          onClick={() => {
                            setSelectedWebhook(webhook);
                            setShowWebhookConfig(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Configure
                        </button>
                        <button
                          onClick={() => handleToggleWebhook(webhook)}
                          className={`mr-3 ${
                            webhook.is_active
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {webhook.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWebhook(webhook);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <AddWebhookDialog
        isOpen={showAddWebhook}
        onClose={() => setShowAddWebhook(false)}
        onSubmit={handleAddWebhook}
      />

      <WebhookPayloadDialog
        isOpen={showGlobalConfig}
        onClose={() => setShowGlobalConfig(false)}
        onSubmit={handleGlobalConfigUpdate}
        initialConfig={globalConfig || undefined}
        isGlobal={true}
      />

      <WebhookPayloadDialog
        isOpen={showWebhookConfig}
        onClose={() => {
          setShowWebhookConfig(false);
          setSelectedWebhook(null);
        }}
        onSubmit={handleWebhookConfigUpdate}
        initialConfig={selectedWebhook?.payload_config || DEFAULT_MESSAGE_TEMPLATES}
        webhookUrl={selectedWebhook?.webhook_url}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Webhook"
        message={`Are you sure you want to delete the webhook for ${selectedWebhook?.client?.client_name}? This action cannot be undone.`}
        onConfirm={handleDeleteWebhook}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedWebhook(null);
        }}
      />
    </div>
  );
}