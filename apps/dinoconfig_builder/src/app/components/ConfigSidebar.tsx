import React, { useState } from 'react';
import { Config } from '../types';
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
  return (
    <div className="config-sidebar">
      <h3 className="section-title">Configs</h3>
      <ConfigList
        configs={configs}
        selectedId={selectedId}
        onSelect={onSelect}
        onDelete={onDelete}
        onRename={onRename}
      />
      <NewConfigCreator onCreate={onCreate} />
    </div>
  );
}

function ConfigList({ configs, selectedId, onSelect, onDelete, onRename }: {
  configs: Config[], selectedId: number | null,
  onSelect: (id: number | null) => void, onDelete: (id: number) => void, onRename: (id: number) => void
}) {
  if (!configs.length) return <div className="empty">No configs yet</div>;
  return (
    <ul className="config-list">
      {configs.map(c => (
        <li key={c.id}>
          <button
            onClick={() => onSelect(c.id)}
            className={`config-btn ${selectedId === c.id ? "selected" : ""}`}
          >
            {c.name}
          </button>
          <div className="row-actions">
            <button onClick={() => onRename(c.id)} className="btn-ghost">Rename</button>
            <button onClick={() => onDelete(c.id)} className="btn-delete">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function NewConfigCreator({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="new-config">
      <input
        className="input"
        placeholder="New config name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button className="btn action-btn create-btn" onClick={() => { onCreate(name); setName(""); }}>
        Create
      </button>
    </div>
  );
}

