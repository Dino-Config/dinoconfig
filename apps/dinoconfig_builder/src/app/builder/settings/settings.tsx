import React, { useState } from "react";
import LeftNavigation from "../navigation/left-navigation";
import "./settings.scss";

export default function SettingsPage() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  return (
    <div className="multi-config">
      <LeftNavigation
        isCollapsed={isNavCollapsed}
        onToggle={() => setIsNavCollapsed(!isNavCollapsed)}
        activeItem="settings"
      />
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
          <div style={{ padding: 16 }}>
            <h3 className="section-title">Preferences</h3>
            <p>Settings page placeholder. Add your preferences here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}



