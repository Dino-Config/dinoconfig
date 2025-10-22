import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JSONSchema7 } from "json-schema";
import { BrandHeader, ConfigSidebar, ConfigBuilderPanel, NotificationSystem, Spinner, VersionSelector } from "../components";
import { SubscriptionLimitWarning } from "../components/subscription-limit-warning";
import { ConfigService } from "../services/configService";
import { subscriptionService, SubscriptionStatus } from "../services/subscription.service";
import { Config, Brand, Notification, ConfirmDialog, PromptDialog } from "../types";
import axios from "../auth/axios-interceptor";
import "./MultiConfigBuilder.scss";

export default function MultiConfigBuilder() {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId?: string }>();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [activeVersions, setActiveVersions] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState<string>('');

  // Notification system
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });
  const [promptDialog, setPromptDialog] = useState<PromptDialog>({
    isOpen: false,
    title: '',
    message: '',
    defaultValue: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // current editing schema/ui/formData loaded from selected config
  const [schema, setSchema] = useState<JSONSchema7>({ type: "object", properties: {}, required: [] });
  const [uiSchema, setUiSchema] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Notification helpers
  const showNotification = (type: Notification['type'], message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, type, message, duration };
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showConfirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const showPrompt = (title: string, message: string, defaultValue = ''): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptDialog({
        isOpen: true,
        title,
        message,
        defaultValue,
        onConfirm: (value: string) => {
          setPromptDialog(prev => ({ ...prev, isOpen: false }));
          resolve(value);
        },
        onCancel: () => {
          setPromptDialog(prev => ({ ...prev, isOpen: false }));
          resolve(null);
        }
      });
    });
  };

  // Load subscription status
  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscription(status);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  // load configs and brand info initially
  useEffect(() => {
    if (brandId) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastBrandId', String(brandId));
        }
      } catch (_) {}
      loadBrandAndConfigs(parseInt(brandId));
    } else {
      // Try restore from last used brand
      let lastBrandId: string | null = null;
      try {
        if (typeof window !== 'undefined') {
          lastBrandId = localStorage.getItem('lastBrandId');
        }
      } catch (_) {}
      if (lastBrandId) {
        navigate(`/builder/${lastBrandId}`);
      } else {
        navigate('/');
      }
    }
  }, [brandId]);

  const loadBrandAndConfigs = async (brandId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const brandData = await ConfigService.getBrand(brandId);
      setBrand(brandData);

      const configsData = await ConfigService.getConfigs(brandId);
      setConfigs(configsData);

      // Since the backend now returns only active versions, we can set the active versions directly
      const activeVersionsData: Record<string, number> = {};
      for (const config of configsData) {
        activeVersionsData[config.name] = config.version;
      }
      setActiveVersions(activeVersionsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load brand and configs');
    } finally {
      setIsLoading(false);
    }
  };

  // when selectedId changes, load its schema/ui/formData
  useEffect(() => {
    if (!selectedId) {
      // reset to empty
      setSchema({ type: "object", properties: {}, required: [] });
      setUiSchema({});
      setFormData({});
      setSelectedVersion(null);
      return;
    }
    
    // If a specific version is selected, load that version
    if (selectedVersion) {
      loadConfigVersion(selectedId, selectedVersion);
    } else {
      // Load the latest version by default
      const cfg = configs.find(c => c.id === selectedId);
      if (cfg) {
        loadConfigData(cfg);
        setSelectedVersion(cfg.version);
      }
    }
  }, [selectedId, configs, selectedVersion]);

  const loadConfigVersion = async (configId: number, version: number) => {
    try {
      if (!brandId) return;
      
      const versions = await ConfigService.getConfigVersions(parseInt(brandId), configId);
      const versionConfig = versions.find(v => v.version === version);
      
      if (versionConfig) {
        loadConfigData(versionConfig);
      }
    } catch (error: any) {
      showNotification('error', 'Failed to load config version');
      console.error('Error loading config version:', error);
    }
  };

  const loadConfigData = (cfg: Config) => {
    // Prefer stored schema/uiSchema/formData if present
    const effectiveSchema = (cfg.schema as any) ?? { type: "object", properties: {}, required: [] };
    const effectiveUiSchema = (cfg.uiSchema as any) ?? {};
    const effectiveFormData = cfg.formData ?? {};

    // If no schema provided but formData exists, infer simple string-based schema
    if (!cfg.schema && effectiveFormData && Object.keys(effectiveFormData).length > 0) {
      const properties: Record<string, any> = {};
      Object.keys(effectiveFormData).forEach(key => {
        const val = effectiveFormData[key];
        const inferredType = typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string';
        properties[key] = { type: inferredType, title: key };
      });
      setSchema({ type: "object", properties, title: cfg.name });
    } else {
      setSchema(effectiveSchema as any);
    }
    setUiSchema(effectiveUiSchema);
    setFormData(effectiveFormData);
  };

  // create a new config skeleton and open it for editing
  const handleCreateConfig = async (name: string) => {
    if (!name.trim() || !brandId) return;
    
    try {
      const response = await ConfigService.createConfig(parseInt(brandId), { name });
      setConfigs(prev => [...prev, response]);
      setSelectedId(response.id);
      // Clear limit warning if successful
      setLimitReached(false);
      setLimitErrorMessage('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create config';
      showNotification('error', errorMessage);
      
      // Check if it's a subscription limit error
      if (axios.isAxiosError(err) && err.response?.status === 403 && 
          errorMessage.includes('maximum number of configs')) {
        setLimitReached(true);
        setLimitErrorMessage(errorMessage);
      }
    }
  };

  // save current schema/ui/formData into the selected config and submit
  const handleSaveConfig = async () => {
    if (!selectedId || !brandId) {
      showNotification('warning', "Select or create a config first.");
      return;
    }
    
    try {
      await ConfigService.updateConfig(parseInt(brandId), selectedId, {
        formData,
        schema,
        uiSchema
      });
      
      // Reload configs
      await loadBrandAndConfigs(parseInt(brandId));
      showNotification('success', "Config saved and submitted successfully!");
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save config');
    }
  };

  const handleDeleteConfig = async (id: number) => {
    const confirmed = await showConfirm("Delete Configuration", "Are you sure you want to delete this configuration? This action cannot be undone.");
    if (!confirmed) return;
    
    try {
      await ConfigService.deleteConfig(parseInt(brandId!), id);
      
      // Remove from local state
      setConfigs(prev => prev.filter(c => c.id !== id));
      
      // Clear selection if deleted config was selected
      if (selectedId === id) {
        setSelectedId(null);
      }
      
      showNotification('success', "Config deleted successfully");
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete config');
    }
  };

  const handleRenameConfig = async (id: number) => {
    const currentConfig = configs.find(c => c.id === id);
    const newName = await showPrompt("Rename Configuration", "Enter new config name:", currentConfig?.name || '');
    if (!newName || newName.trim() === '') return;
    
    try {
      await ConfigService.updateConfig(parseInt(brandId!), id, {
        name: newName.trim()
      });
      
      // Update local state
      setConfigs(prev => prev.map(c => c.id === id ? { ...c, name: newName.trim() } : c));
      
      showNotification('success', "Config renamed successfully");
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to rename config');
    }
  };

  const exportSelected = () => {
    if (!selectedId) return;
    const cfg = configs.find(c => c.id === selectedId)!;
    const data = { name: cfg.name, schema: schema, uiSchema: uiSchema, formData: formData };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cfg.name || "config"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVersionSelect = (version: number) => {
    setSelectedVersion(version);
  };

  const handleSetActiveVersion = (configName: string, version: number) => {
    setActiveVersions(prev => ({
      ...prev,
      [configName]: version
    }));
  };

  if (isLoading) {
    return (
      <div className="multi-config-builder">
        <Spinner text="Loading brand and configs..." size="large" fullHeight />
      </div>
    );
  }

  if (error) {
    return (
      <div className="multi-config-builder">
        <div className="error-state">
          <img src="assets/dino-think.svg" alt="Dino Thinking" className="dino-thinking" />
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn primary" onClick={() => navigate('/')}>
            Back to Brand Selection
          </button>
        </div>
      </div>
    );
  }

  const selectedConfig = selectedId ? configs.find(c => c.id === selectedId) || null : null;

  return (
    <div className="multi-config-builder">
      <div className="main-layout">
        <BrandHeader brand={brand} />

        {limitReached && subscription && (
          <div style={{ padding: '0 20px', marginTop: '20px' }}>
            <SubscriptionLimitWarning 
              message={limitErrorMessage || "You've reached your config limit"} 
              currentTier={subscription.tier}
            />
          </div>
        )}

        <div className="main-content">
          <ConfigSidebar
            configs={configs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDeleteConfig}
            onRename={handleRenameConfig}
            onCreate={handleCreateConfig}
          />

          <div className="config-content">
            {selectedConfig && (
              <VersionSelector
                brandId={parseInt(brandId!)}
                configId={selectedConfig.id}
                configName={selectedConfig.name}
                selectedVersion={selectedVersion}
                onVersionSelect={handleVersionSelect}
                onSetActiveVersion={(version) => handleSetActiveVersion(selectedConfig.name, version)}
                activeVersion={activeVersions[selectedConfig.name]}
                onNotification={showNotification}
              />
            )}

            <ConfigBuilderPanel
              selectedConfig={selectedConfig}
              schema={schema}
              uiSchema={uiSchema}
              formData={formData}
              onSchemaChange={setSchema}
              onUiSchemaChange={setUiSchema}
              onFormDataChange={setFormData}
              onSave={handleSaveConfig}
              onExport={exportSelected}
              onNotification={showNotification}
            />
          </div>
        </div>
      </div>

      <NotificationSystem
        notifications={notifications}
        confirmDialog={confirmDialog}
        promptDialog={promptDialog}
        onRemoveNotification={removeNotification}
        onConfirmDialog={confirmDialog.onConfirm}
        onCancelDialog={confirmDialog.onCancel}
        onPromptConfirm={promptDialog.onConfirm}
        onPromptCancel={promptDialog.onCancel}
      />
    </div>
  );
}
