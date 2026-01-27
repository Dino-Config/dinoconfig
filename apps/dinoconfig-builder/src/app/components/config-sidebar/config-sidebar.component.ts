import { Component, input, output, signal, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfigDefinition } from '../../models/config.models';
import { ConfigModalComponent } from '../config-modal/config-modal.component';

@Component({
  selector: 'dc-config-sidebar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './config-sidebar.component.html',
  styleUrl: './config-sidebar.component.scss'
})
export class ConfigSidebarComponent {
  private dialog = inject(MatDialog);

  configDefinitions = input.required<ConfigDefinition[]>();
  selectedDefinitionId = input<number | null>(null);

  selected = output<number | null>();
  deleted = output<number>();
  renamed = output<number>();
  created = output<string>();

  expandedId = signal<number | null>(null);

  onSelect(id: number): void {
    this.selected.emit(id);
  }

  onDelete(id: number): void {
    this.deleted.emit(id);
  }

  onRename(id: number): void {
    this.renamed.emit(id);
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(ConfigModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.name) {
        this.created.emit(result.name);
      }
    });
  }

  toggleExpanded(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
}

