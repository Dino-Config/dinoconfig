import React, { useEffect, useState } from 'react';
import './Settings.scss';
import axios from 'axios';
import { environment } from '../../environments';

interface ApiKey {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiKeyList {
  keys: ApiKey[];
  total: number;
  active: number;
}

export default function SdkApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeyList | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<{ key: string; name: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get(`${environment.apiUrl}/api-keys`, { withCredentials: true });
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      showNotification('error', 'Please enter a name for the API key.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${environment.apiUrl}/api-keys`,
        { name: newKeyName, description: newKeyDescription },
        { withCredentials: true }
      );
      setGeneratedApiKey({ key: response.data.key, name: response.data.name });
      setNewKeyName('');
      setNewKeyDescription('');
      setShowCreateForm(false);
      await fetchApiKeys();
      showNotification('success', 'API key created successfully! Make sure to copy it - you won\'t be able to see it again.');
    } catch (error: any) {
      console.error('Failed to create API key:', error);
      const message = error.response?.data?.message || 'Failed to create API key. Please try again.';
      showNotification('error', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeApiKey = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to revoke "${name}"? This action cannot be undone and will break any applications using this key.`)) {
      return;
    }
    try {
      await axios.post(`${environment.apiUrl}/api-keys/${id}/revoke`, {}, { withCredentials: true });
      await fetchApiKeys();
      showNotification('success', 'API key revoked successfully.');
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      showNotification('error', 'Failed to revoke API key. Please try again.');
    }
  };

  const deleteApiKey = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`${environment.apiUrl}/api-keys/${id}`, { withCredentials: true });
      await fetchApiKeys();
      showNotification('success', 'API key deleted successfully.');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      showNotification('error', 'Failed to delete API key. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('success', 'API key copied to clipboard!');
    }).catch((error) => {
      console.error('Failed to copy:', error);
      showNotification('error', 'Failed to copy to clipboard.');
    });
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return (
    <div className="settings-page">
      <div className="main-layout">
        <div className="settings-header">
          <div className="header-content">
            <h1 className="page-title">SDK & API Keys</h1>
            <p className="page-subtitle">Manage SDK authentication keys for your apps</p>
          </div>
        </div>

        <div className="main-content">
          <div className="settings-container">
            <div className="settings-content">
              <div className="settings-section">
                <div className="settings-grid">
                  <div className="setting-item api-key-section">
                    <label className="setting-label">API Keys</label>
                    <p className="setting-description">
                      Manage API keys to authenticate with the DinoConfig SDK. You can create multiple keys 
                      for different applications or environments.
                    </p>

                    {notification && (
                      <div className={`notification notification-${notification.type}`}>
                        {notification.message}
                      </div>
                    )}

                    {generatedApiKey && (
                      <div className="api-key-display">
                        <h4>New API Key: {generatedApiKey.name}</h4>
                        <div className="api-key-value">
                          <code>{generatedApiKey.key}</code>
                          <button 
                            className="btn btn-icon" 
                            onClick={() => copyToClipboard(generatedApiKey.key)}
                            title="Copy to clipboard"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M13.333 6h-6c-.736 0-1.333.597-1.333 1.333v6c0 .737.597 1.334 1.333 1.334h6c.737 0 1.334-.597 1.334-1.334v-6c0-.736-.597-1.333-1.334-1.333z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3.333 10H2.667C2.313 10 2 9.687 2 9.333V2.667C2 2.313 2.313 2 2.667 2h6.666c.354 0 .667.313.667.667V3.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                        <p className="api-key-warning">
                          ⚠️ Make sure to copy your API key now. You won't be able to see it again!
                        </p>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => setGeneratedApiKey(null)}
                        >
                          Close
                        </button>
                      </div>
                    )}

                    {apiKeys && (
                      <div className="api-keys-section">
                        {apiKeys.keys.length > 0 && (
                          <div className="api-keys-header">
                            <h4>Your API Keys ({apiKeys.active} active / {apiKeys.total} total)</h4>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => setShowCreateForm(!showCreateForm)}
                            >
                              + Create New Key
                            </button>
                          </div>
                        )}

                        {showCreateForm && (
                          <div className="api-key-create-form">
                            <div className="form-field">
                              <label>Key Name *</label>
                              <input 
                                type="text" 
                                placeholder="e.g., Production App"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                maxLength={100}
                              />
                            </div>
                            <div className="form-field">
                              <label>Description (optional)</label>
                              <input 
                                type="text" 
                                placeholder="What is this key for?"
                                value={newKeyDescription}
                                onChange={(e) => setNewKeyDescription(e.target.value)}
                                maxLength={500}
                              />
                            </div>
                            <div className="form-actions">
                              <button 
                                className="btn btn-primary" 
                                onClick={createApiKey}
                                disabled={isGenerating}
                              >
                                {isGenerating ? 'Creating...' : 'Create Key'}
                              </button>
                              <button 
                                className="btn btn-outline" 
                                onClick={() => {
                                  setShowCreateForm(false);
                                  setNewKeyName('');
                                  setNewKeyDescription('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {apiKeys.keys.length > 0 && apiKeys.keys.map((key) => (
                          <div key={key.id} className={`api-key-item ${!key.isActive ? 'inactive' : ''}`}>
                            <div className="api-key-item-header">
                              <div className="api-key-item-title">
                                <h5>{key.name}</h5>
                                {key.isActive ? (
                                  <span className="status-badge status-active">Active</span>
                                ) : (
                                  <span className="status-badge status-inactive">Inactive</span>
                                )}
                              </div>
                              <div className="api-key-item-actions">
                                {key.isActive && (
                                  <button 
                                    className="btn btn-sm btn-danger" 
                                    onClick={() => revokeApiKey(key.id, key.name)}
                                  >
                                    Revoke
                                  </button>
                                )}
                                <button 
                                  className="btn btn-sm btn-outline" 
                                  onClick={() => deleteApiKey(key.id, key.name)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {key.description && (
                              <p className="api-key-item-description">{key.description}</p>
                            )}
                            <div className="api-key-item-meta">
                              <span><strong>Created:</strong> {new Date(key.createdAt).toLocaleString()}</span>
                              {key.lastUsedAt ? (
                                <span><strong>Last used:</strong> {new Date(key.lastUsedAt).toLocaleString()}</span>
                              ) : (
                                <span><strong>Last used:</strong> Never</span>
                              )}
                            </div>
                          </div>
                        ))}

                        {apiKeys.keys.length === 0 && !showCreateForm && (
                          <div className="api-key-empty">
                            <p>You don't have any API keys yet.</p>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => setShowCreateForm(true)}
                            >
                              Create Your First API Key
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="api-key-docs">
                      <h4>Usage Example</h4>
                      <pre><code>{`import { dinoconfigApi } from '@dinoconfig/js-sdk';

const dinoconfig = dinoconfigApi({
  apiKey: 'your-api-key-here',
  baseUrl: '${environment.apiUrl}',
});

// Ready to use! Token exchange happens automatically
const configs = await dinoconfig.configs.getAllConfigs(brandId);`}</code></pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


