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
    console.log('🔄 Convirtiendo solicitud a ficha de trabajo:', solicitud);

    // Buscar datos completos en los servicios mock
    const clienteCompleto = this.buscarClientePorNombre(solicitud.cliente || '');
    const avalCompleto = this.buscarAvalPorNombre(solicitud.aval || '');
    const conyugeCompleto = this.buscarConyugePorNombre(solicitud.conyugue || '');

    console.log('✅ Datos encontrados:');
    console.log('- Cliente:', clienteCompleto);
    console.log('- Aval:', avalCompleto);
    console.log('- Cónyuge:', conyugeCompleto);

    // Crear la ficha de trabajo completa
    const fichaTrabajo: FichaTrabajo = {
      id: solicitud.id,
      cliente: clienteCompleto,
      aval: avalCompleto,
      conyuge: conyugeCompleto,
      referencia_familiar: solicitud.referencia_familiar || null,
      credito_anterior: solicitud.credito_anterior || null,
      gasto_financieros: solicitud.gasto_financiero ? [solicitud.gasto_financiero] : [],
      ingreso_adicional: solicitud.ingreso_adicional || null,
      puntaje_sentinel: solicitud.puntaje_sentinel || null,
      detalleEconomico: {
        negocio: solicitud.negocio || null,
        ingreso_dependiente: solicitud.ingreso_dependiente || null
      }
    };

    console.log('✅ Ficha de trabajo completa creada:', fichaTrabajo);
    return fichaTrabajo;
  }

  /**
   * Busca un cliente por nombre en los datos mock
   */
  private buscarClientePorNombre(nombreCompleto: string): any {
    if (!nombreCompleto) return null;

    console.log('🔍 Buscando cliente para:', nombreCompleto);

    // Datos mock completos que coinciden con las solicitudes
    const CLIENTES = [
      {
        id: 1,
        apellidos: 'Pérez López',
        nombres: 'Juan Carlos',
        dni: '12345678',
        fecha_born: '15/05/1985',
        estado_civil: 'casado',
        edad: 38,
        genero: 'M',
        direccion: 'Av. Principal 123, Lima',
        celular: 987654321,
        n_referencial: 123456,
        grado_instruccion: 'universitaria',
        email: 'juan.perez@example.com',
        tipo_vivienda: { id: 1, descripcion: 'Casa propia' }
      },
      {
        id: 2,
        apellidos: 'Gómez Rodríguez',
        nombres: 'María Elena',
        dni: '87654321',
        fecha_born: '20/10/1990',
        estado_civil: 'soltero',
        edad: 33,
        genero: 'F',
        direccion: 'Jr. Secundaria 456, Lima',
        celular: 912345678,
        n_referencial: 654321,
        grado_instruccion: 'tecnica',
        email: 'maria.gomez@example.com',
        tipo_vivienda: { id: 2, descripcion: 'Casa alquilada' }
      },
      {
        id: 3,
        apellidos: 'Martínez Sánchez',
        nombres: 'Roberto',
        dni: '23456789',
        fecha_born: '12/03/1980',
        estado_civil: 'casado',
        edad: 43,
        genero: 'M',
        direccion: 'Calle Los Pinos 789, Lima',
        celular: 945678123,
        n_referencial: 789123,
        grado_instruccion: 'secundaria',
        email: 'roberto.martinez@example.com',
        tipo_vivienda: { id: 1, descripcion: 'Casa propia' }
      },
      {
        id: 4,
        apellidos: 'Torres Vega',
        nombres: 'Ana María',
        dni: '34567890',
        fecha_born: '08/07/1988',
        estado_civil: 'casado',
        edad: 35,
        genero: 'F',
        direccion: 'Av. Los Olivos 321, Lima',
        celular: 956781234,
        n_referencial: 321654,
        grado_instruccion: 'universitaria',
        email: 'ana.torres@example.com',
        tipo_vivienda: { id: 2, descripcion: 'Casa alquilada' }
      },
      {
        id: 5,
        apellidos: 'Ramírez',
        nombres: 'Carlos Eduardo',
        dni: '45678901',
        fecha_born: '25/11/1987',
        estado_civil: 'soltero',
        edad: 36,
        genero: 'M',
        direccion: 'Jr. Los Cedros 654, Lima',
        celular: 923456789,
        n_referencial: 987654,
        grado_instruccion: 'tecnica',
        email: 'carlos.ramirez@example.com',
        tipo_vivienda: { id: 1, descripcion: 'Casa propia' }
      },
      {
        id: 6,
        apellidos: 'García',
        nombres: 'Luis Fernando',
        dni: '56789012',
        fecha_born: '18/09/1982',
        estado_civil: 'casado',
        edad: 41,
        genero: 'M',
        direccion: 'Av. Las Palmeras 987, Lima',
        celular: 934567890,
        n_referencial: 876543,
        grado_instruccion: 'universitaria',
        email: 'luis.garcia@example.com',
        tipo_vivienda: { id: 2, descripcion: 'Casa alquilada' }
      }
    ];

    // Búsqueda más inteligente
    let cliente = CLIENTES.find(c =>
      `${c.nombres} ${c.apellidos}` === nombreCompleto ||
      `${c.apellidos} ${c.nombres}` === nombreCompleto
    );

    // Si no encuentra coincidencia exacta, buscar por partes
    if (!cliente) {
      cliente = CLIENTES.find(c =>
        nombreCompleto.includes(c.nombres) && nombreCompleto.includes(c.apellidos.split(' ')[0])
      );
    }

    // Si aún no encuentra, buscar solo por apellido principal
    if (!cliente) {
      cliente = CLIENTES.find(c =>
        nombreCompleto.includes(c.apellidos.split(' ')[0])
      );
    }

    console.log('✅ Cliente encontrado:', cliente, 'para nombre:', nombreCompleto);
    return cliente || null;
  }

  /**
   * Busca un aval por nombre en los datos mock
   */
  private buscarAvalPorNombre(nombreCompleto: string): any {
    if (!nombreCompleto) return null;

    console.log('🔍 Buscando aval para:', nombreCompleto);

    const AVALES = [
      {
        id: 1,
        apellidos: 'Martínez Sánchez',
        nombres: 'Roberto',
        dni: '23456789',
        direccion: 'Calle Los Pinos 789, Lima',
        celular: '945678123',
        n_referencial: 789123,
        actividad: 'Comerciante',
        parentesco: 'Hermano',
        tipo_vivienda: { id: 1, descripcion: 'Casa propia' },
        omitido: false
      },
      {
        id: 2,
        apellidos: 'Herrera Díaz',
        nombres: 'Luis Fernando',
        dni: '45678901',
        direccion: 'Jr. Las Flores 456, Lima',
        celular: '987123456',
        n_referencial: 456789,
        actividad: 'Empleado',
        parentesco: 'Amigo',
        tipo_vivienda: { id: 2, descripcion: 'Casa alquilada' },
        omitido: false
      },
      {
        id: 3,
        apellidos: 'López Torres',
        nombres: 'Carmen Rosa',
        dni: '67890123',
        direccion: 'Av. Central 321, Lima',
        celular: '956789012',
        n_referencial: 654987,
        actividad: 'Profesora',
        parentesco: 'Hermana',
        tipo_vivienda: { id: 1, descripcion: 'Casa propia' },
        omitido: false
      }
    ];

    // Búsqueda más inteligente
    let aval = AVALES.find(a =>
      `${a.nombres} ${a.apellidos}` === nombreCompleto ||
      `${a.apellidos} ${a.nombres}` === nombreCompleto
    );

    // Si no encuentra coincidencia exacta, buscar por partes
    if (!aval) {
      aval = AVALES.find(a =>
        nombreCompleto.includes(a.nombres) && nombreCompleto.includes(a.apellidos.split(' ')[0])
      );
    }

    // Si aún no encuentra, buscar solo por apellido principal
    if (!aval) {
      aval = AVALES.find(a =>
        nombreCompleto.includes(a.apellidos.split(' ')[0])
      );
    }

    console.log('✅ Aval encontrado:', aval, 'para nombre:', nombreCompleto);
    return aval || null;
  }

  /**
   * Busca un cónyuge por nombre en los datos mock
   */
  private buscarConyugePorNombre(nombreCompleto: string): any {
    if (!nombreCompleto) return null;

    console.log('🔍 Buscando cónyuge para:', nombreCompleto);

    const CONYUGES = [
      {
        id: 1,
        apellidos: 'Torres Vega',
        nombres: 'Ana María',
        dni: '34567890',
        celular: '956781234',
        actividad: 'Docente',
        omitido: false
      },
      {
        id: 2,
        apellidos: 'Paredes Cruz',
        nombres: 'Mónica Isabel',
        dni: '56789012',
        celular: '912345678',
        actividad: 'Enfermera',
        omitido: false
      },
      {
        id: 3,
        apellidos: 'Vega Morales',
        nombres: 'Patricia Elena',
        dni: '78901234',
        celular: '967890123',
        actividad: 'Contadora',
        omitido: false
      }
    ];

    // Búsqueda más inteligente
    let conyuge = CONYUGES.find(c =>
      `${c.nombres} ${c.apellidos}` === nombreCompleto ||
      `${c.apellidos} ${c.nombres}` === nombreCompleto
    );

    // Si no encuentra coincidencia exacta, buscar por partes
    if (!conyuge) {
      conyuge = CONYUGES.find(c =>
        nombreCompleto.includes(c.nombres) && nombreCompleto.includes(c.apellidos.split(' ')[0])
      );
    }

    // Si aún no encuentra, buscar solo por apellido principal
    if (!conyuge) {
      conyuge = CONYUGES.find(c =>
        nombreCompleto.includes(c.apellidos.split(' ')[0])
      );
    }

    console.log('✅ Cónyuge encontrado:', conyuge, 'para nombre:', nombreCompleto);
    return conyuge || null;
  }
}
