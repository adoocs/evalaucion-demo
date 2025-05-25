import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Usuario } from '../../../../domain/usuario.model';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ConfirmDialogModule
  ],
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.scss']
})
export class UsuarioListComponent {
  @Input() usuarios: Usuario[] = [];
  @Input() selectedUsuarios: Usuario[] = [];
  @Input() globalFilter: string = '';

  @Output() selectedUsuariosChange = new EventEmitter<Usuario[]>();
  @Output() newUsuario = new EventEmitter<void>();
  @Output() editUsuario = new EventEmitter<Usuario>();
  @Output() deleteUsuario = new EventEmitter<Usuario>();
  @Output() deleteSelectedUsuarios = new EventEmitter<void>();
  @Output() globalFilterChange = new EventEmitter<string>();

  roles = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Usuario', value: 'usuario' }
  ];

  onNewUsuario(): void {
    this.newUsuario.emit();
  }

  onEditUsuario(usuario: Usuario): void {
    this.editUsuario.emit(usuario);
  }

  onDeleteUsuario(usuario: Usuario): void {
    this.deleteUsuario.emit(usuario);
  }

  onDeleteSelectedUsuarios(): void {
    this.deleteSelectedUsuarios.emit();
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.globalFilter = target.value;
    this.globalFilterChange.emit(this.globalFilter);
  }

  onSelectionChange(usuarios: Usuario[]): void {
    this.selectedUsuarios = usuarios;
    this.selectedUsuariosChange.emit(this.selectedUsuarios);
  }

  getSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }

  getRolLabel(rol: string): string {
    const rolObj = this.roles.find(r => r.value === rol);
    return rolObj ? rolObj.label : rol;
  }
}
