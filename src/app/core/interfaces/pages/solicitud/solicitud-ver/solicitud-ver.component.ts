import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { SolicitudPanelComponent } from '../solicitud-panel/solicitud-panel.component';
import { LocalSolicitudService } from '../../../../services/local-data-container.service';
import { Solicitud } from '../../../../domain/solicitud.model';
import { FichaTrabajo } from '../../../../domain/ficha-trabajo.model';
import { TipoVivienda } from '../../../../domain/tipo-vivienda.model';
import { DetalleEconomico } from '../../../../domain/detalle-economico.model';

@Component({
  selector: 'app-solicitud-ver',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    SolicitudPanelComponent
  ],
  providers: [MessageToastService],
  templateUrl: './solicitud-ver.component.html',
  styleUrl: './solicitud-ver.component.scss'
})
export class SolicitudVerComponent implements OnInit {
  solicitud: Solicitud | null = null;
  fichaTrabajo: FichaTrabajo | null = null;
  solicitudId: number | null = null;
  loading: boolean = true;

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
        this.loadSolicitud();
      } else {
        this.messageService.errorMessageToast('Error', 'ID de solicitud no válido');
        this.router.navigate(['/solicitudes']);
      }
    });
  }

  loadSolicitud(): void {
    this.loading = true;

    // Cargar datos iniciales del servicio
    this.solicitudService.loadInitialData();

    // Buscar la solicitud por ID
    setTimeout(() => {
      const solicitudes = this.solicitudService.data();
      this.solicitud = solicitudes.find(s => s.id === this.solicitudId) || null;

      if (!this.solicitud) {
        this.messageService.errorMessageToast('Error', 'Solicitud no encontrada');
        this.router.navigate(['/solicitudes']);
        return;
      }

      // Crear la ficha de trabajo a partir de la solicitud
      this.fichaTrabajo = this.convertirSolicitudAFichaTrabajo(this.solicitud);

      this.loading = false;
      console.log('✅ Solicitud cargada para visualización:', this.solicitud);
      console.log('✅ Ficha de trabajo creada para visualización:', this.fichaTrabajo);

      // Verificar específicamente los datos de actividad económica
      if (this.fichaTrabajo.detalleEconomico) {
        console.log('✅ Detalle económico en ficha de trabajo:');
        console.log('- Negocio:', this.fichaTrabajo.detalleEconomico.negocio);
        console.log('- Ingreso dependiente:', this.fichaTrabajo.detalleEconomico.ingreso_dependiente);
      } else {
        console.log('❌ No hay detalle económico en la ficha de trabajo');
      }
    }, 500);
  }

  /**
   * Regresa a la lista de solicitudes
   */
  goBack(): void {
    this.router.navigate(['/solicitudes']);
  }

  /**
   * Navega al modo de edición
   */
  editSolicitud(): void {
    if (this.solicitud) {
      this.router.navigate(['/solicitudes/editar', this.solicitud.id]);
    }
  }

  /**
   * Maneja los mensajes del panel de solicitud (no debería emitir nada en modo visualización)
   */
  handleSwitchMessage(message: string): void {
    console.log('Mensaje recibido en modo visualización (no debería pasar):', message);
  }

  /**
   * Obtiene el icono correspondiente al estado de V° Gerencia
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
   * Obtiene el color correspondiente al estado de V° Gerencia
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
   * Obtiene la etiqueta correspondiente al estado de V° Gerencia
   * @param estado El estado de V° Gerencia
   * @returns La etiqueta del estado
   */
  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobado':
        return 'Aprobado';
      case 'observado':
        return 'Observado';
      case 'denegado':
        return 'Denegado';
      default:
        return 'Sin estado';
    }
  }

  /**
   * Convierte una solicitud en una ficha de trabajo para visualización
   * @param solicitud La solicitud a convertir
   * @returns La ficha de trabajo correspondiente
   */
  private convertirSolicitudAFichaTrabajo(solicitud: Solicitud): FichaTrabajo {
    return {
      id: solicitud.id,
      cliente: {
        id: 0,
        apellidos: '',
        nombres: solicitud.cliente || '',
        dni: '',
        fecha_born: '',
        estado_civil: '',
        edad: 0,
        genero: '',
        direccion: '',
        celular: 0,
        n_referencial: 0,
        grado_instruccion: '',
        email: '',
        tipo_vivienda: { id: 0, descripcion: '' }
      },
      aval: null,
      conyuge: null,
      referencia_familiar: solicitud.referencia_familiar || null,
      credito_anterior: solicitud.credito_anterior || null,
      gasto_financieros: solicitud.gasto_financiero ? [solicitud.gasto_financiero] : null,
      ingreso_adicional: solicitud.ingreso_adicional || null,
      puntaje_sentinel: solicitud.puntaje_sentinel || null,
      detalleEconomico: {
        negocio: solicitud.negocio || null,
        ingreso_dependiente: solicitud.ingreso_dependiente || null
      }
    };
  }
}
