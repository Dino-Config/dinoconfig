import React, { useLayoutEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import './GridStackCanvas.scss';
import { FieldConfig, FieldType } from '../types';
import TextInputElement from './formElements/TextInputElement';
import NumberInputElement from './formElements/NumberInputElement';
import TextareaElement from './formElements/TextareaElement';
import CheckboxElement from './formElements/CheckboxElement';
import RadioGroupElement from './formElements/RadioGroupElement';
import SelectElement from './formElements/SelectElement';
import RangeElement from './formElements/RangeElement';
import DatePickerElement from './formElements/DatePickerElement';
import { PaletteItem } from './FormElementPalette';

export interface GridFieldConfig extends FieldConfig {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GridStackCanvasProps {
  fields: GridFieldConfig[];
  formData: Record<string, any>;
  onFieldsChange: (fields: GridFieldConfig[]) => void;
  onFormDataChange: (data: Record<string, any>) => void;
  onEditField: (field: GridFieldConfig) => void;
  onDeleteField: (fieldId: string) => void;
  draggedItem: any;
}

export interface GridStackCanvasRef {
  addElement: (item: PaletteItem) => void;
}

// Get default sizes for form elements
function getDefaultSizes(type: string): { w: number; h: number } {
  switch(type) {
    case 'textarea':
      return { w: 4, h: 2 };
    case 'checkbox':
    case 'radio':
      return { w: 2, h: 1 };
    case 'select':
      return { w: 5, h: 1 };
    default:
      return { w: 4, h: 1 };
  }
}

let elementCounter = 0;

// Field item component
const FieldItem = ({ field, formData, onValueChange, onEdit, onDelete }: {
  field: GridFieldConfig;
  formData: Record<string, any>;
  onValueChange: (name: string, value: any) => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const value = formData[field.name];
  const commonProps = {
    config: field,
    value,
    onChange: (val: any) => onValueChange(field.name, val),
    onEdit,
    onDelete,
    isEditable: true,
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'url':
    case 'tel':
    case 'search':
    case 'time':
    case 'datetime-local':
    case 'month':
    case 'week':
      return <TextInputElement {...commonProps} />;
    
    case 'number':
      return <NumberInputElement {...commonProps} />;
    
    case 'textarea':
      return <TextareaElement {...commonProps} />;
    
    case 'checkbox':
      return <CheckboxElement {...commonProps} />;
    
    case 'radio':
      return <RadioGroupElement {...commonProps} />;
    
    case 'select':
      return <SelectElement {...commonProps} />;
    
    case 'range':
      return <RangeElement {...commonProps} />;
    
    case 'date':
      return <DatePickerElement {...commonProps} />;
    
    default:
      return <TextInputElement {...commonProps} />;
  }
};

const GridStackCanvas = forwardRef<GridStackCanvasRef, GridStackCanvasProps>(({
  fields,
  formData,
  onFieldsChange,
  onFormDataChange,
  onEditField,
  onDeleteField,
}, ref) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);
  const itemRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});
  const dragStopTimerRef = useRef<number | null>(null);

  // Create refs for all fields
  itemRefs.current = {};
  fields.forEach(({ id }) => {
    itemRefs.current[id] = itemRefs.current[id] || React.createRef<HTMLDivElement>();
  });

  // Expose addElement method - like addNewWidget in the example
  useImperativeHandle(ref, () => ({
    addElement: (item: PaletteItem) => {
      if (!gridInstanceRef.current) return;

      elementCounter++;
      const fieldId = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sizes = getDefaultSizes(item.type);
      
      const newField: GridFieldConfig = {
        id: fieldId,
        name: `${item.type}_${elementCounter}`,
        type: item.type as FieldType,
        label: item.label,
        options: '',
        required: false,
        x: 0,
        y: 0,
        w: sizes.w,
        h: sizes.h,
      };

      // Add to React state - React will render it in the template
      onFieldsChange([...fields, newField]);
    }
  }), [fields, onFieldsChange]);

  // Initialize GridStack once - like componentDidMount
  useLayoutEffect(() => {
    if (!gridRef.current || gridInstanceRef.current) return;

    const grid = GridStack.init({
      cellHeight: "6rem",
      minRow: 1,
      float: true
    }, gridRef.current);

    gridInstanceRef.current = grid;

    // Handle dragstop event - like in the example
    grid.on('dragstop', (event: Event, element: any) => {
      const node = element.gridstackNode;
      if (node) {
        console.log(`Dragged node #${node.id} to ${node.x},${node.y}`);
        
        // Update state with new position
        const existingField = fields.find(f => f.id === node.id);
        if (existingField) {
          const updatedFields = fields.map(f => 
            f.id === node.id 
              ? { ...f, x: node.x, y: node.y }
              : f
          );
          onFieldsChange(updatedFields);
        }

        // Clear previous timeout if exists
        if (dragStopTimerRef.current !== null) {
          window.clearTimeout(dragStopTimerRef.current);
        }

        // Optional: You can add info state here if needed
        // For now, we just log and update state
      }
    });

    // Handle removed event
    grid.on('removed', (ev: Event, gsItems: any[]) => {
      const deletedIds = gsItems.map((item: any) => {
        const el = item.el || item;
        return el?.getAttribute?.('gs-id') || el?.gridstackNode?.id;
      }).filter(Boolean);

      const updatedFields = fields.filter(f => !deletedIds.includes(f.id));
      onFieldsChange(updatedFields);
    });

    // Cleanup on unmount
    return () => {
      if (dragStopTimerRef.current !== null) {
        window.clearTimeout(dragStopTimerRef.current);
      }
    };
  }, []);

  // Update GridStack when fields change - like the controlled example
  useLayoutEffect(() => {
    if (!gridInstanceRef.current) return;

    const grid = gridInstanceRef.current;
    const layout = fields.map((a) => {
      const ref = itemRefs.current[a.id].current;
      if (ref && (ref as any).gridstackNode) {
        // Use existing node
        return (ref as any).gridstackNode;
      }
      // New item - pass element reference
      return {
        ...a,
        el: ref
      };
    });

    (grid as any)._ignoreCB = true;
    grid.load(layout);
    delete (grid as any)._ignoreCB;

    // Ensure new items are made into widgets
    requestAnimationFrame(() => {
      fields.forEach((field) => {
        const ref = itemRefs.current[field.id].current;
        if (ref && !(ref as any).gridstackNode) {
          grid.makeWidget(ref);
        }2
      });
    });
  }, [fields, onFieldsChange]);

  const handleValueChange = useCallback((fieldName: string, value: any) => {
    onFormDataChange({ ...formData, [fieldName]: value });
  }, [formData, onFormDataChange]);

  return (
    <div className="gridstack-canvas-wrapper">
      {fields.length === 0 && (
        <div className="canvas-empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="8" width="48" height="48" rx="4" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4"/>
            <path d="M32 24v16M24 32h16" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h4>Empty Canvas</h4>
          <p>Click the + button next to form elements to add them to the canvas</p>
        </div>
      )}
      <div ref={gridRef} className="grid-stack" id="grid-stack">
        {/* Render items directly - React manages content, GridStack manages layout */}
        {fields.map((field) => (
          <div
            key={field.id}
            ref={itemRefs.current[field.id]}
            className="grid-stack-item"
            gs-id={field.id}
            gs-w={field.w}
            gs-h={field.h}
            gs-x={field.x}
            gs-y={field.y}
          >
            <div className="grid-stack-item-content">
              <FieldItem
                field={field}
                formData={formData}
                onValueChange={handleValueChange}
                onEdit={() => onEditField(field)}
                onDelete={() => onDeleteField(field.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

GridStackCanvas.displayName = 'GridStackCanvas';

export default GridStackCanvas;
