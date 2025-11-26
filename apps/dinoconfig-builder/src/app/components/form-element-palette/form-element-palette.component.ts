import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FieldType } from '../../models/config.models';

export interface PaletteItem {
  id: string;
  type: FieldType;
  label: string;
  icon: string;
}

@Component({
  selector: 'dc-form-element-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-element-palette.component.html',
  styleUrl: './form-element-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementPaletteComponent {
  @Output() addElement = new EventEmitter<PaletteItem>();

  constructor(private sanitizer: DomSanitizer) {}

  paletteItems: PaletteItem[] = [
    {
      id: 'text-input',
      type: 'text',
      label: 'Text Input',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 5.833h15M6.667 5.833V15M13.333 5.833V15M5 15h3.333M11.667 15H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'number-input',
      type: 'number',
      label: 'Number Input',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5v10M10 5v10M15 5v10M2.5 10h15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'textarea',
      type: 'textarea',
      label: 'Textarea',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M5 7h10M5 10h10M5 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'checkbox',
      type: 'checkbox',
      label: 'Checkbox',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M6 10l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      id: 'radio-group',
      type: 'radio',
      label: 'Radio Group',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="7" r="3.5" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="6" cy="7" r="1.5" fill="currentColor"/>
        <circle cx="6" cy="13" r="3.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 7h7M10 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'select-dropdown',
      type: 'select',
      label: 'Select Dropdown',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="4.5" width="15" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
        <path d="M14 6.5l-2 2-2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.5 11.5h11M4.5 14h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'date-picker',
      type: 'date',
      label: 'Date Picker',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="4.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2.5 8.5h15M6 3v3M14 3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="7" cy="12" r="0.75" fill="currentColor"/>
        <circle cx="10" cy="12" r="0.75" fill="currentColor"/>
        <circle cx="13" cy="12" r="0.75" fill="currentColor"/>
      </svg>`
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Input',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2 7l7.5 5L18 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      id: 'password',
      type: 'password',
      label: 'Password Input',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="9" width="14" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M6 9V6a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="10" cy="13" r="1" fill="currentColor"/>
      </svg>`
    },
    {
      id: 'url',
      type: 'url',
      label: 'URL Input',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12l-3 3a2.828 2.828 0 01-4-4l3-3m8-3l3-3a2.828 2.828 0 014 4l-3 3M7 13l6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      id: 'range',
      type: 'range',
      label: 'Range Slider',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
      </svg>`
    },
    {
      id: 'tel',
      type: 'tel',
      label: 'Phone Input',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 3h9A1.5 1.5 0 0116 4.5v11a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 15.5v-11A1.5 1.5 0 015.5 3zM10 14v.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    }
  ];

  onAddElement(item: PaletteItem): void {
    this.addElement.emit(item);
  }

  getSafeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }
}

