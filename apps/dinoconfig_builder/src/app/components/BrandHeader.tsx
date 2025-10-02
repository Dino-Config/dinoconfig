import React from 'react';
import { Brand } from '../types';
import './BrandHeader.scss';

interface BrandHeaderProps {
  brand: Brand | null;
}

export default function BrandHeader({ brand }: BrandHeaderProps) {
  if (!brand) {
    return null;
  }

  return (
    <div className="brand-header">
      <div className="brand-info">
        <div className="brand-field">
          <span className="field-label">Brand name:</span>
          <h1 className="field-value">{brand.name}</h1>
        </div>
        {brand.description && (
          <div className="brand-field">
            <span className="field-label">Description:</span>
            <p className="field-value">{brand.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

