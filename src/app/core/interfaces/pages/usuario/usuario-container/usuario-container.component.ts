import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Usuario } from '../../../../domain/usuario.model';
import { LocalUsuarioService } from '../../../../services/local-data-container.service';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { UsuarioListComponent } from '../usuario-list/usuario-list.component';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';

@Component({
  selector: 'app-usuario-container',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    UsuarioListComponent,
    UsuarioFormComponent
  ],
  providers: [ConfirmationService, MessageToastService],
  templateUrl: './usuario-container.component.html',
  styleUrls: ['./usuario-container.component.scss']
})
export class UsuarioContainerComponent implements OnInit {
  usuarios = computed(() => this.usuarioService.data());
  usuarioDialog: boolean = false;
  selectedUsuario: Usuario | null = null;
  selectedUsuarios: Usuario[] = [];
  globalFilter: string = '';
  isEdit: boolean = false;

  constructor(
    private usuarioService: LocalUsuarioService,
    private confirmationService: ConfirmationService,
    private messageService: MessageToastService
  ) {}

  ngOnInit(): void {
    this.usuarioService.loadInitialData();
  }

  // Eventos del componente lista
  onNewUsuario(): void {
    this.selectedUsuario = null;
    this.isEdit = false;
    this.usuarioDialog = true;
  }

  onEditUsuario(usuario: Usuario): void {
    this.selectedUsuario = { ...usuario };
    this.isEdit = true;
    this.usuarioDialog = true;
  }

  onDeleteUsuario(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar al usuario ${usuario.nombre} ${usuario.apellidos}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usuarioService.delete(usuario.id);
        this.messageService.successMessageToast('Éxito', 'Usuario eliminado correctamente');
      }
    });
  }

  onDeleteSelectedUsuarios(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar los usuarios seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedUsuarios.forEach(usuario => {
          this.usuarioService.delete(usuario.id);
        });
        this.selectedUsuarios = [];
        this.messageService.successMessageToast('Éxito', 'Usuarios eliminados correctamente');
      }
    });
  }

  onSelectedUsuariosChange(usuarios: Usuario[]): void {
    this.selectedUsuarios = usuarios;
  }

  onGlobalFilterChange(filter: string): void {
    this.globalFilter = filter;
  }

  // Eventos del componente formulario
  onSaveUsuario(usuario: Usuario): void {
    if (this.isEdit && usuario.id) {
      // Actualizar usuario existente
      this.usuarioService.update(usuario.id, usuario);
      this.messageService.successMessageToast('Éxito', 'Usuario actualizado correctamente');
    } else {
      // Crear nuevo usuario
      usuario.id = this.generateId();
      usuario.fecha_creacion = new Date().toISOString().split('T')[0];
      this.usuarioService.create(usuario);
      this.messageService.successMessageToast('Éxito', 'Usuario creado correctamente');
    }

    this.usuarioDialog = false;
    this.selectedUsuario = null;
  }

  onCancelForm(): void {
    this.usuarioDialog = false;
    this.selectedUsuario = null;
  }

  onDialogHide(): void {
    this.usuarioDialog = false;
    this.selectedUsuario = null;
  }

  private generateId(): number {
    const usuarios = this.usuarioService.data();
    return usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  }
}
