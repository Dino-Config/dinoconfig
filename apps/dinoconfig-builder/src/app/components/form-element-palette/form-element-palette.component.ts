import { Component, EventEmitter, Output, ChangeDetectionStrategy, signal, computed } from '@angular/core';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FieldType } from '../../models/config.models';

export interface PaletteItem {
  id: string;
  type: FieldType;
  label: string;
  icon: string;
  category: 'text' | 'number' | 'choice' | 'date';
}

interface Category {
  id: 'text' | 'number' | 'choice' | 'date';
  label: string;
  icon: string;
}

@Component({
  selector: 'dc-form-element-palette',
  standalone: true,
  imports: [],
  templateUrl: './form-element-palette.component.html',
  styleUrl: './form-element-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementPaletteComponent {
  @Output() addElement = new EventEmitter<PaletteItem>();

  selectedCategory = signal<'text' | 'number' | 'choice' | 'date'>('text');

  constructor(private sanitizer: DomSanitizer) {}

  categories: Category[] = [
    { id: 'text', label: 'Text Inputs', icon: 'TT' },
    { id: 'number', label: 'Numbers', icon: '#' },
    { id: 'choice', label: 'Choices', icon: '○' },
    { id: 'date', label: 'Date & Time', icon: 'DT' },
  ];

  paletteItems: PaletteItem[] = [
    {
      id: 'text-input',
      type: 'text',
      label: 'Text Input',
      category: 'text',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 5.833h15M6.667 5.833V15M13.333 5.833V15M5 15h3.333M11.667 15H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'textarea',
      type: 'textarea',
      label: 'Textarea',
      category: 'text',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M5 7h10M5 10h10M5 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      category: 'text',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2 7l7.5 5L18 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      id: 'password',
      type: 'password',
      label: 'Password',
      category: 'text',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="9" width="14" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M6 9V6a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="10" cy="13" r="1" fill="currentColor"/>
      </svg>`
    },
    {
      id: 'url',
      type: 'url',
      label: 'URL',
      category: 'text',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12l-3 3a2.828 2.828 0 01-4-4l3-3m8-3l3-3a2.828 2.828 0 014 4l-3 3M7 13l6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      id: 'tel',
      type: 'tel',
      label: 'Phone',
      category: 'text',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 3h9A1.5 1.5 0 0116 4.5v11a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 15.5v-11A1.5 1.5 0 015.5 3zM10 14v.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'search',
      type: 'search',
      label: 'Search',
      category: 'text',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
        <path d="M14 14l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'number-input',
      type: 'number',
      label: 'Number',
      category: 'number',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5v10M10 5v10M15 5v10M2.5 10h15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'range',
      type: 'range',
      label: 'Range',
      category: 'number',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
      </svg>`
    },
    {
      id: 'checkbox',
      type: 'checkbox',
      label: 'Checkbox',
      category: 'choice',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M6 10l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      id: 'select-dropdown',
      type: 'select',
      label: 'Select',
      category: 'choice',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="4.5" width="15" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
        <path d="M14 6.5l-2 2-2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.5 11.5h11M4.5 14h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'radio-group',
      type: 'radio',
      label: 'Radio',
      category: 'choice',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="7" r="3.5" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="6" cy="7" r="1.5" fill="currentColor"/>
        <circle cx="6" cy="13" r="3.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 7h7M10 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'date-picker',
      type: 'date',
      label: 'Date',
      category: 'date',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="4.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2.5 8.5h15M6 3v3M14 3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="7" cy="12" r="0.75" fill="currentColor"/>
        <circle cx="10" cy="12" r="0.75" fill="currentColor"/>
        <circle cx="13" cy="12" r="0.75" fill="currentColor"/>
      </svg>`
    },
    {
      id: 'time-picker',
      type: 'time',
      label: 'Time',
      category: 'date',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 6v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
    {
      id: 'datetime',
      type: 'datetime',
      label: 'Date & Time',
      category: 'date',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="4.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2.5 8.5h15M6 3v3M14 3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="10" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 10v2l1.5 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`
    },
  ];

  filteredItems = computed(() => {
    return this.paletteItems.filter(item => item.category === this.selectedCategory());
  });

  selectCategory(categoryId: 'text' | 'number' | 'choice' | 'date'): void {
    this.selectedCategory.set(categoryId);
  }

  onAddElement(item: PaletteItem): void {
    this.addElement.emit(item);
  }

  getSafeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }
}

