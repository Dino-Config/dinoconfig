import React from 'react';
import './Settings.scss';

export default function Settings() {
  return (
    <div className="settings-page">
      <div className="main-layout">
        <div className="brand-header">
          <div className="brand-info">
            <div className="brand-field">
              <span className="field-label">View:</span>
              <h1 className="field-value">Settings</h1>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="settings-container">
            <div className="settings-content">
              <h2 className="settings-title">Settings</h2>
              
              <div className="settings-section">
                <h3 className="section-title">General Settings</h3>
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
              </div>

              <div className="settings-section">
                <h3 className="section-title">Builder Settings</h3>
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
              </div>

              <div className="settings-section">
                <h3 className="section-title">Export Settings</h3>
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
              </div>

              <div className="settings-actions">
                <button className="btn btn-primary">Save Settings</button>
                <button className="btn btn-secondary">Reset to Defaults</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
