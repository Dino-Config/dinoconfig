import React, { useState, useEffect } from 'react';
import { Config } from '../types';
import { ConfigService } from '../services/configService';
import './VersionSelector.scss';

interface VersionSelectorProps {
  brandId: number;
  configId: number;
  configName: string;
  selectedVersion: number | null;
  onVersionSelect: (version: number) => void;
  onSetActiveVersion: (version: number) => void;
  activeVersion?: number;
  onNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  brandId,
  configId,
  configName,
  selectedVersion,
  onVersionSelect,
  onSetActiveVersion,
  activeVersion,
  onNotification
}) => {
  const [versions, setVersions] = useState<Config[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingActive, setIsSettingActive] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<Config | null>(null);

  useEffect(() => {
    loadVersions();
  }, [brandId, configId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const versionsData = await ConfigService.getConfigVersions(brandId, configId);
      setVersions(versionsData);
      
      // Set the first version as preview by default
      if (versionsData.length > 0) {
        setPreviewVersion(versionsData[0]);
      }
    } catch (error: any) {
      onNotification('error', 'Failed to load config versions');
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActiveVersion = async (version: number) => {
    try {
      setIsSettingActive(true);
      await ConfigService.setActiveVersion(brandId, configName, version);
      onSetActiveVersion(version);
      onNotification('success', `Version ${version} set as active`);
    } catch (error: any) {
      onNotification('error', 'Failed to set active version');
      console.error('Error setting active version:', error);
    } finally {
      setIsSettingActive(false);
    }
  };

  const handleVersionChange = (versionNumber: number) => {
    const version = versions.find(v => v.version === versionNumber);
    if (version) {
      setPreviewVersion(version);
      onVersionSelect(versionNumber);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="version-selector">
        <div className="version-selector__loading">Loading versions...</div>
      </div>
    );
  }

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="version-selector">
      <div className="version-selector__header">
        <h3>Version History</h3>
        <div className="version-selector__active-indicator">
          <span className="version-selector__active-label">Active Version:</span>
          <span className="version-selector__active-version">v{activeVersion || 'Latest'}</span>
        </div>
      </div>
      
      <div className="version-selector__controls">
        <div className="version-selector__dropdown-container">
          <label htmlFor="version-select" className="version-selector__dropdown-label">
            Select Version to Preview:
          </label>
          <select
            id="version-select"
            className="version-selector__dropdown"
            value={previewVersion?.version || ''}
            onChange={(e) => handleVersionChange(Number(e.target.value))}
          >
            {versions.map((version) => (
              <option key={version.id} value={version.version}>
                v{version.version} - {formatDate(version.createdAt)}
                {activeVersion === version.version ? ' (Active)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="version-selector__actions">
          <button
            className="version-selector__set-active-btn"
            onClick={() => previewVersion && handleSetActiveVersion(previewVersion.version)}
            disabled={isSettingActive || !!(previewVersion && activeVersion === previewVersion.version)}
          >
            {isSettingActive ? 'Setting...' : 'Set as Active Version'}
          </button>
        </div>
      </div>
      
      {previewVersion && (
        <div className="version-selector__preview">
          <div className="version-selector__preview-header">
            <h4>Preview - Version {previewVersion.version}</h4>
            <div className="version-selector__preview-date">
              Created: {formatDate(previewVersion.createdAt)}
            </div>
            {activeVersion === previewVersion.version && (
              <div className="version-selector__preview-active-badge">Currently Active</div>
            )}
          </div>
          
          {previewVersion.description && (
            <div className="version-selector__preview-description">
              <strong>Description:</strong> {previewVersion.description}
            </div>
          )}
          
          <div className="version-selector__preview-data">
            <strong>Form Data:</strong>
            <pre className="version-selector__preview-json">
              {JSON.stringify(previewVersion.formData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

