import React from 'react';
import { Brand } from '../types';
import './BrandHeader.scss';
import { IoChevronBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

interface BrandHeaderProps {
  brand: Brand | null;
}

export default function BrandHeader({ brand }: BrandHeaderProps) {
  const navigate = useNavigate();

  if (!brand) {
    navigate('/brands')
  }

  return (
    <div className="brand-header">
      <button className="btn back-button" onClick={() => navigate('/brands') }>
        <IoChevronBack />
        {/* <span>Back to Brands</span> */}
      </button>
      <div className="brand-info">
        <div className="brand-field">
          <span className="field-label">Brand name:</span>
          <h1 className="field-value">{brand?.name}</h1>
        </div>
        {brand?.description && (
          <div className="brand-field">
            <span className="field-label">Description:</span>
            <p className="field-value">{brand?.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

