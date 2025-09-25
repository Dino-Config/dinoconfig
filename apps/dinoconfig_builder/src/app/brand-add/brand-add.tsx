import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./brand-add.scss";

interface BrandFormData {
  name: string;
  description: string;
  logo: string;
  website: string;
}

export default function BrandAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    description: "",
    logo: "",
    website: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.NX_PUBLIC_API_URL}/brands`, {
        name: formData.name,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
        website: formData.website || undefined,
      }, {
        withCredentials: true
      });

      // Redirect to brand selection after successful creation
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create brand');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="brand-add">
      <div className="brand-add-container">
        <div className="header">
          <h1>Welcome to DinoConfig</h1>
          <p>First, let's create your brand to get started with building configurations</p>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-group">
            <label htmlFor="name">Brand Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter brand name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter brand description (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="logo">Logo URL</label>
            <input
              type="url"
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website URL</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
