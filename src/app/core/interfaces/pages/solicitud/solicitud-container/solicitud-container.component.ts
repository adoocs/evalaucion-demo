import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { SolicitudPanelComponent } from '../solicitud-panel/solicitud-panel.component';
import { LocalSolicitudService } from '../../../../services/local-data-container.service';
import { Solicitud } from '../../../../domain/solicitud.model';

@Component({
  selector: 'app-solicitud-list',
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
    ToggleSwitchModule,
    OverlayPanelModule,
    TooltipModule,
    SolicitudPanelComponent
  ],
  providers: [MessageService, MessageToastService, ConfirmationService],
  templateUrl: './solicitud-container.component.html',
  styleUrl: './solicitud-container.component.scss'
})

export class SolicitudContainerComponent implements OnInit {
  solicitudes = signal<Solicitud[]>([]);
  selectedSolicitud: Solicitud | null = null;
  displaySolicitudDialog: boolean = false;
  loading: boolean = true;

  // Estados para V° Gerencia
  estadosVBGerencia = [
    { label: 'Aprobado', value: 'aprobado' },
    { label: 'Observado', value: 'observado' },
    { label: 'Denegado', value: 'denegado' }
  ];

  // Propiedades para el diálogo de evaluación
  mostrarDialogoEvaluacion: boolean = false;
  solicitudSeleccionadaEvaluacion: Solicitud | null = null;
  tipoEvaluacionSeleccionado: string | null = null;

  constructor(
    private solicitudService: LocalSolicitudService,
    private messageService: MessageToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.loading = true;
    this.solicitudService.loadInitialData();

    // Esperar un momento para simular la carga
    setTimeout(() => {
      this.solicitudes.set(this.solicitudService.data());
      this.loading = false;

      // Mostrar mensaje de bienvenida
      this.messageService.infoMessageToast(
        'Datos cargados',
        'Se han cargado las solicitudes. Esta es una versión demo con datos locales.'
      );
    }, 1000);
  }

  /**
   * Refresca la lista de solicitudes
   */
  refreshSolicitudes(): void {
    this.loading = true;

    // Esperar un momento para simular la carga
    setTimeout(() => {
      this.solicitudes.set(this.solicitudService.data());
      this.loading = false;
    }, 500);
  }

  openNew(): void {
    this.router.navigate(['/solicitudes/crear']);
  }

  editSolicitud(solicitud: Solicitud): void {
    // Navegar al componente de edición en lugar de abrir un diálogo
    this.router.navigate(['/solicitudes/editar', solicitud.id]);
  }

  /**
   * Muestra los detalles de una solicitud en modo solo lectura
   * @param solicitud La solicitud a mostrar
   */
  viewSolicitud(solicitud: Solicitud): void {
    // Navegar al componente de visualización en lugar de abrir un diálogo
    this.router.navigate(['/solicitudes/ver', solicitud.id]);
  }

  hideDialog(): void {
    this.displaySolicitudDialog = false;
    // Refrescar la lista de solicitudes al cerrar el diálogo
    this.refreshSolicitudes();
  }

  /**
   * Maneja los mensajes emitidos por el componente SolicitudPanel
   * @param message El mensaje emitido
   */
  handleSwitchMessage(message: string): void {
    console.log('Mensaje recibido del panel de solicitud:', message);

    switch (message) {
      case 'create':
        this.messageService.successMessageToast('Éxito', 'Solicitud creada correctamente');
        this.hideDialog();
        break;
      case 'edit':
        this.messageService.successMessageToast('Éxito', 'Solicitud actualizada correctamente');
        this.hideDialog();
        break;
      case 'error':
        this.messageService.errorMessageToast('Error', 'No se pudo completar la acción');
        break;
      default:
        break;
    }
  }

  /**
   * Maneja el cambio de estado de V° Gerencia
   * @param solicitud La solicitud que se está modificando
   * @param event El evento del cambio
   */
  onVBGerenciaChange(solicitud: Solicitud, event: any): void {
    console.log('Cambio de V° Gerencia:', solicitud.n_credito, 'Nuevo estado:', event.value);

    // Aquí podrías agregar lógica para guardar el cambio en la base de datos
    this.messageService.infoMessageToast(
      'Estado actualizado',
      `V° Gerencia de la solicitud ${solicitud.n_credito} cambió a: ${this.getEstadoLabel(event.value)}`
    );
  }

