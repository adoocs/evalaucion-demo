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
import { LocalFichaService } from '../../../../services/local-ficha.service';
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
    private fichaService: LocalFichaService,
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

    // Cargar la solicitud
    this.solicitudService.getById(this.solicitudId).subscribe({
      next: (solicitud) => {
        this.solicitud = solicitud;

        // Extraer el DNI del cliente para cargar la ficha
        if (solicitud.cliente) {
          // Buscar el DNI en los datos mock basándose en el nombre del cliente
          this.cargarFichaPorCliente(solicitud.cliente);
        } else {
          this.error = 'No se encontró información del cliente en la solicitud';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar la solicitud:', error);
        this.error = 'No se pudo cargar la solicitud. Verifique que el ID sea correcto.';
        this.loading = false;
      }
    });
  }

  private cargarFichaPorCliente(nombreCliente: string): void {
    console.log('Cargando ficha para cliente:', nombreCliente);

    // En un sistema real, tendríamos una relación directa entre solicitud y ficha
    // Para la demo, vamos a buscar por nombre del cliente directamente

    // Primero intentar buscar por nombre directamente
    this.fichaService.obtenerFichaPorNombre(nombreCliente).subscribe({
      next: (ficha) => {
        console.log('Ficha cargada exitosamente por nombre:', ficha);
        this.fichaTrabajo = ficha;
        this.loading = false;

        this.messageService.infoMessageToast(
          'Datos cargados',
          `Se han cargado los datos de la solicitud y la ficha de trabajo para ${nombreCliente}.`
        );
      },
      error: (error) => {
        console.log('No se encontró ficha por nombre, intentando por DNI:', error);

        // Si no se encuentra por nombre, intentar por DNI
        const dni = this.obtenerDniPorNombre(nombreCliente);

        if (dni) {
          this.fichaService.obtenerFichaPorDni(dni).subscribe({
            next: (ficha) => {
              console.log('Ficha cargada exitosamente por DNI:', ficha);
              this.fichaTrabajo = ficha;
              this.loading = false;

              this.messageService.infoMessageToast(
                'Datos cargados',
                `Se han cargado los datos de la solicitud y la ficha de trabajo para ${nombreCliente}.`
              );
            },
            error: (errorDni) => {
              console.error('Error al cargar la ficha de trabajo por DNI:', errorDni);

              // Si no se encuentra la ficha, crear una ficha básica con los datos del cliente
              this.crearFichaBasica(nombreCliente, dni);
            }
          });
        } else {
          console.error('No se encontró DNI para el cliente:', nombreCliente);
          this.error = `No se encontraron datos para el cliente "${nombreCliente}". Verifique que el cliente exista en el sistema.`;
          this.loading = false;
        }
      }
    });
  }

  private obtenerDniPorNombre(nombreCliente: string): string | null {
    // Mapeo de nombres a DNIs para la demo
    const clientesDni: { [key: string]: string } = {
      'Juan Carlos Pérez López': '12345678',
      'María Elena Gómez Rodríguez': '87654321',
      'Pérez López Juan Carlos': '12345678', // Variación del nombre
      'Gómez Rodríguez María Elena': '87654321' // Variación del nombre
    };

    // Buscar coincidencia exacta primero
    let dni = clientesDni[nombreCliente];

    // Si no encuentra coincidencia exacta, buscar por partes del nombre
    if (!dni) {
      const nombreLimpio = nombreCliente.toLowerCase().trim();

      // Buscar por coincidencias parciales
      // Verificar si contiene las palabras principales
      if (nombreLimpio.includes('juan carlos') && nombreLimpio.includes('pérez')) {
        dni = '12345678';
      } else if (nombreLimpio.includes('maría elena') && nombreLimpio.includes('gómez')) {
        dni = '87654321';
      }
    }

    console.log(`Mapeo de nombre "${nombreCliente}" a DNI: ${dni}`);
    return dni;
  }

  private crearFichaBasica(nombreCliente: string, dni: string): void {
    console.log('Creando ficha básica para cliente sin ficha existente');

    // Crear una ficha básica con datos mínimos
    this.fichaTrabajo = {
      id: -1,
      cliente: {
        id: 0,
        apellidos: nombreCliente.split(' ').slice(-2).join(' ') || 'Apellidos',
        nombres: nombreCliente.split(' ').slice(0, -2).join(' ') || 'Nombres',
        dni: dni,
        genero: 'M',
        tipo_vivienda: { id: 1, descripcion: 'Propia' }
      },
      aval: null,
      conyuge: null,
      referencia_familiar: null,
      credito_anterior: null,
      gasto_financieros: null,
      ingreso_adicional: null,
      puntaje_sentinel: this.solicitud?.puntaje_sentinel || null,
      detalleEconomico: null
    };

    this.loading = false;

    this.messageService.infoMessageToast(
      'Ficha creada',
      `Se ha creado una ficha básica para ${nombreCliente}. Complete los datos faltantes.`
    );
  }

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

  /**
   * Actualiza la solicitud y la ficha de trabajo
   */
  private actualizarSolicitud(): void {
    if (!this.solicitudPanel) {
      this.messageService.errorMessageToast('Error', 'No se pudo acceder al formulario de solicitud');
      return;
    }

    try {
      // Obtener los datos actualizados de la solicitud y la ficha de trabajo
      const fichaActualizada = this.solicitudPanel.getAllData();
      const solicitudActualizada = this.solicitudPanel.solicitud;

      console.log('Ficha de trabajo a actualizar:', fichaActualizada);
      console.log('Solicitud a actualizar:', solicitudActualizada);

      // Actualizar la ficha de trabajo
      this.fichaService.updateFichaTrabajo(fichaActualizada).subscribe({
        next: (response) => {
          console.log('Ficha de trabajo actualizada:', response);

          // Actualizar la solicitud
          this.solicitudService.update(solicitudActualizada.id, {
            ...solicitudActualizada,
            cliente: fichaActualizada.cliente?.apellidos + ' ' + fichaActualizada.cliente?.nombres,
            fecha: solicitudActualizada.fecha || new Date().toISOString().split('T')[0]
          }).subscribe({
            next: (solicitudGuardada) => {
              console.log('Solicitud actualizada:', solicitudGuardada);
              this.messageService.successMessageToast('Éxito', 'Solicitud actualizada correctamente');

              // Navegar a la lista de solicitudes
              setTimeout(() => {
                this.router.navigate(['/solicitudes']);
              }, 1500);
            },
            error: (error) => {
              console.error('Error al actualizar la solicitud:', error);
              this.messageService.errorMessageToast('Error', 'No se pudo actualizar la solicitud');
            }
          });
        },
        error: (error) => {
          console.error('Error al actualizar la ficha de trabajo:', error);
          this.messageService.errorMessageToast('Error', 'No se pudo actualizar la ficha de trabajo');
        }
      });
    } catch (error) {
      console.error('Error al procesar los datos:', error);
      this.messageService.errorMessageToast('Error', 'Error al procesar los datos del formulario');
    }
  }

  volver(): void {
    this.router.navigate(['/solicitudes']);
  }
}
