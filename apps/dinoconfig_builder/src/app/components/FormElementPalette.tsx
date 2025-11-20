import React from 'react';
import './FormElementPalette.scss';

export interface PaletteItem {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
}

interface FormElementPaletteProps {
  onAddElement?: (item: PaletteItem) => void;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    id: 'text-input',
    type: 'text',
    label: 'Text Input',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2.5 5.833h15M6.667 5.833V15M13.333 5.833V15M5 15h3.333M11.667 15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'number-input',
    type: 'number',
    label: 'Number Input',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 5v10M10 5v10M15 5v10M2.5 10h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'textarea',
    type: 'textarea',
    label: 'Textarea',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7h10M5 10h10M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'checkbox',
    type: 'checkbox',
    label: 'Checkbox',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'radio-group',
    type: 'radio',
    label: 'Radio Group',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="6" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="6" cy="7" r="1.5" fill="currentColor"/>
        <circle cx="6" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 7h7M10 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'select-dropdown',
    type: 'select',
    label: 'Select Dropdown',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4.5" width="15" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 6.5l-2 2-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 11.5h11M4.5 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'date-picker',
    type: 'date',
    label: 'Date Picker',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 8.5h15M6 3v3M14 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7" cy="12" r="0.75" fill="currentColor"/>
        <circle cx="10" cy="12" r="0.75" fill="currentColor"/>
        <circle cx="13" cy="12" r="0.75" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Input',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 7l7.5 5L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'password',
    type: 'password',
    label: 'Password Input',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="9" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 9V6a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="13" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'url',
    type: 'url',
    label: 'URL Input',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8 12l-3 3a2.828 2.828 0 01-4-4l3-3m8-3l3-3a2.828 2.828 0 014 4l-3 3M7 13l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'range',
    type: 'range',
    label: 'Range Slider',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'tel',
    type: 'tel',
    label: 'Phone Input',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5.5 3h9A1.5 1.5 0 0116 4.5v11a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 15.5v-11A1.5 1.5 0 015.5 3zM10 14v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function FormElementPalette({ onAddElement }: FormElementPaletteProps) {
  return (
    <div className="form-element-palette">
      <div className="palette-header">
        <h4>Form Elements</h4>
        <p>Click to add elements to the canvas</p>
      </div>
      <div className="palette-items">
        {PALETTE_ITEMS.map((item) => (
          <div key={item.id} className="palette-item">
            <div className="palette-item-content">
              <div className="palette-item-icon">{item.icon}</div>
              <span className="palette-item-label">{item.label}</span>
            </div>
            <button
              className="palette-item-add-btn"
              onClick={() => {
                console.log('Add button clicked for:', item);
                console.log('onAddElement callback exists:', !!onAddElement);
                if (onAddElement) {
                  console.log('Calling onAddElement...');
                  onAddElement(item);
                } else {
                  console.error('onAddElement is undefined!');
                }
              }}
              title={`Add ${item.label}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
