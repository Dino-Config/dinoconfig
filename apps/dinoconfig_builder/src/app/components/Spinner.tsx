import React from 'react';
import { ImSpinner2 } from 'react-icons/im';
import './Spinner.scss';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  className?: string;
  fullHeight?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = '#007bff', 
  text, 
  className = '',
  fullHeight = false
}) => {
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  return (
    <div className={`spinner-container ${fullHeight ? 'full-height' : ''} ${className}`}>
      <ImSpinner2 
        className="spinner-icon" 
        style={{ 
          fontSize: sizeMap[size], 
          color: color 
        }} 
      />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
