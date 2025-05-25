import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Usuario } from '../../../../domain/usuario.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToggleButtonModule
  ],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss']
})
export class UsuarioFormComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() usuario: Usuario | null = null;
  @Input() isEdit: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Usuario>();
  @Output() cancel = new EventEmitter<void>();

  formUsuario: Usuario = this.getEmptyUsuario();
  submitted: boolean = false;

  roles = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Usuario', value: 'usuario' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      this.formUsuario = { ...this.usuario };
    } else if (changes['visible'] && this.visible && !this.usuario) {
      this.formUsuario = this.getEmptyUsuario();
    }
  }

  onSave(): void {
    this.submitted = true;

    if (this.isFormValid()) {
      this.save.emit({ ...this.formUsuario });
      this.resetForm();
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  onHide(): void {
    this.resetForm();
    this.visibleChange.emit(false);
  }

  private isFormValid(): boolean {
    return !!(
      this.formUsuario.nombre?.trim() &&
      this.formUsuario.apellidos?.trim() &&
      this.formUsuario.email?.trim() &&
      this.formUsuario.username?.trim() &&
      this.formUsuario.rol
    );
  }

  private resetForm(): void {
    this.submitted = false;
    this.formUsuario = this.getEmptyUsuario();
  }

  private getEmptyUsuario(): Usuario {
    return {
      id: 0,
      nombre: '',
      apellidos: '',
      email: '',
      username: '',
      rol: 'usuario',
      activo: true,
      fecha_creacion: '',
      telefono: '',
      dni: ''
    };
  }

  get dialogHeader(): string {
    return this.isEdit ? 'Editar Usuario' : 'Nuevo Usuario';
  }

  get saveButtonLabel(): string {
    return this.isEdit ? 'Actualizar' : 'Crear';
  }
}
