import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../auth/axios-interceptor";
import { environment } from "../../environments";
import { Spinner } from "../components";
import { SubscriptionLimitWarning } from "../components/subscription-limit-warning";
import { subscriptionService, SubscriptionStatus } from "../services/subscription.service";
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
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscription(status);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

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
      const response = await axios.post(`${environment.apiUrl}/brands`, {
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
        const errorMessage = err.response?.data?.message || 'Failed to create brand';
        setError(errorMessage);
        
        // Check if it's a subscription limit error
        if (err.response?.status === 403 && errorMessage.includes('maximum number of brands')) {
          setLimitReached(true);
        }
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

        {limitReached && subscription && (
          <SubscriptionLimitWarning 
            message={error || "You've reached your brand limit"} 
            currentTier={subscription.tier}
          />
        )}

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
              {isLoading ? (
                <Spinner size="small" text="Creating..." className="inline" />
              ) : (
                'Create Brand'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
