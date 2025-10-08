import React, { useState } from 'react';
import './Settings.scss';

export default function Settings() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general', 'builder', 'export']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

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
