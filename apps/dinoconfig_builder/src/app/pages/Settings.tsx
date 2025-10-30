import React, { useState, useEffect } from 'react';
import './Settings.scss';
import axios from 'axios';
import { environment } from '../../environments';
import { useFeatures } from '../hooks/useFeatures';
import { Feature } from '../types/features';
import { FeatureBadge } from '../components';
import { subscriptionService } from '../services/subscription.service';

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

export default function Settings() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general', 'builder', 'export', 'sdk', 'features']));
  const [apiKeys, setApiKeys] = useState<ApiKeyList | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<{ key: string; name: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { subscription, hasFeature, loading: featuresLoading } = useFeatures();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

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
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your application preferences and configurations</p>
          </div>
        </div>

        <div className="main-content">
          <div className="settings-container">
            <div className="settings-content">
              
              <div className="settings-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('general')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('general') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">⚙️</span> */}
                  <span className="section-title">General Settings</span>
                </button>
                
                {expandedSections.has('general') && (
                <div className="settings-grid">
                  <div className="setting-item">
                    <label className="setting-label">Theme</label>
                    <select className="setting-control">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  
                  <div className="setting-item">
                    <label className="setting-label">Language</label>
                    <select className="setting-control">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  
                  <div className="setting-item">
                    <label className="setting-label">Notifications</label>
                    <div className="setting-control">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Email notifications
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Browser notifications
                      </label>
                    </div>
                  </div>
                </div>
                )}
              </div>

              <div className="settings-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('builder')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('builder') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">🔧</span> */}
                  <span className="section-title">Builder Settings</span>
                </button>
                
                {expandedSections.has('builder') && (
                <div className="settings-grid">
                  <div className="setting-item">
                    <label className="setting-label">Auto-save</label>
                    <div className="setting-control">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Enable auto-save
                      </label>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <label className="setting-label">Auto-save interval</label>
                    <select className="setting-control">
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                    </select>
                  </div>
                  
                  <div className="setting-item">
                    <label className="setting-label">Default field type</label>
                    <select className="setting-control">
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                </div>
                )}
              </div>

              <div className="settings-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('export')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('export') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">📤</span> */}
                  <span className="section-title">Export Settings</span>
                </button>
                
                {expandedSections.has('export') && (
                <div className="settings-grid">
                  <div className="setting-item">
                    <label className="setting-label">Default export format</label>
                    <select className="setting-control">
                      <option value="json">JSON</option>
                      <option value="yaml">YAML</option>
                      <option value="xml">XML</option>
                    </select>
                  </div>
                  
                  <div className="setting-item">
                    <label className="setting-label">Include metadata</label>
                    <div className="setting-control">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Include schema metadata
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" />
                        Include UI schema
                      </label>
                    </div>
                  </div>
                </div>
                )}
              </div>

              <div className="settings-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('features')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('features') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="section-title">Features & Subscription</span>
                </button>
                
                {expandedSections.has('features') && (
                <div className="settings-grid">
                  <div className="setting-item features-section">
                    {featuresLoading ? (
                      <div className="features-loading">Loading features...</div>
                    ) : subscription ? (
                      <>
                        <div className="subscription-info">
                          <div className="subscription-tier">
                            <span className="tier-label">Current Plan:</span>
                            <span className={`tier-badge tier-${subscription.tier}`}>
                              {subscriptionService.getTierDisplayName(subscription.tier)}
                            </span>
                            {subscription.status !== 'active' && subscription.status !== 'trialing' && (
                              <span className="status-warning">({subscription.status})</span>
                            )}
                          </div>
                          <div className="subscription-limits">
                            <div className="limit-item">
                              <span className="limit-label">Brands:</span>
                              <span className="limit-value">
                                {subscription.limits.maxBrands === -1 ? 'Unlimited' : subscription.limits.maxBrands}
                              </span>
                            </div>
                            <div className="limit-item">
                              <span className="limit-label">Configs per Brand:</span>
                              <span className="limit-value">
                                {subscription.limits.maxConfigsPerBrand === -1 ? 'Unlimited' : subscription.limits.maxConfigsPerBrand}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="features-list">
                          <h4>Available Features</h4>
                          <div className="features-grid">
                            {Object.values(Feature).map((feature) => {
                              const isEnabled = hasFeature(feature);
                              const description = subscriptionService.getFeatureDescription(feature);
                              
                              // Determine which tier this feature belongs to
                              let featureTier: 'free' | 'starter' | 'pro' | 'custom' = 'free';
                              if (feature === Feature.BASIC_CONFIGS || feature === Feature.BASIC_SDK) {
                                featureTier = 'free';
                              } else if ([Feature.MULTIPLE_BRANDS, Feature.MULTIPLE_CONFIGS,].includes(feature)) {
                                featureTier = 'starter';
                              } else if ([Feature.UNLIMITED_BRANDS, Feature.UNLIMITED_CONFIGS, Feature.CONFIG_ROLLBACK, Feature.ADVANCED_SDK, Feature.API_RATE_LIMIT_INCREASED, Feature.ADVANCED_TARGETING, Feature.USER_SEGMENTATION, Feature.AB_TESTING, Feature.ADVANCED_ANALYTICS, Feature.AUDIT_LOGS, Feature.TEAM_COLLABORATION, Feature.PRIORITY_SUPPORT].includes(feature)) {
                                featureTier = 'pro';
                              } else {
                                featureTier = 'custom';
                              }

                              return (
                                <div 
                                  key={feature} 
                                  className={`feature-item ${isEnabled ? 'enabled' : 'disabled'}`}
                                  title={description}
                                >
                                  <div className="feature-status">
                                    {isEnabled ? (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="icon-enabled">
                                        <circle cx="10" cy="10" r="9" fill="#10b981" stroke="#059669" strokeWidth="2"/>
                                        <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    ) : (
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="icon-disabled">
                                        <circle cx="10" cy="10" r="9" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2"/>
                                        <path d="M7 10L13 10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="feature-info">
                                    <div className="feature-name">{description}</div>
                                    {!isEnabled && <FeatureBadge tier={featureTier} size="small" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {subscription.tier !== 'custom' && (
                          <div className="upgrade-prompt">
                            <h4>Want more features?</h4>
                            <p>Upgrade your plan to unlock additional capabilities for your configurations.</p>
                            <a href="/subscription" className="btn btn-primary">
                              View Plans & Upgrade
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="features-error">
                        <p>Unable to load subscription features.</p>
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>

              <div className="settings-section">
                <button 
                  className="section-toggle"
                  onClick={() => toggleSection('sdk')}
                >
                  <svg 
                    className={`chevron ${expandedSections.has('sdk') ? 'open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* <span className="section-icon">🔧</span> */}
                  <span className="section-title">SDK & API Keys</span>
                </button>
                
                {expandedSections.has('sdk') && (
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
                )}
              </div>

              <div className="settings-actions">
                <button className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save Settings
                </button>
                <button className="btn btn-outline">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.333 2.667v10.666M13.333 2.667L10 6m3.333-3.333L16.667 6M2.667 13.333V2.667M2.667 13.333L6 10m-3.333 3.333L-1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
