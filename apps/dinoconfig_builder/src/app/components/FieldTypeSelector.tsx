import React from 'react';
import { FieldType } from '../types';
import './FieldTypeSelector.scss';

interface FieldTypeOption {
  value: FieldType;
  label: string;
  icon: string;
  description: string;
  category: 'text' | 'number' | 'choice' | 'date' | 'other';
}

const fieldTypeOptions: FieldTypeOption[] = [
  { value: 'text', label: 'Text', icon: '📝', description: 'Single line text input', category: 'text' },
  { value: 'textarea', label: 'Text Area', icon: '📄', description: 'Multi-line text input', category: 'text' },
  { value: 'email', label: 'Email', icon: '📧', description: 'Email address input', category: 'text' },
  { value: 'password', label: 'Password', icon: '🔒', description: 'Password input field', category: 'text' },
  { value: 'url', label: 'URL', icon: '🔗', description: 'Web address input', category: 'text' },
  { value: 'tel', label: 'Phone', icon: '📞', description: 'Phone number input', category: 'text' },
  { value: 'search', label: 'Search', icon: '🔍', description: 'Search input field', category: 'text' },
  
  { value: 'number', label: 'Number', icon: '🔢', description: 'Numeric value input', category: 'number' },
  { value: 'range', label: 'Range', icon: '🎚️', description: 'Slider for number range', category: 'number' },
  
  { value: 'checkbox', label: 'Checkbox', icon: '☑️', description: 'True/false toggle', category: 'choice' },
  { value: 'select', label: 'Select', icon: '📋', description: 'Dropdown selection', category: 'choice' },
  { value: 'radio', label: 'Radio', icon: '🔘', description: 'Radio button group', category: 'choice' },
  
  { value: 'time', label: 'Time', icon: '🕐', description: 'Time picker', category: 'date' },
  { value: 'datetime', label: 'Date & Time', icon: '📅', description: 'Date and time picker', category: 'date' },
  { value: 'datetime-local', label: 'Local DateTime', icon: '🗓️', description: 'Local date and time', category: 'date' },
  { value: 'month', label: 'Month', icon: '📆', description: 'Month picker', category: 'date' },
  { value: 'week', label: 'Week', icon: '📊', description: 'Week picker', category: 'date' },
];

const categories = [
  { id: 'text', label: 'Text Inputs', icon: '📝' },
  { id: 'number', label: 'Numbers', icon: '🔢' },
  { id: 'choice', label: 'Choices', icon: '☑️' },
  { id: 'date', label: 'Date & Time', icon: '📅' },
];

interface FieldTypeSelectorProps {
  value: FieldType;
  onChange: (type: FieldType) => void;
}

export default function FieldTypeSelector({ value, onChange }: FieldTypeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('text');

  const selectedOption = fieldTypeOptions.find(opt => opt.value === value);
  const filteredOptions = fieldTypeOptions.filter(opt => opt.category === selectedCategory);

  const handleSelect = (type: FieldType) => {
    onChange(type);
    setIsOpen(false);
  };

  return (
    <div className="field-type-selector-expanded">
      <button 
        type="button"
        className="type-selector-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Field Type: {selectedOption?.icon} {selectedOption?.label}
        {isOpen ? ' (Hide)' : ' (Show)'}
      </button>

      {isOpen && (
        <div className="type-selector-panel">
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="type-options-grid">
            {filteredOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`type-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="option-icon">{option.icon}</span>
                <div className="option-content">
                  <span className="option-label">{option.label}</span>
                  <span className="option-description">{option.description}</span>
                </div>
                {value === option.value && (
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
