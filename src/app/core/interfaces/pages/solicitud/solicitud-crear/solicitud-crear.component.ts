import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { SolicitudPanelComponent } from '../solicitud-panel/solicitud-panel.component';
import { LocalSolicitudService } from '../../../../services/local-data-container.service';
import { LocalFichaService } from '../../../../services/local-ficha.service';
import { Solicitud } from '../../../../domain/solicitud.model';
import { FichaTrabajo } from '../../../../domain/ficha-trabajo.model';

@Component({
  selector: 'app-solicitud-crear',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    SolicitudPanelComponent
  ],
  providers: [MessageService, MessageToastService, ConfirmationService],
  template: `
    <p-toast />
    <div class="card">
      <h5>Nueva Solicitud</h5>

      <app-solicitud-panel #solicitudPanel (switchMessage)="handleSwitchMessage($event)" />
    </div>
  `,
  styles: [`
    .card {
      background: var(--surface-card);
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 1rem;
    }
  `]
})
export class SolicitudCrearComponent implements OnInit {
  @ViewChild('solicitudPanel') solicitudPanel!: SolicitudPanelComponent;

  constructor(
    private solicitudService: LocalSolicitudService,
    private fichaService: LocalFichaService,
    private messageService: MessageToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
      this.messageService.infoMessageToast(
        'Formulario de Solicitud',
        'Complete todos los campos requeridos para crear una nueva solicitud.'
      );
    }, 500);
  }

  /**
   * Maneja los mensajes emitidos por el componente SolicitudPanel
   * @param message El mensaje emitido
   */
  handleSwitchMessage(message: string): void {
    console.log('Mensaje recibido del panel de solicitud:', message);

    switch (message) {
      case 'create':
        // La solicitud ya fue guardada en el panel, navegar inmediatamente
        console.log('Solicitud creada exitosamente, navegando a la lista');
        this.router.navigate(['/solicitudes']);
        break;
      case 'edit':
        this.messageService.successMessageToast('Éxito', 'Solicitud actualizada correctamente');
        this.router.navigate(['/solicitudes']);
        break;
      case 'error':
        this.messageService.errorMessageToast('Error', 'No se pudo completar la acción');
        break;
      default:
        break;
    }
  }

  /**
   * Guarda la solicitud y la ficha de trabajo
   */
  guardarSolicitud(): void {
    if (!this.solicitudPanel) {
      this.messageService.errorMessageToast('Error', 'No se pudo acceder al formulario de solicitud');
      return;
    }

    try {
      // Obtener los datos de la solicitud y la ficha de trabajo
      const fichaTrabajo = this.solicitudPanel.getAllData();
      const solicitud = this.solicitudPanel.solicitud;

      console.log('Ficha de trabajo a guardar:', fichaTrabajo);
      console.log('Solicitud a guardar:', solicitud);

      // Guardar la ficha de trabajo
      this.fichaService.createFichaTrabajo(fichaTrabajo).subscribe({
        next: (response) => {
          console.log('Ficha de trabajo guardada:', response);

          // Guardar la solicitud
          this.solicitudService.create({
            ...solicitud,
            cliente: fichaTrabajo.cliente?.apellidos + ' ' + fichaTrabajo.cliente?.nombres,
            fecha: new Date().toISOString().split('T')[0],
            v_gerencia: 'pendiente' // ✅ Asegurar estado pendiente por defecto
          }).subscribe({
            next: (solicitudGuardada) => {
              console.log('Solicitud guardada:', solicitudGuardada);
              this.messageService.successMessageToast('Éxito', 'Solicitud creada correctamente');

              // Navegar a la lista de solicitudes
              setTimeout(() => {
                this.router.navigate(['/solicitudes']);
              }, 1500);
            },
            error: (error) => {
              console.error('Error al guardar la solicitud:', error);
              this.messageService.errorMessageToast('Error', 'No se pudo guardar la solicitud');
            }
          });
        },
        error: (error) => {
          console.error('Error al guardar la ficha de trabajo:', error);
          this.messageService.errorMessageToast('Error', 'No se pudo guardar la ficha de trabajo');
        }
      });
    } catch (error) {
      console.error('Error al procesar los datos:', error);
      this.messageService.errorMessageToast('Error', 'No se pudo procesar la solicitud');
    }
  }
}
