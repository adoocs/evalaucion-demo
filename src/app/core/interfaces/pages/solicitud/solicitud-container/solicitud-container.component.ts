import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, HostListener } from '@angular/core';
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
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SolicitudPanelComponent } from '../solicitud-panel/solicitud-panel.component';
import { LocalSolicitudService } from '../../../../services/local-data-container.service';
import { Solicitud } from '../../../../domain/solicitud.model';
import { PrintService } from '../../../../services/print.service';

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
    TagModule,
    BadgeModule,
    RadioButtonModule,
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
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Aprobado', value: 'aprobado' },
    { label: 'Observado', value: 'observado' },
    { label: 'Denegado', value: 'denegado' }
  ];

  // Propiedades para el diálogo de evaluación
  mostrarDialogoEvaluacion: boolean = false;
  solicitudSeleccionadaEvaluacion: Solicitud | null = null;
  tipoEvaluacionSeleccionado: string | null = null;

  // Propiedades para el diálogo de impresión
  mostrarDialogoImpresion: boolean = false;
  solicitudSeleccionadaImpresion: Solicitud | null = null;
  tipoImpresionSeleccionado: string = '';
  formatoDescargaSeleccionado: string = 'pdf';

  constructor(
    private solicitudService: LocalSolicitudService,
    private messageService: MessageToastService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private printService: PrintService
  ) {}

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  /**
   * Maneja el evento beforeunload para advertir al usuario antes de recargar/cerrar la página
   * @param event El evento beforeunload
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event: BeforeUnloadEvent): void {
    // Solo mostrar advertencia si hay datos cargados
    if (this.solicitudes().length > 0) {
      event.preventDefault();
      event.returnValue = '⚠️ Los datos se perderán si recarga la página. ¿Está seguro de que desea continuar?';
    }
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

      this.messageService.successMessageToast(
        'Lista Actualizada',
        'La lista de solicitudes ha sido actualizada correctamente.'
      );
    }, 1000);
  }

  openNew(): void {
    this.router.navigate(['/solicitudes/crear']);
  }

  editSolicitud(solicitud: Solicitud): void {
    this.router.navigate(['/solicitudes/editar', solicitud.id]);
  }

  /**
   * Muestra los detalles de una solicitud en modo solo lectura
   * @param solicitud La solicitud a mostrar
   */
  viewSolicitud(solicitud: Solicitud): void {
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
      case 'pendiente':
        return 'pi pi-clock';
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
      case 'pendiente':
        return '#3b82f6'; // Azul
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
   * Obtiene la severidad de PrimeNG para el estado
   * @param estado El estado de V° Gerencia
   * @returns La severidad para p-tag
   */
  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (estado) {
      case 'pendiente':
        return 'info';      // Azul
      case 'aprobado':
        return 'success';   // Verde
      case 'observado':
        return 'warn';      // Amarillo
      case 'denegado':
        return 'danger';    // Rojo
      default:
        return 'secondary'; // Gris
    }
  }

  /**
   * Variable para controlar qué solicitud tiene el menú abierto
   */
  solicitudMenuAbierto: Solicitud | null = null;

  /**
   * Variable para controlar qué solicitud tiene el menú de acciones abierto
   */
  solicitudMenuAcciones: Solicitud | null = null;

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
  }

  /**
   * Abre el diálogo para aplicar evaluación según el tipo de actividad económica
   * @param solicitud La solicitud para la cual aplicar evaluación
   */
  abrirDialogoEvaluacion(solicitud: Solicitud): void {
    this.solicitudSeleccionadaEvaluacion = solicitud;

    // Detectar automáticamente el tipo de evaluación según la actividad económica
    const tipoEvaluacion = this.detectarTipoEvaluacion(solicitud);

    if (!tipoEvaluacion) {
      this.messageService.warnMessageToast(
        'Advertencia',
        'No se puede determinar el tipo de evaluación. La solicitud debe tener datos de Negocio o Ingreso Dependiente.'
      );
      return;
    }

    this.tipoEvaluacionSeleccionado = tipoEvaluacion;
    this.mostrarDialogoEvaluacion = true;

    console.log('Abriendo diálogo de evaluación para solicitud:', solicitud.n_credito, 'Tipo:', tipoEvaluacion);
  }

  /**
   * Detecta el tipo de evaluación basado en la actividad económica de la solicitud
   * @param solicitud La solicitud a evaluar
   * @returns 'micro' si tiene negocio, 'consumo' si tiene ingreso dependiente, null si no tiene ninguno
   */
  private detectarTipoEvaluacion(solicitud: Solicitud): 'micro' | 'consumo' | null {
    // Si tiene datos de negocio -> Evaluación Micro
    if (solicitud.fichaTrabajo?.detalleEconomico?.negocio) {
      return 'micro';
    }

    // Si tiene datos de ingreso dependiente -> Evaluación Consumo
    if (solicitud.fichaTrabajo?.detalleEconomico?.ingreso_dependiente) {
      return 'consumo';
    }

    // Si no tiene ninguno de los dos
    return null;
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

    // Cerrar el diálogo
    this.cerrarDialogoEvaluacion();

    // Mostrar mensaje de confirmación
    const tipoLabel = this.getNombreEvaluacion();
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

  /**
   * Obtiene el título del diálogo de evaluación
   */
  getTituloEvaluacion(): string {
    if (!this.tipoEvaluacionSeleccionado) return 'Aplicar Evaluación';
    return this.tipoEvaluacionSeleccionado === 'micro' ? 'Aplicar Evaluación Micro' : 'Aplicar Evaluación Consumo';
  }

  /**
   * Obtiene la actividad económica de la solicitud seleccionada
   */
  getActividadEconomica(): string {
    if (!this.solicitudSeleccionadaEvaluacion) return '';

    const negocio = this.solicitudSeleccionadaEvaluacion.fichaTrabajo?.detalleEconomico?.negocio;
    if (negocio?.actividad_economica?.descripcion) {
      return negocio.actividad_economica.descripcion;
    }

    const ingresoDep = this.solicitudSeleccionadaEvaluacion.fichaTrabajo?.detalleEconomico?.ingreso_dependiente;
    if (ingresoDep?.actividad) {
      return ingresoDep.actividad;
    }

    return 'No especificada';
  }

  /**
   * Obtiene el icono correspondiente al tipo de evaluación
   */
  getIconoEvaluacion(): string {
    return this.tipoEvaluacionSeleccionado === 'micro' ? 'pi pi-building' : 'pi pi-shopping-cart';
  }

  /**
   * Obtiene el color correspondiente al tipo de evaluación
   */
  getColorEvaluacion(): string {
    return this.tipoEvaluacionSeleccionado === 'micro' ? '#10b981' : '#06b6d4'; // Verde para Micro, Celeste para Consumo
  }

  /**
   * Obtiene el nombre del tipo de evaluación
   */
  getNombreEvaluacion(): string {
    return this.tipoEvaluacionSeleccionado === 'micro' ? 'Evaluación Micro' : 'Evaluación Consumo';
  }

  /**
   * Obtiene la descripción del tipo de evaluación
   */
  getDescripcionEvaluacion(): string {
    return this.tipoEvaluacionSeleccionado === 'micro'
      ? 'Para microempresas y negocios'
      : 'Para créditos de consumo personal';
  }

  /**
   * Obtiene las características del tipo de evaluación
   */
  getCaracteristicasEvaluacion(): string[] {
    if (this.tipoEvaluacionSeleccionado === 'micro') {
      return [
        'Análisis del flujo de caja del negocio',
        'Evaluación de la actividad económica',
        'Capacidad de generación de ingresos',
        'Análisis de gastos operativos'
      ];
    } else {
      return [
        'Análisis de capacidad de pago',
        'Evaluación de ingresos familiares',
        'Historial crediticio personal',
        'Evaluación de gastos financieros'
      ];
    }
  }

  /**
   * Obtiene el color de fondo para el header de la solicitud
   */
  getColorFondoHeader(): string {
    return this.tipoEvaluacionSeleccionado === 'micro' ? '#ecfdf5' : '#cffafe'; // Fondo verde claro para Micro, celeste claro para Consumo
  }

  /**
   * Obtiene el color del borde para el header de la solicitud
   */
  getColorBordeHeader(): string {
    return this.tipoEvaluacionSeleccionado === 'micro' ? '#bbf7d0' : '#a5f3fc'; // Borde verde para Micro, celeste para Consumo
  }

  /**
   * Obtiene la clase CSS para el tipo de evaluación
   */
  getClaseEvaluacion(): string {
    return this.tipoEvaluacionSeleccionado === 'micro' ? 'evaluacion-micro' : 'evaluacion-consumo';
  }

  /**
   * Obtiene la severidad del botón para PrimeNG
   */
  getSeveridadBoton(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.tipoEvaluacionSeleccionado === 'micro' ? 'success' : 'info'; // Verde para Micro, Celeste para Consumo
  }

  /**
   * Detecta el tipo de evaluación para una solicitud específica (para usar en la tabla)
   * @param solicitud La solicitud a evaluar
   * @returns 'micro' si tiene negocio, 'consumo' si tiene ingreso dependiente, null si no tiene ninguno
   */
  getTipoEvaluacionSolicitud(solicitud: Solicitud): 'micro' | 'consumo' | null {
    if (solicitud.fichaTrabajo?.detalleEconomico?.negocio) {
      return 'micro';
    }
    if (solicitud.fichaTrabajo?.detalleEconomico?.ingreso_dependiente) {
      return 'consumo';
    }
    return null;
  }

  /**
   * Obtiene el color del botón de evaluación para una solicitud específica
   * @param solicitud La solicitud
   * @returns El color correspondiente
   */
  getColorBotonEvaluacion(solicitud: Solicitud): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const tipo = this.getTipoEvaluacionSolicitud(solicitud);
    if (tipo === 'micro') return 'success'; // Verde para Micro
    if (tipo === 'consumo') return 'info';  // Celeste para Consumo
    return 'secondary';
  }

  /**
   * Obtiene el icono del botón de evaluación para una solicitud específica
   * @param solicitud La solicitud
   * @returns El icono correspondiente
   */
  getIconoBotonEvaluacion(solicitud: Solicitud): string {
    const tipo = this.getTipoEvaluacionSolicitud(solicitud);
    if (tipo === 'micro') return 'pi pi-building';
    if (tipo === 'consumo') return 'pi pi-shopping-cart';
    return 'pi pi-chart-line';
  }

  /**
   * Obtiene el tooltip del botón de evaluación para una solicitud específica
   * @param solicitud La solicitud
   * @returns El texto del tooltip
   */
  getTooltipEvaluacion(solicitud: Solicitud): string {
    const tipo = this.getTipoEvaluacionSolicitud(solicitud);
    if (tipo === 'micro') return 'Aplicar Evaluación Micro';
    if (tipo === 'consumo') return 'Aplicar Evaluación Consumo';
    return 'Sin actividad económica definida';
  }

  /**
   * Obtiene la etiqueta del botón de evaluación para una solicitud específica
   * @param solicitud La solicitud
   * @returns La etiqueta del botón
   */
  getLabelEvaluacion(solicitud: Solicitud): string {
    const tipo = this.getTipoEvaluacionSolicitud(solicitud);
    if (tipo === 'micro') return 'MICRO';
    if (tipo === 'consumo') return 'CONSUMO';
    return 'EVALUAR';
  }

  /**
   * Obtiene el tag de tipo de evaluación para mostrar en la tabla
   * @param solicitud La solicitud
   * @returns Objeto con la información del tag
   */
  getTagEvaluacion(solicitud: Solicitud): {label: string, severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary', icon: string} {
    const tipo = this.getTipoEvaluacionSolicitud(solicitud);
    if (tipo === 'micro') {
      return {
        label: 'MICRO',
        severity: 'success', // Verde para Micro
        icon: 'pi pi-building'
      };
    }
    if (tipo === 'consumo') {
      return {
        label: 'CONSUMO',
        severity: 'info', // Celeste para Consumo
        icon: 'pi pi-shopping-cart'
      };
    }
    return {
      label: 'SIN DEFINIR',
      severity: 'secondary',
      icon: 'pi pi-question-circle'
    };
  }

  /**
   * Obtiene el color de la barra indicadora para una solicitud
   * @param solicitud La solicitud
   * @returns El color de la barra
   */
  getColorBarra(solicitud: Solicitud): string {
    const tipo = this.getTipoEvaluacionSolicitud(solicitud);
    if (tipo === 'micro') return '#10b981'; // Verde para Micro
    if (tipo === 'consumo') return '#06b6d4'; // Celeste para Consumo
    return '#9ca3af'; // Gris para sin definir
  }

  /**
   * Confirma la eliminación de una solicitud
   * @param solicitud La solicitud a eliminar
   */
  confirmarEliminarSolicitud(solicitud: Solicitud): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la solicitud N° ${solicitud.n_credito}?<br><br>
                <strong>Cliente:</strong> ${this.getNombreCliente(solicitud)}<br>
                <strong>Monto:</strong> ${solicitud.monto.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}<br><br>
                <span style="color: #dc2626; font-weight: 600;">Esta acción no se puede deshacer.</span>`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.eliminarSolicitud(solicitud);
      }
    });
  }

  /**
   * Elimina una solicitud de la lista
   * @param solicitud La solicitud a eliminar
   */
  private eliminarSolicitud(solicitud: Solicitud): void {
    // Obtener la lista actual
    const solicitudesActuales = this.solicitudes();

    // Filtrar la solicitud a eliminar
    const solicitudesActualizadas = solicitudesActuales.filter(s => s.id !== solicitud.id);

    // Actualizar la señal
    this.solicitudes.set(solicitudesActualizadas);

    // Mostrar mensaje de éxito
    this.messageService.successMessageToast(
      'Solicitud Eliminada',
      `La solicitud N° ${solicitud.n_credito} de ${this.getNombreCliente(solicitud)} ha sido eliminada exitosamente.`
    );

    console.log('Solicitud eliminada:', {
      id: solicitud.id,
      n_credito: solicitud.n_credito,
      cliente: this.getNombreCliente(solicitud)
    });

    // TODO: Aquí se implementaría la llamada al servicio para eliminar de la base de datos
    // Ejemplo: this.solicitudService.delete(solicitud.id).subscribe(...)
  }

  /**
   * Obtiene el número de solicitudes pendientes
   * @returns Número de solicitudes pendientes
   */
  getSolicitudesPendientes(): number {
    return this.solicitudes().filter(s => s.v_gerencia === 'pendiente').length;
  }

  /**
   * Obtiene el número de solicitudes aprobadas
   * @returns Número de solicitudes aprobadas
   */
  getSolicitudesAprobadas(): number {
    return this.solicitudes().filter(s => s.v_gerencia === 'aprobado').length;
  }

  /**
   * Obtiene el número de solicitudes observadas o denegadas
   * @returns Número de solicitudes observadas o denegadas
   */
  getSolicitudesObservadasDenegadas(): number {
    return this.solicitudes().filter(s => s.v_gerencia === 'observado' || s.v_gerencia === 'denegado').length;
  }

  // ==================== MÉTODOS DE IMPRESIÓN ====================

  /**
   * Abre el diálogo de impresión para una solicitud
   * @param solicitud La solicitud a imprimir
   */
  abrirDialogoImpresion(solicitud: Solicitud): void {
    this.solicitudSeleccionadaImpresion = solicitud;
    this.tipoImpresionSeleccionado = '';
    this.formatoDescargaSeleccionado = 'pdf';
    this.mostrarDialogoImpresion = true;

    console.log('Abriendo diálogo de impresión para solicitud:', solicitud.n_credito);
  }

  /**
   * Cierra el diálogo de impresión
   */
  cerrarDialogoImpresion(): void {
    this.mostrarDialogoImpresion = false;
    this.solicitudSeleccionadaImpresion = null;
    this.tipoImpresionSeleccionado = '';
    this.formatoDescargaSeleccionado = 'pdf';

    console.log('Diálogo de impresión cerrado');
  }

  /**
   * Selecciona el tipo de impresión
   * @param tipo El tipo de impresión seleccionado
   */
  seleccionarTipoImpresion(tipo: string): void {
    this.tipoImpresionSeleccionado = tipo;
    console.log('Tipo de impresión seleccionado:', tipo);
  }

  /**
   * Procesa la impresión según las opciones seleccionadas
   */
  procesarImpresion(): void {
    if (!this.solicitudSeleccionadaImpresion || !this.tipoImpresionSeleccionado) {
      this.messageService.warnMessageToast('Advertencia', 'Debe seleccionar un tipo de impresión');
      return;
    }

    const solicitud = this.solicitudSeleccionadaImpresion;

    try {
      if (this.formatoDescargaSeleccionado === 'pdf') {
        this.generarPDF(solicitud, this.tipoImpresionSeleccionado);
      } else {
        this.abrirEnNuevaVentana(solicitud, this.tipoImpresionSeleccionado);
      }

      // Cerrar el diálogo
      this.cerrarDialogoImpresion();

      // Mostrar mensaje de éxito
      const tipoLabel = this.getTipoImpresionLabel(this.tipoImpresionSeleccionado);
      const formatoLabel = this.formatoDescargaSeleccionado === 'pdf' ? 'PDF descargado' : 'Abierto en nueva ventana';

      this.messageService.successMessageToast(
        'Impresión Procesada',
        `${tipoLabel} - ${formatoLabel} exitosamente`
      );

    } catch (error) {
      console.error('Error al procesar impresión:', error);
      this.messageService.errorMessageToast(
        'Error de Impresión',
        'No se pudo procesar la impresión. Inténtelo nuevamente.'
      );
    }
  }

  /**
   * Genera un PDF según el tipo seleccionado
   * @param solicitud La solicitud a imprimir
   * @param tipo El tipo de impresión
   */
  private generarPDF(solicitud: Solicitud, tipo: string): void {
    switch (tipo) {
      case 'solicitud':
        this.printService.generarPDFSolicitud(solicitud);
        break;
      case 'evaluacion':
        this.printService.generarPDFEvaluacion(solicitud);
        break;
      case 'completo':
        this.printService.generarPDFCompleto(solicitud);
        break;
      default:
        throw new Error('Tipo de impresión no válido');
    }
  }

  /**
   * Abre el documento en una nueva ventana
   * @param solicitud La solicitud a imprimir
   * @param tipo El tipo de impresión
   */
  private abrirEnNuevaVentana(solicitud: Solicitud, tipo: string): void {
    let htmlContent: string;

    switch (tipo) {
      case 'solicitud':
        htmlContent = this.printService.generarHTMLSolicitud(solicitud);
        break;
      case 'evaluacion':
        htmlContent = this.printService.generarHTMLEvaluacion(solicitud);
        break;
      case 'completo':
        htmlContent = this.printService.generarHTMLCompleto(solicitud);
        break;
      default:
        throw new Error('Tipo de impresión no válido');
    }

    // Abrir en nueva ventana
    const nuevaVentana = window.open('', '_blank');
    if (nuevaVentana) {
      nuevaVentana.document.write(htmlContent);
      nuevaVentana.document.close();
    } else {
      throw new Error('No se pudo abrir la nueva ventana. Verifique que no esté bloqueada por el navegador.');
    }
  }

  /**
   * Obtiene la etiqueta del tipo de impresión
   * @param tipo El tipo de impresión
   * @returns La etiqueta correspondiente
   */
  private getTipoImpresionLabel(tipo: string): string {
    switch (tipo) {
      case 'solicitud':
        return 'Solo Solicitud';
      case 'evaluacion':
        return 'Solo Evaluación';
      case 'completo':
        return 'Documento Completo';
      default:
        return 'Documento';
    }
  }

}
