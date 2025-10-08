import React, { useState } from 'react';
import { Config } from '../types';
import ConfigModal from './ConfigModal';
import './ConfigSidebar.scss';

interface ConfigSidebarProps {
  configs: Config[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onDelete: (id: number) => void;
  onRename: (id: number) => void;
  onCreate: (name: string) => void;
}

export default function ConfigSidebar({
  configs,
  selectedId,
  onSelect,
  onDelete,
  onRename,
  onCreate
}: ConfigSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (name: string, description?: string) => {
    onCreate(name);
    setIsModalOpen(false);
  };

  return (
    <div className="config-sidebar">
      <div className="sidebar-header">
        <h3 className="section-title">Configurations</h3>
        <span className="config-count">{configs.length}</span>
      </div>
      
      <ConfigList
        configs={configs}
        selectedId={selectedId}
        onSelect={onSelect}
        onDelete={onDelete}
        onRename={onRename}
      />
      
      <button className="create-config-btn" onClick={() => setIsModalOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4.167v11.666M4.167 10h11.666" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        New Configuration
      </button>

      <ConfigModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

function ConfigList({ configs, selectedId, onSelect, onDelete, onRename }: {
  configs: Config[], selectedId: number | null,
  onSelect: (id: number | null) => void, onDelete: (id: number) => void, onRename: (id: number) => void
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!configs.length) {
    return (
      <div className="empty-configs">
        <img src="/assets/write.svg" alt="" className="write-icon-svg" />
        <p>No configurations yet</p>
        <small>Click the button below to create your first configuration</small>
      </div>
    );
  }

  return (
    <ul className="config-list">
      {configs.map(c => (
        <li key={c.id} className={selectedId === c.id ? "selected" : ""}>
          <div className="config-item">
            <button
              onClick={() => onSelect(c.id)}
              className="config-btn"
            >
              <div className="config-icon">
                {selectedId === c.id ? '📄' : '📋'}
              </div>
              <span className="config-name">{c.name}</span>
            </button>
            <button 
              className="menu-btn" 
              onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 8.833a.833.833 0 100-1.666.833.833 0 000 1.666zM8 4.167a.833.833 0 100-1.667.833.833 0 000 1.667zM8 13.5a.833.833 0 100-1.667A.833.833 0 008 13.5z" 
                  fill="currentColor"/>
              </svg>
            </button>
          </div>
          {expandedId === c.id && (
            <div className="config-actions">
              <button onClick={() => { onRename(c.id); setExpandedId(null); }} className="action-btn rename">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M6.417 2.333H2.333A1.167 1.167 0 001.167 3.5v8.167a1.167 1.167 0 001.166 1.166h8.167a1.167 1.167 0 001.167-1.166V7.583M10.792 1.458a1.237 1.237 0 011.75 1.75l-5.834 5.834H4.667V7l6.125-5.542z" 
                    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Rename
              </button>
              <button onClick={() => { onDelete(c.id); setExpandedId(null); }} className="action-btn delete">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.75 3.5h10.5M11.083 3.5v8.167a1.167 1.167 0 01-1.166 1.166H4.083a1.167 1.167 0 01-1.166-1.166V3.5m1.75 0V2.333a1.167 1.167 0 011.166-1.166h2.334a1.167 1.167 0 011.166 1.166V3.5" 
                    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

