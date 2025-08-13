// MultiConfigBuilder.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import Form, { IChangeEvent } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import {
  loadConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  SavedConfig,
} from "./storageService";

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
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 420px", gap: 16 }}>
      {/* Left: Config list */}
      <div style={{ padding: 12, borderRadius: 8, background: "#fafafa", minHeight: 360 }}>
        <h3 style={{ marginTop: 0 }}>Configs</h3>
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
      <div style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>{selectedId ? `Editing: ${configs.find(c => c.id === selectedId)?.name}` : "Create or select a config"}</h3>

        {/* Builder */}
        <div style={{ padding: 12, borderRadius: 8, background: "#f5f7fb", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input placeholder="Field name" value={field.name} onChange={handleFieldChange("name")} style={inputStyle} />
            <input placeholder="Label (optional)" value={field.label} onChange={handleFieldChange("label")} style={inputStyle} />

            <select value={field.type} onChange={handleFieldChange("type")} style={inputStyle}>
              {fieldTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
            </select>

            {(field.type === "select" || field.type === "radio") && (
              <input placeholder="Options (comma separated)" value={field.options} onChange={handleFieldChange("options")} style={inputStyle} />
            )}
          </div>

          <label style={{ display: "block", marginTop: 8 }}>
            <input type="checkbox" checked={showValidations} onChange={() => setShowValidations(s => !s)} /> Show validation settings
          </label>

          {showValidations && (
            <div style={{ marginTop: 8, padding: 8, background: "#fff", borderRadius: 6 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                <input type="checkbox" checked={!!field.required} onChange={(e) => setField({ ...field, required: e.target.checked })} /> Required
              </label>

              {["number", "range"].includes(field.type) && (
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" placeholder="Min" value={field.min ?? ""} onChange={e => setField({ ...field, min: e.target.value ? Number(e.target.value) : undefined })} style={inputStyle} />
                  <input type="number" placeholder="Max" value={field.max ?? ""} onChange={e => setField({ ...field, max: e.target.value ? Number(e.target.value) : undefined })} style={inputStyle} />
                </div>
              )}

              {["text", "textarea", "email", "search", "url", "tel"].includes(field.type) && (
                <>
                  <input type="number" placeholder="Max Length" value={field.maxLength ?? ""} onChange={e => setField({ ...field, maxLength: e.target.value ? Number(e.target.value) : undefined })} style={{ ...inputStyle, marginTop: 6 }} />
                  <input placeholder="Pattern (regex)" value={field.pattern ?? ""} onChange={e => setField({ ...field, pattern: e.target.value || undefined })} style={{ ...inputStyle, marginTop: 6 }} />
                </>
              )}
            </div>
          )}

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={addFieldToSchema} style={primaryBtn}>Add field</button>
            <button onClick={() => { setField({ name: "", type: "text", label: "", options: "", required: false }); }} style={mutedBtn}>Clear</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={handleSaveConfig} disabled={!selectedId} style={selectedId ? primaryBtn : disabledBtn}>Save config</button>
              <button onClick={exportSelected} disabled={!selectedId} style={selectedId ? primaryBtn : disabledBtn}>Export</button>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
          <h4 style={{ marginTop: 0 }}>Live Preview</h4>
          <Form schema={schema} uiSchema={uiSchema} formData={formData} validator={validator}
            onChange={(e: IChangeEvent) => setFormData(e.formData)}
            onSubmit={({ formData }) => { alert("Preview submit — data in console"); console.log("submitted:", formData); }}
          />
        </div>
      </div>

      {/* Right: Schema viewers */}
      <div style={{ padding: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ marginTop: 0 }}>JSON Schema</h4>
          <pre style={codeBox}>{JSON.stringify(schema, null, 2)}</pre>
        </div>

        <div>
          <h4>UI Schema</h4>
          <pre style={codeBox}>{JSON.stringify(uiSchema, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

/* small helper components / styles below */

function ConfigList({ configs, selectedId, onSelect, onDelete, onRename }: {
  configs: SavedConfig[], selectedId: string | null,
  onSelect: (id: string | null) => void, onDelete: (id: string) => void, onRename: (id: string) => void
}) {
  return (
    <div>
      {configs.length === 0 && <div style={{ color: "#666" }}>No configs yet</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {configs.map(c => (
          <li key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <button onClick={() => onSelect(c.id)} style={{ background: selectedId === c.id ? "#2f6fed" : "#fff", color: selectedId === c.id ? "#fff" : "#111", borderRadius: 6, padding: "6px 8px", border: "1px solid #ddd" }}>{c.name}</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button onClick={() => onRename(c.id)} style={mutedBtn}>Rename</button>
              <button onClick={() => onDelete(c.id)} style={{ ...mutedBtn, background: "#fee" }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewConfigCreator({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div style={{ marginTop: 12 }}>
      <input placeholder="New config name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 6 }} />
      <button onClick={() => { onCreate(name); setName(""); }} style={primaryBtn}>Create</button>
    </div>
  );
}

const fieldTypes: FieldType[] = [
  "text", "password", "select", "checkbox", "radio", "number",
  "textarea", "email", "range", "search", "tel", "url", "time",
  "datetime", "datetime-local", "week", "month"
];

const inputStyle: React.CSSProperties = { padding: 8, borderRadius: 6, border: "1px solid #d0d7e6", width: "100%" };
const primaryBtn: React.CSSProperties = { background: "#2f6fed", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" };
const mutedBtn: React.CSSProperties = { background: "#f3f6fb", color: "#333", border: "1px solid #e6edf8", padding: "6px 10px", borderRadius: 6, cursor: "pointer" };
const disabledBtn: React.CSSProperties = { background: "#e6eefc", color: "#aac", border: "none", padding: "6px 10px", borderRadius: 6 };
const codeBox: React.CSSProperties = { background: "#0b1220", color: "#e6eef8", padding: 12, borderRadius: 6, height: 260, overflow: "auto", fontSize: 12, lineHeight: 1.4 };