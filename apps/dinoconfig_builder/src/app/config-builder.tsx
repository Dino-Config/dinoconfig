// MultiConfigBuilder.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from '@rjsf/mui';
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import {
  loadConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  SavedConfig,
} from "./storageService";
import { IChangeEvent } from "@rjsf/core";
import "./config-builder.scss";

type FieldType =
  | "text"
  | "password"
  | "select"
  | "checkbox"
  | "radio"
  | "number"
  | "textarea"
  | "email"
  | "range"
  | "search"
  | "tel"
  | "url"
  | "time"
  | "datetime"
  | "datetime-local"
  | "week"
  | "month";

interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  options?: string;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: string;
}

interface Props {
  companyId: string;
}

export default function MultiConfigBuilder({ companyId }: Props) {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // builder local state (for adding fields)
  const [field, setField] = useState<FieldConfig>({
    name: "",
    type: "text",
    label: "",
    options: "",
    required: false,
  });
  const [showValidations, setShowValidations] = useState(false);

  // current editing schema/ui/formData loaded from selected config
  const [schema, setSchema] = useState<JSONSchema7>({ type: "object", properties: {}, required: [] });
  const [uiSchema, setUiSchema] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});

  // load configs initially
  useEffect(() => {
    setConfigs(loadConfigs(companyId));
  }, [companyId]);

  // when selectedId changes, load its schema/ui/formData
  useEffect(() => {
    if (!selectedId) {
      // reset to empty
      setSchema({ type: "object", properties: {}, required: [] });
      setUiSchema({});
      setFormData({});
      return;
    }
    const cfg = configs.find(c => c.id === selectedId);
    if (cfg) {
      setSchema(cfg.schema || { type: "object", properties: {} });
      setUiSchema(cfg.uiSchema || {});
      setFormData(cfg.formData || {});
    }
  }, [selectedId, configs]);

  const handleFieldChange = (key: keyof FieldConfig) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setField({ ...field, [key]: value as any });
  };

  const getSchemaType = (t: FieldType): JSONSchema7["type"] => {
    if (["number", "range"].includes(t)) return "number";
    if (t === "checkbox") return "boolean";
    return "string";
  };

  const getWidget = (t: FieldType) => {
    // keep explicit values for widgets we want to set
    const widgetMap: Record<FieldType, string | undefined> = {
      textarea: "textarea",
      password: "password",
      radio: "radio",
      range: "range",
      search: "search",
      email: "email",
      url: "url",
      tel: "tel",
      time: "time",
      datetime: "datetime",
      "datetime-local": "datetime-local",
      week: "week",
      month: "month",
      // rest use defaults
      text: undefined,
      select: undefined,
      checkbox: undefined,
      number: undefined,
    };
    return widgetMap[t];
  };

  const ensureUiEntry = (name: string, widget?: string) => {
    // always create an object entry even if empty (helps when viewing uiSchema)
    setUiSchema(prev => ({
      ...prev,
      [name]: widget ? { "ui:widget": widget } : (prev[name] ?? {})
    }));
  };

  const addFieldToSchema = () => {
    if (!field.name?.trim()) {
      alert("Field name is required.");
      return;
    }
    // create JSON schema field
    const fName = field.name.trim();
    const baseType = getSchemaType(field.type);
    const newField: any = { type: baseType, title: field.label || fName };

    // defaults for enums
    if (["select", "radio"].includes(field.type) && field.options) {
      newField.enum = field.options.split(",").map(o => o.trim()).filter(Boolean);
    }

    // validations
    if (showValidations) {
      if (field.required) {
        setSchema(prev => ({
          ...prev,
          required: Array.from(new Set([...(prev.required as string[] || []), fName]))
        }));
      }
      if (typeof field.min === "number") newField.minimum = field.min;
      if (typeof field.max === "number") newField.maximum = field.max;
      if (typeof field.maxLength === "number") newField.maxLength = field.maxLength;
      if (field.pattern) newField.pattern = field.pattern;
    }

    setSchema(prev => ({
      ...prev,
      properties: { ...(prev.properties || {}), [fName]: newField }
    }));

    const widget = getWidget(field.type);
    ensureUiEntry(fName, widget);

    // clear builder input
    setField({ name: "", type: "text", label: "", options: "", required: false });
  };

  // create a new config skeleton and open it for editing
  const handleCreateConfig = (name: string) => {
    if (!name.trim()) return;
    const initialSchema = { title: name, type: "object", properties: {}, required: [] } as JSONSchema7;
    const created = createConfig(companyId, {
      name,
      schema: initialSchema,
      uiSchema: {},
      formData: {},
    });
    setConfigs(prev => [...prev, created]);
    setSelectedId(created.id);
  };

  // save current schema/ui/formData into the selected config
  const handleSaveConfig = () => {
    if (!selectedId) {
      alert("Select or create a config first.");
      return;
    }
    updateConfig(companyId, selectedId, {
      schema,
      uiSchema,
      formData
    });
    setConfigs(loadConfigs(companyId)); // reload
    alert("Saved");
  };

  const handleDeleteConfig = (id: string) => {
    if (!confirm("Delete this configuration?")) return;
    deleteConfig(companyId, id);
    setConfigs(loadConfigs(companyId));
    setSelectedId(null);
  };

  const handleRenameConfig = (id: string) => {
    const next = prompt("New config name:");
    if (!next) return;
    updateConfig(companyId, id, { name: next });
    setConfigs(loadConfigs(companyId));
  };

  const exportSelected = () => {
    if (!selectedId) return;
    const cfg = configs.find(c => c.id === selectedId)!;
    const data = { name: cfg.name, schema: cfg.schema, uiSchema: cfg.uiSchema, formData: cfg.formData };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cfg.name || "config"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="multi-config">
      {/* Left: Config list */}
      <div className="sidebar">
        <h3 className="section-title">Configs</h3>
        <ConfigList
          configs={configs}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={handleDeleteConfig}
          onRename={handleRenameConfig}
        />
        <NewConfigCreator onCreate={handleCreateConfig} />
      </div>

      {/* Middle: Builder + Preview */}
      <div className="builder">
        <h3 className="section-title">
          {selectedId
            ? `Editing: ${configs.find(c => c.id === selectedId)?.name}`
            : "Create or select a config"}
        </h3>

        {/* Builder */}
        <div className="field-builder">
          <input placeholder="Field name" value={field.name} onChange={handleFieldChange("name")} />
          <input placeholder="Label (optional)" value={field.label} onChange={handleFieldChange("label")} />

          <select value={field.type} onChange={handleFieldChange("type")}>
            {fieldTypes.map(ft => (
              <option key={ft} value={ft}>{ft}</option>
            ))}
          </select>

          {(field.type === "select" || field.type === "radio") && (
            <input placeholder="Options (comma separated)" value={field.options} onChange={handleFieldChange("options")} />
          )}


          <label className="toggle">
            <input type="checkbox" checked={showValidations} onChange={() => setShowValidations(s => !s)} />
            Show validation settings
          </label>

          {showValidations && (
            <div className="validation">
              <label>
                <input
                  type="checkbox"
                  checked={!!field.required}
                  onChange={e => setField({ ...field, required: e.target.checked })}
                /> Required
              </label>

              {["number", "range"].includes(field.type) && (
                <div className="number-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={field.min ?? ""}
                    onChange={e => setField({ ...field, min: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={field.max ?? ""}
                    onChange={e => setField({ ...field, max: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              )}

              {["text", "textarea", "email", "search", "url", "tel"].includes(field.type) && (
                <>
                  <input
                    type="number"
                    placeholder="Max Length"
                    value={field.maxLength ?? ""}
                    onChange={e => setField({ ...field, maxLength: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <input
                    placeholder="Pattern (regex)"
                    value={field.pattern ?? ""}
                    onChange={e => setField({ ...field, pattern: e.target.value || undefined })}
                  />
                </>
              )}
            </div>
          )}

          <div className="actions">
            <button className="btn primary" onClick={addFieldToSchema}>Add field</button>
            <button
              className="btn muted"
              onClick={() => setField({ name: "", type: "text", label: "", options: "", required: false })}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div className="preview">
          <h4>Live Preview</h4>
          <Form
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            validator={validator}
            onChange={(e: IChangeEvent) => setFormData(e.formData)}
            onSubmit={({ formData }) => { alert("Preview submit — data in console"); console.log("submitted:", formData); }}
          />
        </div>
        <div className="save-config-actions">
          <button
            className={`btn primary ${!selectedId ? "disabled" : ""}`}
            onClick={handleSaveConfig}
            disabled={!selectedId}
          >
            Save config
          </button>
          <button
            className={`btn primary ${!selectedId ? "disabled" : ""}`}
            onClick={exportSelected}
            disabled={!selectedId}
          >
            Export
          </button>
        </div>
      </div>

      {/* Right: Schema viewers
      <div className="schema-view">
        <div className="block">
          <h4>JSON Schema</h4>
          <pre>{JSON.stringify(schema, null, 2)}</pre>
        </div>
        <div className="block">
          <h4>UI Schema</h4>
          <pre>{JSON.stringify(uiSchema, null, 2)}</pre>
        </div>
      </div> */}
    </div>
  );
}

/* small helper components / styles below */
function ConfigList({ configs, selectedId, onSelect, onDelete, onRename }: {
  configs: SavedConfig[], selectedId: string | null,
  onSelect: (id: string | null) => void, onDelete: (id: string) => void, onRename: (id: string) => void
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
      <button className="btn primary create-btn" onClick={() => { onCreate(name); setName(""); }}>
        Create
      </button>
    </div>
  );
}

const fieldTypes: FieldType[] = [
  "text", "password", "select", "checkbox", "radio", "number",
  "textarea", "email", "range", "search", "tel", "url", "time",
  "datetime", "datetime-local", "week", "month"
]; const inputStyle: React.CSSProperties = { padding: 8, borderRadius: 6, border: "1px solid #d0d7e6", width: "100%" };
const primaryBtn: React.CSSProperties = { background: "#2f6fed", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" };
const mutedBtn: React.CSSProperties = { background: "#f3f6fb", color: "#333", border: "1px solid #e6edf8", padding: "6px 10px", borderRadius: 6, cursor: "pointer" };
const disabledBtn: React.CSSProperties = { background: "#e6eefc", color: "#aac", border: "none", padding: "6px 10px", borderRadius: 6 };
const codeBox: React.CSSProperties = { background: "#0b1220", color: "#e6eef8", padding: 12, borderRadius: 6, height: 260, overflow: "auto", fontSize: 12, lineHeight: 1.4 };

