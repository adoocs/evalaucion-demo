import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { SolicitudPanelComponent } from '../solicitud-panel/solicitud-panel.component';
import { LocalSolicitudService } from '../../../../services/local-data-container.service';

import { Solicitud } from '../../../../domain/solicitud.model';
import { FichaTrabajo } from '../../../../domain/ficha-trabajo.model';

@Component({
  selector: 'app-solicitud-editar',
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
    ProgressSpinnerModule,
    SolicitudPanelComponent
  ],
  providers: [MessageService, MessageToastService, ConfirmationService],
  template: `
    <p-toast />
    <div class="card" *ngIf="!loading">
      <div class="flex justify-between items-center mb-4">
        <h5>Editar Solicitud #{{ solicitud?.n_credito }}</h5>
        <p-button
          label="Volver"
          icon="pi pi-arrow-left"
          severity="secondary"
          [outlined]="true"
          (click)="volver()"
        />
      </div>

      <app-solicitud-panel
        #solicitudPanel
        [solicitud]="solicitud!"
        [fichaTrabajo]="fichaTrabajo!"
        [modoEdicion]="true"
        (switchMessage)="handleSwitchMessage($event)"
      />
    </div>

    <div class="card text-center" *ngIf="loading">
      <p-progressSpinner />
      <p class="mt-3">Cargando datos de la solicitud...</p>
    </div>

    <div class="card text-center" *ngIf="error">
      <i class="pi pi-exclamation-triangle text-red-500 text-4xl mb-3"></i>
      <h5 class="text-red-500">Error al cargar los datos</h5>
      <p class="mb-4">{{ error }}</p>
      <p-button
        label="Volver a intentar"
        icon="pi pi-refresh"
        (click)="cargarDatos()"
      />
      <p-button
        label="Volver"
        icon="pi pi-arrow-left"
        severity="secondary"
        [outlined]="true"
        class="ml-2"
        (click)="volver()"
      />
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
export class SolicitudEditarComponent implements OnInit {
  @ViewChild('solicitudPanel') solicitudPanel!: SolicitudPanelComponent;

  solicitud: Solicitud | null = null;
  fichaTrabajo: FichaTrabajo | null = null;
  loading: boolean = true;
  error: string | null = null;
  solicitudId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: LocalSolicitudService,
    private messageService: MessageToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.solicitudId = +params['id'];
      if (this.solicitudId) {
        this.cargarDatos();
      } else {
        this.error = 'ID de solicitud no válido';
        this.loading = false;
      }
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;

    // Cargar datos iniciales del servicio
    this.solicitudService.loadInitialData();

    // Buscar la solicitud por ID
    setTimeout(() => {
      const solicitudes = this.solicitudService.data();
      this.solicitud = solicitudes.find(s => s.id === this.solicitudId) || null;

      if (!this.solicitud) {
        this.error = 'No se pudo cargar la solicitud. Verifique que el ID sea correcto.';
        this.loading = false;
        return;
      }

      // Usar directamente la ficha de trabajo de la solicitud
      this.fichaTrabajo = this.solicitud.fichaTrabajo || null;

      if (!this.fichaTrabajo) {
        this.error = 'No se encontró información de la ficha de trabajo en la solicitud';
        this.loading = false;
        return;
      }

      this.loading = false;
      console.log('✅ Solicitud y ficha de trabajo cargadas para edición:', this.solicitud);

      const nombreCliente = this.fichaTrabajo.cliente ?
        `${this.fichaTrabajo.cliente.nombres} ${this.fichaTrabajo.cliente.apellidos}` :
        'Cliente';

      this.messageService.infoMessageToast(
        'Datos cargados',
        `Se han cargado los datos de la solicitud y la ficha de trabajo para ${nombreCliente}.`
      );
    }, 500);
  }

  // MÉTODOS OBSOLETOS ELIMINADOS
  // Ya no necesitamos cargar fichas por separado porque ahora están integradas en la solicitud
  // Los métodos cargarFichaPorCliente, obtenerDniPorNombre y crearFichaBasica han sido eliminados

  /**
   * Maneja los mensajes emitidos por el componente SolicitudPanel
   * @param message El mensaje emitido
   */
  handleSwitchMessage(message: string): void {
    console.log('Mensaje recibido del panel de solicitud:', message);

    switch (message) {
      case 'edit':
        // La solicitud ya fue actualizada en el panel, navegar inmediatamente
        console.log('Solicitud actualizada exitosamente, navegando a la lista');
        this.router.navigate(['/solicitudes']);
        break;
      case 'error':
        this.messageService.errorMessageToast('Error', 'No se pudo completar la acción');
        break;
      default:
        break;
    }
  }

  // MÉTODO OBSOLETO ELIMINADO
  // La actualización ahora se maneja directamente en el componente SolicitudPanel
  // que tiene acceso directo a la estructura correcta del modelo Solicitud

  volver(): void {
    this.router.navigate(['/solicitudes']);
  }
}
