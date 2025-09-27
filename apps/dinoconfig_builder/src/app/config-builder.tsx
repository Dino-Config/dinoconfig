// MultiConfigBuilder.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form } from '@rjsf/mui';
import validator from "@rjsf/validator-ajv8";
import { JSONSchema7 } from "json-schema";
import axios from "axios";
import { IChangeEvent } from "@rjsf/core";
import "./config-builder.scss";
import { environment } from "../environments";
import { IoChevronBack, IoHammerOutline, IoPersonOutline, IoSettingsOutline, IoMenu } from "react-icons/io5";

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

interface Config {
  id: number;
  name: string;
  description?: string;
  data: Record<string, any>;
  version: number;
  createdAt: string;
}

interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

interface User {
  id: number;
  auth0Id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isActive: boolean;
  companyName?: string;
  createdAt: Date;
  brands: Brand[];
}

export default function MultiConfigBuilder() {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId?: string }>();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<'builder' | 'profile'>('builder');
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

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

  // load configs and brand info initially
  useEffect(() => {
    if (brandId) {
      loadBrandAndConfigs(parseInt(brandId));
    } else {
      // Fallback for backward compatibility
      navigate('/');
    }
  }, [brandId]);

  const loadBrandAndConfigs = async (brandId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load brand info
      const brandsResponse = await axios.get(`${environment.apiUrl}/brands`, {
        withCredentials: true
      });
      const brandData = brandsResponse.data.find((b: Brand) => b.id === brandId);
      if (!brandData) {
        throw new Error('Brand not found');
      }
      setBrand(brandData);

      // Load configs for this brand
      const configsResponse = await axios.get(`${environment.apiUrl}/brands/${brandId}/configs`, {
        withCredentials: true
      });
      setConfigs(configsResponse.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load brand and configs');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setUserLoading(true);
      setUserError(null);

      const response = await axios.get(`${environment.apiUrl}/users`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setUserError(err.response?.data?.message || 'Failed to load user profile');
      } else {
        setUserError('An error occurred while loading profile');
      }
    } finally {
      setUserLoading(false);
    }
  };

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
      // Convert the stored data to schema format
      // For now, we'll create a simple schema from the data structure
      const properties: Record<string, any> = {};
      Object.keys(cfg.data).forEach(key => {
        properties[key] = { type: "string", title: key };
      });
      setSchema({ type: "object", properties, title: cfg.name });
      setUiSchema({});
      setFormData(cfg.data || {});
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
  const handleCreateConfig = async (name: string) => {
    if (!name.trim() || !brandId) return;
    
    try {
      const response = await axios.post(`${environment.apiUrl}/brands/${brandId}/configs`, {
        name,
        description: '',
        data: {}
      }, {
        withCredentials: true
      });
      
      setConfigs(prev => [...prev, response.data]);
      setSelectedId(response.data.id);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to create config');
      } else {
        alert('An error occurred');
      }
    }
  };

  // save current schema/ui/formData into the selected config
  const handleSaveConfig = async () => {
    if (!selectedId || !brandId) {
      alert("Select or create a config first.");
      return;
    }
    
    try {
      // For now, we'll save the form data directly
      // In a more advanced implementation, we'd save the schema structure
      await axios.patch(`${environment.apiUrl}/brands/${brandId}/configs/${selectedId}`, {
        data: formData
      }, {
        withCredentials: true
      });
      
      // Reload configs
      await loadBrandAndConfigs(parseInt(brandId));
      alert("Saved");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to save config');
      } else {
        alert('An error occurred');
      }
    }
  };

  const handleDeleteConfig = async (id: number) => {
    if (!confirm("Delete this configuration?")) return;
    
    try {
      await axios.delete(`${environment.apiUrl}/brands/${brandId}/configs/${id}`, {
        withCredentials: true
      });
      
      // Remove from local state
      setConfigs(prev => prev.filter(c => c.id !== id));
      
      // Clear selection if deleted config was selected
      if (selectedId === id) {
        setSelectedId(null);
      }
      
      alert("Config deleted successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete config');
      } else {
        alert('Failed to delete config');
      }
    }
  };

  const handleRenameConfig = async (id: number) => {
    const next = prompt("New config name:");
    if (!next) return;
    
    try {
      await axios.patch(`${environment.apiUrl}/brands/${brandId}/configs/${id}`, {
        name: next
      }, {
        withCredentials: true
      });
      
      // Update local state
      setConfigs(prev => prev.map(c => c.id === id ? { ...c, name: next } : c));
      
      alert("Config renamed successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to rename config');
      } else {
        alert('Failed to rename config');
      }
    }
  };

  const exportSelected = () => {
    if (!selectedId) return;
    const cfg = configs.find(c => c.id === selectedId)!;
    const data = { name: cfg.name, data: cfg.data, schema, uiSchema, formData };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cfg.name || "config"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="multi-config">
        <nav className={`left-navigation ${isNavCollapsed ? 'collapsed' : ''}`}>
          <div className={`nav-header ${isNavCollapsed ? 'collapsed' : ''}`}>
            {isNavCollapsed ? (
              <img 
                src="assets/dinoconfig-logo.svg" 
                alt="DinoConfig" 
                className="nav-logo clickable-logo"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              />
            ) : (
              <>
                <h2 
                  className="nav-title-clickable"
                  onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                >
                  DinoConfig Builder
                </h2>
              </>
            )}
          </div>
          <div className="nav-sections">
            <div className="nav-section">
              <h3 className={`nav-section-title ${isNavCollapsed ? 'hidden' : ''}`}>Main</h3>
              <ul className="nav-menu">
                <li className="nav-item active">
                  <button className="nav-link">
                    <IoHammerOutline className="nav-icon" />
                    <span className={isNavCollapsed ? 'hidden' : ''}>Builder</span>
                  </button>
                </li>
              </ul>
            </div>
            <div className="nav-section">
              <h3 className={`nav-section-title ${isNavCollapsed ? 'hidden' : ''}`}>Account</h3>
              <ul className="nav-menu">
                <li className="nav-item">
                  <button className="nav-link">
                    <IoPersonOutline className="nav-icon" />
                    <span className={isNavCollapsed ? 'hidden' : ''}>Profile</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link">
                    <IoSettingsOutline className="nav-icon" />
                    <span className={isNavCollapsed ? 'hidden' : ''}>Settings</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="nav-footer">
            <button className="btn back-button" onClick={() => navigate('/')}>
              <IoChevronBack />
              <span className={isNavCollapsed ? 'hidden' : ''}>Back to Brands</span>
            </button>
          </div>
        </nav>
        <div className="main-layout">
          <div className="loading">
            <h2>Loading brand and configs...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="multi-config">
        <nav className={`left-navigation ${isNavCollapsed ? 'collapsed' : ''}`}>
          <div className={`nav-header ${isNavCollapsed ? 'collapsed' : ''}`}>
            {isNavCollapsed ? (
              <img 
                src="assets/dinoconfig-logo.svg" 
                alt="DinoConfig" 
                className="nav-logo clickable-logo"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              />
            ) : (
              <>
                <h2 
                  className="nav-title-clickable"
                  onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                >
                  DinoConfig Builder
                </h2>
              </>
            )}
          </div>
          <div className="nav-sections">
            <div className="nav-section">
              <h3 className={`nav-section-title ${isNavCollapsed ? 'hidden' : ''}`}>Main</h3>
              <ul className="nav-menu">
                <li className="nav-item active">
                  <button className="nav-link">
                    <IoHammerOutline className="nav-icon" />
                    <span className={isNavCollapsed ? 'hidden' : ''}>Builder</span>
                  </button>
                </li>
              </ul>
            </div>
            <div className="nav-section">
              <h3 className={`nav-section-title ${isNavCollapsed ? 'hidden' : ''}`}>Account</h3>
              <ul className="nav-menu">
                <li className="nav-item">
                  <button className="nav-link">
                    <IoPersonOutline className="nav-icon" />
                    <span className={isNavCollapsed ? 'hidden' : ''}>Profile</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link">
                    <IoSettingsOutline className="nav-icon" />
                    <span className={isNavCollapsed ? 'hidden' : ''}>Settings</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="nav-footer">
            <button className="btn back-button" onClick={() => navigate('/')}>
              <IoChevronBack />
              <span className={isNavCollapsed ? 'hidden' : ''}>Back to Brands</span>
            </button>
          </div>
        </nav>
        <div className="main-layout">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <button className="btn primary" onClick={() => navigate('/')}>
              Back to Brand Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="multi-config">
      {/* Left Navigation Menu */}
      <nav className={`left-navigation ${isNavCollapsed ? 'collapsed' : ''}`}>
        <div className={`nav-header ${isNavCollapsed ? 'collapsed' : ''}`}>
          {isNavCollapsed ? (
            <img 
              src="/assets/dinoconfig-logo.svg" 
              alt="DinoConfig" 
              className="nav-logo clickable-logo"
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            />
          ) : (
            <>
              <h2 
                className="nav-title-clickable"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              >
                DinoConfig Builder
              </h2>
            </>
          )}
        </div>
        
        <div className="nav-sections">
          <div className="nav-section">
            <h3 className={`nav-section-title ${isNavCollapsed ? 'hidden' : ''}`}>Main</h3>
            <ul className="nav-menu">
              <li className="nav-item">
                <button 
                  className={`nav-link ${currentView === 'builder' ? 'active' : ''}`}
                  onClick={() => setCurrentView('builder')}
                >
                  <IoHammerOutline className="nav-icon" />
                  <span className={isNavCollapsed ? 'hidden' : ''}>Builder</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h3 className={`nav-section-title ${isNavCollapsed ? 'hidden' : ''}`}>Account</h3>
            <ul className="nav-menu">
              <li className="nav-item">
                <button 
                  className={`nav-link ${currentView === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentView('profile');
                    if (!user && !userLoading) {
                      loadUserProfile();
                    }
                  }}
                >
                  <IoPersonOutline className="nav-icon" />
                  <span className={isNavCollapsed ? 'hidden' : ''}>Profile</span>
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link">
                  <IoSettingsOutline className="nav-icon" />
                  <span className={isNavCollapsed ? 'hidden' : ''}>Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="nav-footer">
          <button className="btn back-button" onClick={() => navigate('/')}>
            <IoChevronBack />
            <span className={isNavCollapsed ? 'hidden' : ''}>Back to Brands</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="main-layout">
        {/* Header with brand info */}
        <div className="brand-header">
          <div className="brand-info">
            {currentView === 'builder' ? (
              <>
                <div className="brand-field">
                  <span className="field-label">Brand name:</span>
                  <h1 className="field-value">{brand?.name}</h1>
                </div>
                {brand?.description && (
                  <div className="brand-field">
                    <span className="field-label">Description:</span>
                    <p className="field-value">{brand.description}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="brand-field">
                <span className="field-label">View:</span>
                <h1 className="field-value">User Profile</h1>
              </div>
            )}
          </div>
        </div>

        <div className="main-content">
          {currentView === 'builder' ? (
            <>
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
                    <button className="btn action-btn" onClick={addFieldToSchema}>Add field</button>
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
                    className={`btn action-btn ${!selectedId ? "disabled" : ""}`}
                    onClick={handleSaveConfig}
                    disabled={!selectedId}
                  >
                    Save config
                  </button>
                  <button
                    className={`btn action-btn ${!selectedId ? "disabled" : ""}`}
                    onClick={exportSelected}
                    disabled={!selectedId}
                  >
                    Export
                  </button>
                </div>
              </div>
            </>
          ) : (
            <ProfileView 
              user={user} 
              loading={userLoading} 
              error={userError} 
              onRetry={loadUserProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* Profile View Component */
function ProfileView({ user, loading, error, onRetry }: {
  user: User | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <h2>Error loading profile</h2>
          <p>{error}</p>
          <button className="btn primary" onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="empty-state">
          <h2>No profile data</h2>
          <button className="btn primary" onClick={onRetry}>
            Load Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h2 className="profile-title">User Profile</h2>
        
        <div className="profile-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="profile-grid">
            <div className="profile-field">
              <span className="field-label">First Name:</span>
              <span className="field-value">{user.firstName}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Last Name:</span>
              <span className="field-value">{user.lastName}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email:</span>
              <span className="field-value">{user.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Phone Number:</span>
              <span className="field-value">{user.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Company Name:</span>
              <span className="field-value">{user.companyName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Account Status:</span>
              <span className={`field-value status ${user.isActive ? 'active' : 'inactive'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Address Information</h3>
          <div className="profile-grid">
            <div className="profile-field full-width">
              <span className="field-label">Address:</span>
              <span className="field-value">{user.address || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">City:</span>
              <span className="field-value">{user.city || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">State:</span>
              <span className="field-value">{user.state || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">ZIP Code:</span>
              <span className="field-value">{user.zip || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Country:</span>
              <span className="field-value">{user.country || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Account Details</h3>
          <div className="profile-grid">
            <div className="profile-field">
              <span className="field-label">User ID:</span>
              <span className="field-value">{user.id}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Auth0 ID:</span>
              <span className="field-value">{user.auth0Id}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Member Since:</span>
              <span className="field-value">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Associated Brands</h3>
          {user.brands && user.brands.length > 0 ? (
            <div className="brands-list">
              {user.brands.map((brand) => (
                <div key={brand.id} className="brand-item">
                  <div className="brand-info">
                    <h4 className="brand-name">{brand.name}</h4>
                    {brand.description && (
                      <p className="brand-description">{brand.description}</p>
                    )}
                    {brand.website && (
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="brand-website">
                        {brand.website}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">No brands associated with this account.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* small helper components / styles below */
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

const fieldTypes: FieldType[] = [
  "text", "password", "select", "checkbox", "radio", "number",
  "textarea", "email", "range", "search", "tel", "url", "time",
  "datetime", "datetime-local", "week", "month"
]; const inputStyle: React.CSSProperties = { padding: 8, borderRadius: 6, border: "1px solid #d0d7e6", width: "100%" };
const primaryBtn: React.CSSProperties = { background: "#2f6fed", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" };
const mutedBtn: React.CSSProperties = { background: "#f3f6fb", color: "#333", border: "1px solid #e6edf8", padding: "6px 10px", borderRadius: 6, cursor: "pointer" };
const disabledBtn: React.CSSProperties = { background: "#e6eefc", color: "#aac", border: "none", padding: "6px 10px", borderRadius: 6 };
const codeBox: React.CSSProperties = { background: "#0b1220", color: "#e6eef8", padding: 12, borderRadius: 6, height: 260, overflow: "auto", fontSize: 12, lineHeight: 1.4 };

