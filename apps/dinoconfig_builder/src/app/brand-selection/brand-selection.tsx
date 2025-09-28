import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../auth/axios-interceptor";
import { environment } from "../../environments";
import "./brand-selection.scss";
import { IoAdd } from "react-icons/io5";

interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  createdAt: string;
}

export default function BrandSelection() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${environment.apiUrl}/brands`, {
        withCredentials: true
      });
      setBrands(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load brands');
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSelect = (brandId: number) => {
    navigate(`/builder/${brandId}`);
  };

  const handleCreateNewBrand = () => {
    navigate('/brand-add');
  };

  if (isLoading) {
    return (
      <div className="brand-selection">
        <div className="brand-selection-container">
          <div className="loading">
            <h2>Loading your brands...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-selection">
        <div className="brand-selection-container">
          <div className="error-state">
            <h2>Error loading brands</h2>
            <p>{error}</p>
            <button className="btn primary" onClick={loadBrands}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-selection">
      <div className="brand-selection-container">
        <div className="header">
          <h1>Select Your Brand</h1>
          <p>Choose a brand to start building configurations</p>
        </div>

        {brands.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h2>No brands yet</h2>
            <p>Create your first brand to get started with building configurations</p>
            <button className="btn primary" onClick={handleCreateNewBrand}>
              Create Your First Brand
            </button>
          </div>
        ) : (
          <>
            <div className="brands-grid">
              {brands.map((brand) => (
                <div key={brand.id} className="brand-card" onClick={() => handleBrandSelect(brand.id)}>
                  <div className="brand-logo">
                    {brand.logo ? (
                      <img src={brand.logo} alt={`${brand.name} logo`} />
                    ) : (
                      <div className="default-logo">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="brand-info">
                    <h3>{brand.name}</h3>
                    {brand.description && (
                      <p className="brand-description">{brand.description}</p>
                    )}
                    <div className="brand-meta">
                      <span className="created-date">
                        Created {new Date(brand.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="brand-actions">
                    <button className="btn primary select-btn">
                      Select Brand
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="create-new-section">
              <button className="btn secondary" onClick={handleCreateNewBrand}>
                <IoAdd />
                Create New Brand
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
