import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JSONSchema7 } from "json-schema";
import { BrandHeader, ConfigSidebar, ConfigBuilderPanel, NotificationSystem, Spinner, VersionSelector, FeatureGate } from "../components";
import { SubscriptionLimitWarning } from "../components/subscription-limit-warning";
import { ConfigService } from "../services/configService";
import { useSubscription } from "../auth/subscription-context";
import { Config, Brand, Notification, ConfirmDialog, PromptDialog, Feature } from "../types";
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
  const [configVersions, setConfigVersions] = useState<Config[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscription } = useSubscription();
  const [limitReached, setLimitReached] = useState(false);
  const [limitErrorMessage, setLimitErrorMessage] = useState<string>('');
  const brandIdNumber = brandId ? parseInt(brandId) : null;

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

  // Track if we're loading versions to prevent race conditions
  const isLoadingVersionsRef = useRef(false);
  const lastLoadedVersionRef = useRef<number | null>(null);

  // when selectedId changes, load its schema/ui/formData and versions
  useEffect(() => {
    if (!selectedId) {
      // reset to empty
      setSchema({ type: "object", properties: {}, required: [] });
      setUiSchema({});
      setFormData({});
      setSelectedVersion(null);
      setConfigVersions([]);
      lastLoadedVersionRef.current = null;
      return;
    }
    
    // Reset selected version when config changes
    setSelectedVersion(null);
    lastLoadedVersionRef.current = null;
    isLoadingVersionsRef.current = true;
    
    // Load all versions for this config
    loadConfigVersions(selectedId);
  }, [selectedId]); // Reset and load when config changes
  
  // When configVersions are loaded, automatically load the latest version
  useEffect(() => {
    if (!selectedId || configVersions.length === 0) return;
    
    // If this was triggered by the initial version load, load the latest version
    if (isLoadingVersionsRef.current) {
      const latestVersion = configVersions[0]; // Assuming versions are ordered by latest first
      loadConfigData(latestVersion);
      setSelectedVersion(latestVersion.version);
      lastLoadedVersionRef.current = latestVersion.version;
      isLoadingVersionsRef.current = false;
    }
  }, [configVersions]);
  
  // When selectedVersion changes (from manual selection in VersionSelector), load that specific version
  useEffect(() => {
    if (!selectedId || !selectedVersion || configVersions.length === 0) return;
    if (isLoadingVersionsRef.current) return; // Don't load during initial version loading
    if (lastLoadedVersionRef.current === selectedVersion) return; // Don't reload if already loaded
    
    // Load the specific version if it exists in configVersions
    const versionConfig = configVersions.find(v => v.version === selectedVersion);
    if (versionConfig) {
      loadConfigData(versionConfig);
      lastLoadedVersionRef.current = selectedVersion;
    }
  }, [selectedVersion]);

  const loadConfigVersions = async (configId: number) => {
    try {
      if (!brandId) return;
      
      const versions = await ConfigService.getConfigVersions(parseInt(brandId), configId);
      setConfigVersions(versions);
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('Version history not available on current plan');
        setConfigVersions([]);
        return;
      }

      showNotification('error', 'Failed to load config versions');
      console.error('Error loading config versions:', error);
    }
  };

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
    
    // Initialize formData with defaults for any boolean fields in schema that are missing
    const initializedFormData = { ...effectiveFormData };
    if (effectiveSchema.properties) {
      Object.keys(effectiveSchema.properties).forEach(key => {
        const property = (effectiveSchema.properties as Record<string, any>)[key];
        // If this is a boolean field and not in formData, set it to false
        if (property.type === 'boolean' && !(key in initializedFormData)) {
          initializedFormData[key] = false;
        }
      });
    }
    
    setFormData(initializedFormData);
  };

  const applyConfigUpdate = (updatedConfig: Config, versions: Config[], previousConfigId: number | null) => {
    setConfigs(prev => {
      const filtered = prev.filter(c => c.id !== previousConfigId && c.id !== updatedConfig.id);
      const next = [...filtered, updatedConfig];
      return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    setActiveVersions(prev => ({
      ...prev,
      [updatedConfig.name]: updatedConfig.version
    }));

    setSelectedId(updatedConfig.id);
    setSelectedVersion(updatedConfig.version);
    setConfigVersions(versions);
    lastLoadedVersionRef.current = updatedConfig.version;
    isLoadingVersionsRef.current = false;
    loadConfigData(updatedConfig);
  };

  const handleConfigUpdated = (updatedConfig: Config, versions: Config[], previousConfigId: number) => {
    applyConfigUpdate(updatedConfig, versions, previousConfigId);
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
    if (!selectedId || !brandIdNumber) {
      showNotification('warning', "Select or create a config first.");
      return;
    }
    
    try {
      const response = await ConfigService.updateConfig(brandIdNumber, selectedId, {
        formData,
        schema,
        uiSchema
      });
      
      const { config: updatedConfig, versions } = response;
      applyConfigUpdate(updatedConfig, versions, selectedId);
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
      const response = await ConfigService.updateConfig(parseInt(brandId!), id, {
        name: newName.trim()
      });
      
      const { config: updatedConfig, versions } = response;
      
      // Update local state with the new config version from response
      setConfigs(prev => {
        // Remove the old version of this config and add the new one
        const filteredConfigs = prev.filter(c => c.id !== id);
        return [...filteredConfigs, updatedConfig];
      });
      
      // Update active versions to reflect the new version
      setActiveVersions(prev => ({
        ...prev,
        [updatedConfig.name]: updatedConfig.version
      }));
      
      // If this was the selected config, update the selected version and versions
      if (selectedId === id) {
        setSelectedVersion(updatedConfig.version);
        setSelectedId(updatedConfig.id);
        setConfigVersions(versions);
      }
      
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

  const handleSetActiveVersion = async (configName: string, version: number) => {
    // Update the active version tracking
    setActiveVersions(prev => ({
      ...prev,
      [configName]: version
    }));
    
    // If this is the currently selected config, switch to the newly active version
    const currentConfig = configs.find(c => c.id === selectedId);
    if (currentConfig && currentConfig.name === configName) {
      // Switch to the newly active version to refresh the Live Preview
      setSelectedVersion(version);
    }
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
              <FeatureGate 
                feature={Feature.CONFIG_VERSIONING}
                fallback={
                  <div className="version-upgrade-prompt">
                    <div className="upgrade-prompt-content">
                      <h4>Version History Available on Pro Plan</h4>
                      <p>Upgrade to Pro to access configuration version history, rollback capabilities, and track all changes to your configs.</p>
                      <a href="/subscription" className="upgrade-link">View Plans</a>
                    </div>
                  </div>
                }
              >
                <VersionSelector
                  brandId={parseInt(brandId!)}
                  configId={selectedConfig.id}
                  configName={selectedConfig.name}
                  selectedVersion={selectedVersion}
                  onVersionSelect={handleVersionSelect}
                  onSetActiveVersion={(version) => handleSetActiveVersion(selectedConfig.name, version)}
                  activeVersion={activeVersions[selectedConfig.name]}
                  onNotification={showNotification}
                  versions={configVersions}
                />
              </FeatureGate>
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
              brandId={brandIdNumber}
              onConfigUpdated={handleConfigUpdated}
              onConfirm={showConfirm}
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