  /**
   * Obtiene el icono correspondiente al estado
   * @param estado El estado de V° Gerencia
   * @returns La clase del icono
   */
  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'aprobado':
        return 'pi pi-check-circle';
      case 'observado':
        return 'pi pi-exclamation-triangle';
      case 'denegado':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-question-circle';
    }
  }

  /**
   * Obtiene el color correspondiente al estado
   * @param estado El estado de V° Gerencia
   * @returns El color en formato CSS
   */
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'aprobado':
        return '#22c55e'; // Verde
      case 'observado':
        return '#f59e0b'; // Amarillo/Naranja
      case 'denegado':
        return '#ef4444'; // Rojo
      default:
        return '#6b7280'; // Gris
    }
  }

  /**
   * Obtiene la etiqueta correspondiente al estado
   * @param estado El estado de V° Gerencia
   * @returns La etiqueta del estado
   */
  getEstadoLabel(estado: string): string {
    const estadoObj = this.estadosVBGerencia.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : 'Desconocido';
  }

  /**
   * Obtiene la clase CSS para el badge del estado
   * @param estado El estado de V° Gerencia
   * @returns La clase CSS del badge
   */
  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'aprobado':
        return 'estado-aprobado';
      case 'observado':
        return 'estado-observado';
      case 'denegado':
        return 'estado-denegado';
      default:
        return 'estado-sin-estado';
    }
  }

  /**
   * Variable para controlar qué solicitud tiene el menú abierto
   */
  solicitudMenuAbierto: Solicitud | null = null;

  /**
   * Cambia el estado de una solicitud
   * @param solicitud La solicitud a modificar
   * @param nuevoEstado El nuevo estado
   * @param overlayPanel El panel overlay a cerrar
   */
  cambiarEstado(solicitud: Solicitud, nuevoEstado: string, overlayPanel: any): void {
    if (!solicitud) {
      console.error('No hay solicitud seleccionada');
      return;
    }

    const estadoAnterior = solicitud.v_gerencia || 'sin estado';
    solicitud.v_gerencia = nuevoEstado;

    // Cerrar el overlay panel
    overlayPanel.hide();
    this.solicitudMenuAbierto = null;

    // Mostrar notificación
    const estadoAnteriorLabel = estadoAnterior === 'sin estado' ? 'Sin estado' : this.getEstadoLabel(estadoAnterior);
    const nuevoEstadoLabel = this.getEstadoLabel(nuevoEstado);

    this.messageService.successMessageToast(
      'Estado actualizado',
      `V° Gerencia de la solicitud ${solicitud.n_credito} cambió de "${estadoAnteriorLabel}" a "${nuevoEstadoLabel}"`
    );

    console.log('Estado cambiado:', {
      solicitud: solicitud.n_credito,
      estadoAnterior,
      nuevoEstado
    });
  }

  /**
   * Abre el diálogo para seleccionar tipo de evaluación
   * @param solicitud La solicitud para la cual aplicar evaluación
   */
  abrirDialogoEvaluacion(solicitud: Solicitud): void {
    this.solicitudSeleccionadaEvaluacion = solicitud;
    this.tipoEvaluacionSeleccionado = null; // Resetear selección
    this.mostrarDialogoEvaluacion = true;

    console.log('Abriendo diálogo de evaluación para solicitud:', solicitud.n_credito);
  }

  /**
   * Cierra el diálogo de evaluación
   */
  cerrarDialogoEvaluacion(): void {
    this.mostrarDialogoEvaluacion = false;
    this.solicitudSeleccionadaEvaluacion = null;
    this.tipoEvaluacionSeleccionado = null;

    console.log('Diálogo de evaluación cerrado');
  }

  /**
   * Selecciona un tipo de evaluación
   * @param tipo El tipo de evaluación seleccionado
   */
  seleccionarTipoEvaluacion(tipo: string): void {
    this.tipoEvaluacionSeleccionado = tipo;

    console.log('Tipo de evaluación seleccionado:', tipo);
  }

  /**
   * Aplica la evaluación seleccionada
   */
  aplicarEvaluacion(): void {
    if (!this.solicitudSeleccionadaEvaluacion || !this.tipoEvaluacionSeleccionado) {
      this.messageService.warnMessageToast('Advertencia', 'Debe seleccionar un tipo de evaluación');
      return;
    }

    const solicitud = this.solicitudSeleccionadaEvaluacion;
    const tipoEvaluacion = this.tipoEvaluacionSeleccionado;

    // Cerrar el diálogo
    this.cerrarDialogoEvaluacion();

    // Mostrar mensaje de confirmación
    const tipoLabel = tipoEvaluacion === 'consumo' ? 'Evaluación Consumo' : 'Evaluación Micro';
    this.messageService.successMessageToast(
      'Evaluación Iniciada',
      `Se ha iniciado la ${tipoLabel} para la solicitud ${solicitud.n_credito}`
    );

    // Simular navegación a la pestaña de evaluación (por ahora solo log)
    console.log(`Navegando a ${tipoLabel} para solicitud ${solicitud.n_credito}`);

    // TODO: Aquí se implementará la navegación a la pestaña correspondiente
    // Ejemplo: this.router.navigate(['/evaluacion', tipoEvaluacion, solicitud.id]);

    // Por ahora, mostrar un mensaje informativo
    setTimeout(() => {
      this.messageService.infoMessageToast(
        'Próximamente',
        `La pestaña de ${tipoLabel} estará disponible próximamente`
      );
    }, 1500);
  }
}
