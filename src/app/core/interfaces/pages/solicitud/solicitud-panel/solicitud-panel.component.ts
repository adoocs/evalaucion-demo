import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { TabsModule } from 'primeng/tabs';
import { AvalTabComponent } from '../../aval/aval-tab/aval-tab.component';
import { ClienteTabComponent } from '../../cliente/cliente-tab/cliente-tab.component';
import { ConyugeTabComponent } from '../../conyuge/conyuge-tab/conyuge-tab.component';
import { CreditoAnteriorTabComponent } from '../../credito-anterior/credito-anterior-tab/credito-anterior-tab.component';
import { GastoFinancieroTabComponent } from '../../gasto-financiero/gasto-financiero-tab/gasto-financiero-tab.component';
import { IngresoAdicionalTabComponent } from '../../ingreso-adicional/ingreso-adicional-tab/ingreso-adicional-tab.component';
import { NegocioTabComponent } from '../../negocio/negocio-tab/negocio-tab.component';
import { ReferenciaFamiliarTabComponent } from '../../referencia-familiar/referencia-familiar-tab/referencia-familiar-tab.component';
import { SolicitudTabComponent } from '../solicitud-tab/solicitud-tab.component';
import { FichaTrabajo } from '../../../../domain/ficha-trabajo.model';
import { Solicitud } from '../../../../domain/solicitud.model';
import { Cliente } from '../../../../domain/cliente.model';
import { LocalTipoViviendaService, LocalClienteService } from '../../../../services/local-data-container.service';
import { PuntajeSentinelTabComponent } from "../../puntaje-sentinel/puntaje-sentinel-tab/puntaje-sentinel-tab.component";
import { ResumenTabComponent } from "../../resumen/resumen-tab/resumen-tab.component";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { LocalFichaService } from '../../../../services/local-ficha.service';
import { LocalValidationService } from '../../../../services/local-validation.service';
import { TaskToastService, Task } from '../../../../../shared/utils/task-toast.service';
import { LocalLoadPersonService } from '../../../../../shared/utils/local-load-person.service';

type TabConfig = {
  label: string;
  icon: string;
  component: any;
  formProperty: keyof FichaTrabajo;
};

@Component({
  selector: 'app-solicitud-panel',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TabsModule,
    DialogModule,
    ReactiveFormsModule,
    IconFieldModule,
    ToastModule,
    SolicitudTabComponent,
    ClienteTabComponent,
    AvalTabComponent,
    ConyugeTabComponent,
    CreditoAnteriorTabComponent,
    NegocioTabComponent,
    IngresoAdicionalTabComponent,
    PuntajeSentinelTabComponent,
    GastoFinancieroTabComponent,
    ReferenciaFamiliarTabComponent,
    ResumenTabComponent
  ],
  templateUrl: './solicitud-panel.component.html',
  styleUrl: './solicitud-panel.component.scss',
  providers: [MessageService] // Asegurarnos de que MessageService esté disponible para el componente
})
export class SolicitudPanelComponent implements OnInit, OnDestroy {

  @ViewChild('clienteTab') clienteTab!: ClienteTabComponent;
  @ViewChild('avalTab') avalTab!: AvalTabComponent;
  @ViewChild('conyugeTab') conyugeTab!: ConyugeTabComponent;
  @ViewChild('creditoAnteriorTab') creditoAnteriorTab!: CreditoAnteriorTabComponent;
  @ViewChild('negocioTab') negocioTab!: NegocioTabComponent;
  @ViewChild('ingresoAdicionalTab') ingresoAdicionalTab!: IngresoAdicionalTabComponent;
  @ViewChild('puntajeSentinelTab') puntajeSentinelTab!: PuntajeSentinelTabComponent;
  @ViewChild('gastoFinancieroTab') gastoFinancieroTab!: GastoFinancieroTabComponent;
  @ViewChild('referenciaFamiliarTab') referenciaFamiliarTab!: ReferenciaFamiliarTabComponent;
  @ViewChild('resumenTab') resumenTab!: ResumenTabComponent;
  @ViewChild('solicitudTab') solicitudTab!: SolicitudTabComponent;

  @ViewChild('tabs') tabsComponent: any;

  activeIndex = 0;
  submitted = false;
  @Input() solicitud: Solicitud = this.createEmptySolicitud();
  @Input() fichaTrabajo: FichaTrabajo | null = null;
  @Input() modoEdicion: boolean = false;
  @Input() modoVisualizacion: boolean = false; // Nuevo: modo solo lectura
  @Input() iniciarEnResumen: boolean = false; // Nuevo: iniciar en tab de resumen

  @Output() switchMessage = new EventEmitter<string>();

  solituds = signal<Solicitud[]>([]);
  fichaTrabajoInternal: FichaTrabajo = this.createEmptyFichaTrabajo();

  readonly tabs: TabConfig[] = [
    { label: 'Solicitud', icon: 'pi pi-file', component: SolicitudTabComponent, formProperty: 'id' },
    { label: 'Cliente', icon: 'pi pi-user', component: ClienteTabComponent, formProperty: 'cliente' },
    { label: 'Aval', icon: 'pi pi-id-card', component: AvalTabComponent, formProperty: 'aval' },
    { label: 'Cónyuge', icon: 'pi pi-heart', component: ConyugeTabComponent, formProperty: 'conyuge' },
    { label: 'Crédito Anterior', icon: 'pi pi-wallet', component: CreditoAnteriorTabComponent, formProperty: 'credito_anterior' },
    { label: 'Act. Enonómica', icon: 'pi pi-building', component: NegocioTabComponent, formProperty: 'detalleEconomico' },
    { label: 'Ingreso Adicional', icon: 'pi pi-money-bill', component: IngresoAdicionalTabComponent, formProperty: 'ingreso_adicional' },
    { label: 'Puntaje Experian', icon: 'pi pi-chart-pie', component: PuntajeSentinelTabComponent, formProperty: 'puntaje_sentinel' },
    { label: 'Gasto Financiero', icon: 'pi pi-chart-line', component: GastoFinancieroTabComponent, formProperty: 'gasto_financieros' },
    { label: 'Referencia Familiar', icon: 'pi pi-users', component: ReferenciaFamiliarTabComponent, formProperty: 'referencia_familiar' },
    { label: 'Resumen', icon: 'pi pi-check-square', component: ResumenTabComponent, formProperty: 'id' },
  ];
  displayJson = false;

  // Propiedades para la validación de AVAL
  clienteRequiresAval: boolean = false;
  avalRequiredReason: string = '';

  // Propiedad para indicar que se recomienda AVAL por el monto
  montoRequiresAval: boolean = false;
  montoAvalReason: string = '';

  // Propiedades para la validación de Cónyuge
  clienteRequiresConyuge: boolean = false;
  conyugeRequiredReason: string = '';

  // Propiedad para el monto de la solicitud
  montoSolicitud: number = 0;

  // Propiedades para indicar si se ha completado el aval o el cónyuge
  avalCompletado: boolean = false;
  conyugeCompletado: boolean = false;

  // Propiedad para almacenar las tareas pendientes
  tareasPendientes: Task[] = [];

  constructor(
    private messageService: MessageToastService,
    private validationService: LocalValidationService,
    private tipoViviendaService: LocalTipoViviendaService,
    private taskToastService: TaskToastService,
    private fichaTrabajoService: LocalFichaService,
    private clienteService: LocalClienteService,
    private loadPersonService: LocalLoadPersonService
  ) { }

  ngOnInit(): void {
    this.tipoViviendaService.loadInitialData();
    this.clienteService.loadInitialData();

    // Inicializar la ficha de trabajo
    if (this.fichaTrabajo) {
      this.fichaTrabajoInternal = { ...this.fichaTrabajo };
    } else {
      this.fichaTrabajoInternal = this.createEmptyFichaTrabajo();
    }

    // Si estamos en modo visualización, iniciar en el tab de resumen
    if (this.modoVisualizacion && this.iniciarEnResumen) {
      this.activeIndex = 10; // Tab de resumen (índice 10)
      console.log('Modo visualización - Iniciando en tab de resumen');
    }

    // Mostrar mensaje de bienvenida solo si no estamos en modo edición ni visualización
    if (!this.modoEdicion && !this.modoVisualizacion) {
      setTimeout(() => {
        this.messageService.infoMessageToast(
          'Versión Demo',
          'Esta es una versión demo con datos locales. Puedes probar todas las funcionalidades sin conexión a base de datos.'
        );
      }, 1000);
    }

    // Si tenemos una solicitud existente y estamos en modo edición o visualización, cargar los datos
    if ((this.modoEdicion || this.modoVisualizacion) && this.solicitud && this.solicitud.id) {
      console.log('Modo edición/visualización - Cargando solicitud existente:', this.solicitud);
      console.log('Modo edición/visualización - Cargando ficha de trabajo:', this.fichaTrabajoInternal);

      // Cargar los datos en los formularios después de que se inicialicen
      setTimeout(() => {
        this.cargarDatosEnFormularios();
      }, 500);
    }
  }

  /**
   * Carga los datos de la ficha de trabajo en los formularios para modo edición
   */
  private cargarDatosEnFormularios(): void {
    if (!this.modoEdicion || !this.fichaTrabajoInternal) {
      return;
    }

    try {
      // Cargar datos en el formulario de solicitud
      if (this.solicitudTab && this.solicitud) {
        this.solicitudTab.solicitud = { ...this.solicitud };
        this.solicitudTab.updateFormValues();
      }

      console.log('Datos básicos cargados en los formularios para edición');
      console.log('Ficha de trabajo disponible:', this.fichaTrabajoInternal);

      // Cargar datos del tab actual (inicialmente tab 0 - solicitud)
      this.cargarDatosEnTab(0);

    } catch (error) {
      console.error('Error al cargar datos en los formularios:', error);
      this.messageService.errorMessageToast('Error', 'No se pudieron cargar todos los datos en los formularios');
    }
  }

  /**
   * Carga los datos específicos de un tab cuando el usuario navega a él
   * @param tabIndex Índice del tab al que se navega
   */
  private cargarDatosEnTab(tabIndex: number): void {
    // Funcionar tanto en modo edición como visualización
    if ((!this.modoEdicion && !this.modoVisualizacion) || !this.fichaTrabajoInternal) {
      return;
    }

    console.log(`Cargando datos para tab ${tabIndex} (modo: ${this.modoEdicion ? 'edición' : 'visualización'})`);

    try {
      switch (tabIndex) {
        case 0: // Solicitud
          if (this.solicitudTab && this.solicitud) {
            this.solicitudTab.solicitud = { ...this.solicitud };
            this.solicitudTab.updateFormValues();
            console.log('Datos de solicitud cargados');
          }
          break;

        case 1: // Cliente
          if (this.clienteTab && this.fichaTrabajoInternal.cliente) {
            // Usar setTimeout para asegurar que el componente esté completamente inicializado
            setTimeout(() => {
              this.clienteTab.updateFormValues(this.fichaTrabajoInternal.cliente!);
              console.log('Datos de cliente cargados:', this.fichaTrabajoInternal.cliente);
            }, 100);
          }
          break;

        case 2: // Aval
          if (this.avalTab && this.fichaTrabajoInternal.aval) {
            setTimeout(() => {
              this.avalTab.updateFormValues(this.fichaTrabajoInternal.aval!);

              // Si el aval está omitido, aplicar la lógica de deshabilitación
              if (this.fichaTrabajoInternal.aval!.omitido) {
                this.aplicarEstadoOmisionAval();
              }

              console.log('Datos de aval cargados:', this.fichaTrabajoInternal.aval);
            }, 100);
          }
          break;

        case 3: // Cónyuge
          if (this.conyugeTab && this.fichaTrabajoInternal.conyuge) {
            setTimeout(() => {
              this.conyugeTab.updateFormValues(this.fichaTrabajoInternal.conyuge!);

              // Si el cónyuge está omitido, aplicar la lógica de deshabilitación
              if (this.fichaTrabajoInternal.conyuge!.omitido) {
                this.aplicarEstadoOmisionConyuge();
              }

              console.log('Datos de cónyuge cargados:', this.fichaTrabajoInternal.conyuge);
            }, 100);
          }
          break;

        case 4: // Crédito Anterior
          if (this.creditoAnteriorTab) {
            setTimeout(() => {
              if (this.fichaTrabajoInternal.credito_anterior) {
                this.creditoAnteriorTab.updateFormValues(this.fichaTrabajoInternal.credito_anterior!);
                console.log('Datos de crédito anterior cargados:', this.fichaTrabajoInternal.credito_anterior);
              } else {
                // Si no hay crédito anterior, verificar si está omitido
                this.creditoAnteriorTab.omitirCreditoAnterior = true;
                this.creditoAnteriorTab.confirmarOmision();
                console.log('Crédito anterior omitido');
              }
            }, 100);
          }
          break;

        case 5: // Negocio
          if (this.negocioTab && this.fichaTrabajoInternal.detalleEconomico) {
            setTimeout(() => {
              console.log('Cargando datos de actividad económica:', this.fichaTrabajoInternal.detalleEconomico);

              // Para el negocio, necesitamos asignar el detalleEconomico completo
              this.negocioTab.detalleEconomico = this.fichaTrabajoInternal.detalleEconomico!;
              this.negocioTab.updateFormValues();

              if (this.fichaTrabajoInternal.detalleEconomico?.negocio) {
                console.log('Datos de negocio cargados:', this.fichaTrabajoInternal.detalleEconomico.negocio);
              }

              if (this.fichaTrabajoInternal.detalleEconomico?.ingreso_dependiente) {
                console.log('Datos de ingreso dependiente cargados:', this.fichaTrabajoInternal.detalleEconomico.ingreso_dependiente);
              }
            }, 200); // Aumentar timeout para asegurar inicialización completa
          } else {
            console.log('No hay datos de actividad económica para cargar');
          }
          break;

        case 6: // Ingreso Adicional
          if (this.ingresoAdicionalTab) {
            setTimeout(() => {
              if (this.fichaTrabajoInternal.ingreso_adicional) {
                this.ingresoAdicionalTab.updateFormValues(this.fichaTrabajoInternal.ingreso_adicional!);
                console.log('Datos de ingreso adicional cargados:', this.fichaTrabajoInternal.ingreso_adicional);
              } else {
                // Si no hay ingreso adicional, marcarlo como omitido
                console.log('Aplicando omisión para ingreso adicional');
                this.ingresoAdicionalTab.omitirIngresoAdicional = true;
                this.ingresoAdicionalTab.omitirAportesTerceros = true;

                // Llamar a los métodos de confirmación de omisión
                this.ingresoAdicionalTab.confirmarOmision();
                this.ingresoAdicionalTab.confirmarOmisionAportesTerceros();

                // Deshabilitar los formularios
                this.ingresoAdicionalTab.ingresoAdicionalForm.disable();
                // El formulario de aportes terceros se deshabilita automáticamente con la omisión

                console.log('Ingreso adicional omitido y formularios deshabilitados');
              }
            }, 200); // Aumentar el timeout para asegurar que el componente esté completamente inicializado
          }
          break;

        case 7: // Puntaje Sentinel
          if (this.puntajeSentinelTab && this.fichaTrabajoInternal.puntaje_sentinel) {
            setTimeout(() => {
              // Para puntaje sentinel, usar la propiedad directamente
              this.puntajeSentinelTab.puntajeSentinel = this.fichaTrabajoInternal.puntaje_sentinel!;
              console.log('Datos de puntaje sentinel cargados:', this.fichaTrabajoInternal.puntaje_sentinel);
            }, 100);
          }
          break;

        case 8: // Gasto Financiero
          if (this.gastoFinancieroTab) {
            setTimeout(() => {
              if (this.fichaTrabajoInternal.gasto_financieros && this.fichaTrabajoInternal.gasto_financieros.length > 0) {
                // Para gastos financieros, usar el signal
                this.gastoFinancieroTab.gastoFinancieros.set(this.fichaTrabajoInternal.gasto_financieros);
                console.log('Datos de gastos financieros cargados:', this.fichaTrabajoInternal.gasto_financieros);
              } else {
                // Si no hay gastos financieros, marcarlo como omitido
                console.log('Aplicando omisión para gastos financieros');
                this.gastoFinancieroTab.omitirGastoFinanciero = true;
                this.gastoFinancieroTab.confirmarOmision();

                // Limpiar la lista de gastos
                this.gastoFinancieroTab.gastoFinancieros.set([]);

                console.log('Gastos financieros omitidos');
              }
            }, 200);
          }
          break;

        case 9: // Referencia Familiar
          if (this.referenciaFamiliarTab && this.fichaTrabajoInternal.referencia_familiar) {
            setTimeout(() => {
              this.referenciaFamiliarTab.referenciaFamiliar = this.fichaTrabajoInternal.referencia_familiar!;
              this.referenciaFamiliarTab.updateFormValues();
              console.log('Datos de referencia familiar cargados:', this.fichaTrabajoInternal.referencia_familiar);
            }, 100);
          }
          break;

        case 10: // Resumen
          // El resumen se actualiza automáticamente
          console.log('Tab de resumen - datos se actualizan automáticamente');
          break;

        default:
          console.log(`Tab ${tabIndex} no reconocido`);
          break;
      }
    } catch (error) {
      console.error(`Error al cargar datos en tab ${tabIndex}:`, error);
    }
  }

  /**
   * Verifica si un cliente existe por DNI
   * @param dni El DNI a verificar
   * @returns Promise con el cliente si existe, null si no existe
   */
  verificarClientePorDNI(dni: string): Promise<Cliente | null> {
    return new Promise((resolve) => {
      // Primero verificamos si el cliente existe en la base de datos local
      const clienteExistente = this.clienteService.data().find(cliente => cliente.dni === dni);

      if (clienteExistente) {
        console.log('Cliente encontrado en la base de datos local:', clienteExistente);
        this.messageService.infoMessageToast('Cliente encontrado', 'Se ha encontrado un cliente con el DNI ' + dni);
        resolve(clienteExistente);
        return;
      }

      // Si no existe en la base de datos local, consultamos el servicio de carga de personas
      this.loadPersonService.consultarDni(dni).subscribe({
        next: (response: any) => {
          if (response && response.success && response.persona) {
            console.log('Cliente encontrado en el servicio de carga de personas:', response);
            this.messageService.infoMessageToast('Cliente encontrado', 'Se ha encontrado un cliente con el DNI ' + dni);

            // Mapear la respuesta a un objeto Cliente
            const clienteMapeado = this.loadPersonService.mapApiToCliente(response);

            // Crear un nuevo cliente con los datos obtenidos
            const nuevoCliente: Cliente = {
              id: this.clienteService.data().length + 1,
              apellidos: clienteMapeado.apellidos || '',
              nombres: clienteMapeado.nombres || '',
              dni: dni,
              fecha_born: clienteMapeado.fecha_born || '',
              estado_civil: 'Soltero',
              edad: clienteMapeado.edad || 0,
              genero: clienteMapeado.genero || 'M',
              direccion: '',
              celular: 0,
              n_referencial: 0,
              grado_instruccion: 'Secundaria',
              email: '',
              tipo_vivienda: this.tipoViviendaService.data()[0]
            };

            resolve(nuevoCliente);
          } else {
            console.log('Cliente no encontrado en el servicio de carga de personas');
            this.messageService.warnMessageToast('Cliente no encontrado', 'No se ha encontrado un cliente con el DNI ' + dni);
            resolve(null);
          }
        },
        error: (error: any) => {
          console.error('Error al consultar el servicio de carga de personas:', error);
          this.messageService.errorMessageToast('Error', 'No se pudo consultar el servicio de carga de personas');
          resolve(null);
        }
      });
    });
  }

  // Suscripciones para poder limpiarlas en ngOnDestroy
  private subscriptions: any[] = [];

  ngAfterViewInit() {
    // Suscribirse a los eventos de cierre de diálogo de cada componente
    // Usamos un timeout para asegurarnos de que los componentes estén inicializados
    setTimeout(() => {
      try {
        // Verificar si los componentes están inicializados
        if (!this.solicitudTab || !this.clienteTab || !this.avalTab || !this.conyugeTab) {
          console.error('Los componentes no están inicializados correctamente');
          return;
        }

        // Guardar las suscripciones para poder limpiarlas después
        this.subscriptions.push(
          this.solicitudTab.closedDialog.subscribe(() => {
            // Actualizar tareas pendientes cuando se completa el formulario de solicitud
            this.actualizarTareasPendientes();
          })
        );

        this.subscriptions.push(
          this.clienteTab.closedDialog.subscribe(() => {
            // Actualizar tareas pendientes cuando se completa el formulario de cliente
            this.actualizarTareasPendientes();
          })
        );

        this.subscriptions.push(
          this.avalTab.closedDialog.subscribe(() => {
            // Actualizar tareas pendientes cuando se completa el formulario de AVAL
            this.actualizarTareasPendientes();
          })
        );

        this.subscriptions.push(
          this.conyugeTab.closedDialog.subscribe(() => {
            // Actualizar tareas pendientes cuando se completa el formulario de cónyuge
            this.actualizarTareasPendientes();
          })
        );

        // Inicializar las tareas pendientes
        this.actualizarTareasPendientes();

        console.log('Componentes inicializados correctamente');
      } catch (error) {
        console.error('Error al inicializar los componentes:', error);
      }
    }, 1000);
  }

  /**
   * Limpia las suscripciones y el toast cuando se destruye el componente
   */
  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    // Limpiar el toast de tareas
    this.taskToastService.clearToast();
  }

  /**
   * Marca todos los controles en un formGroup como 'touched'
   * @param formGroup - El FormGroup cuyos controles se marcarán como touched
   */
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }



  /**
   * Verifica si un formulario está realmente completo
   * @param formGroup - El FormGroup a verificar
   * @returns true si todos los campos requeridos tienen valor, false en caso contrario
   */
  isFormReallyComplete(formGroup: FormGroup): boolean {
    let isComplete = true;
    let missingFields: string[] = [];

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);

      // Verificar si el control tiene errores
      if (control?.errors) {
        console.log(`Campo ${key} tiene errores:`, control.errors);

        // Verificar si el control es requerido y no tiene valor
        if (control.errors['required'] && (control.value === null || control.value === undefined || control.value === '')) {
          console.log(`Campo ${key} es requerido y no tiene valor`);
          missingFields.push(key);
          isComplete = false;
        }
        // Si tiene otros errores pero tiene valor, podría ser un error de validación
        else if (control.value !== null && control.value !== undefined && control.value !== '') {
          console.log(`Campo ${key} tiene valor pero no pasa la validación:`, control.value);
          // Si tiene valor pero no pasa la validación, considerarlo como completo para nuestro propósito
        }
      }

      // Si es un FormGroup anidado, verificar recursivamente
      if ((control as any)?.controls) {
        if (!this.isFormReallyComplete(control as FormGroup)) {
          isComplete = false;
        }
      }
    });

    if (!isComplete) {
      console.log('Campos faltantes:', missingFields);
    }

    return isComplete;
  }

  /**
   * Maneja el evento cuando cambia la validación de AVAL en el componente cliente
   * @param validationResult Resultado de la validación
   */
  handleAvalRequirementChange(validationResult: {required: boolean, reason: string}): void {
    // Guardar el estado anterior para detectar cambios
    const prevRequiresAval = this.clienteRequiresAval;

    this.clienteRequiresAval = validationResult.required;
    this.avalRequiredReason = validationResult.reason;

    // Solo mostrar toast si hubo un cambio en el estado de validación
    if (prevRequiresAval !== this.clienteRequiresAval) {
      this.actualizarTareasPendientes();
    }
  }

  /**
   * Maneja el evento cuando cambia el monto de la solicitud
   * @param monto El nuevo monto de la solicitud
   */
  handleMontoChange(monto: number): void {
    this.montoSolicitud = monto;

    // Guardar el estado anterior para detectar cambios
    const prevMontoRequiresAval = this.montoRequiresAval;

    // Verificar si el monto requiere AVAL y CÓNYUGE
    if (monto > 1500) {
      // Verificar si ya se ha completado alguno de los formularios (aval o cónyuge)
      this.verificarAvalOConyugeCompletado();

      // Si ya se completó alguno de los formularios, no mostrar la advertencia
      if (this.avalCompletado || this.conyugeCompletado) {
        this.montoRequiresAval = false;
        this.montoAvalReason = '';
      } else {
        // Actualizar propiedades para indicar que se recomienda AVAL y CÓNYUGE por el monto
        this.montoRequiresAval = true;
        this.montoAvalReason = 'El monto de la solicitud es mayor a 1500. Se requiere incluir Aval.';
      }
    } else {
      // Resetear propiedades si el monto ya no requiere AVAL y CÓNYUGE
      this.montoRequiresAval = false;
      this.montoAvalReason = '';
    }

    // Solo mostrar toast si hubo un cambio en el estado de validación
    if (prevMontoRequiresAval !== this.montoRequiresAval) {
      this.actualizarTareasPendientes();
    }
  }

  /**
   * Maneja el evento cuando cambia el estado civil del cliente
   * @param cliente El cliente actualizado
   */
  handleClienteChange(cliente: Cliente): void {
    console.log('Cliente cambiado:', cliente);

    // Verificar si el cliente requiere firma del cónyuge
    const conyugeValidation = this.validationService.requiresConyuge(cliente);
    console.log('Validación de cónyuge:', conyugeValidation);

    // Guardar el estado anterior para detectar cambios
    const prevRequiresConyuge = this.clienteRequiresConyuge;
    const prevConyugeReason = this.conyugeRequiredReason;

    this.clienteRequiresConyuge = conyugeValidation.required;
    this.conyugeRequiredReason = conyugeValidation.reason;

    console.log('Estado anterior de cónyuge:', prevRequiresConyuge);
    console.log('Nuevo estado de cónyuge:', this.clienteRequiresConyuge);

    // Solo mostrar toast si hubo un cambio en el estado de validación
    if (prevRequiresConyuge !== this.clienteRequiresConyuge || prevConyugeReason !== this.conyugeRequiredReason) {
      console.log('Cambio detectado en cónyuge, mostrando resumen de validaciones');
      this.actualizarTareasPendientes();
    }
  }

  /**
   * Maneja el evento cuando cambia el puntaje sentinel
   * @param puntaje El nuevo puntaje sentinel
   */
  handlePuntajeSentinelChange(puntaje: number): void {
    console.log('Puntaje Sentinel cambiado:', puntaje);

    // Actualizar el valor en el formulario de solicitud
    if (this.solicitudTab && this.solicitudTab.solicitudForm) {
      this.solicitudTab.solicitudForm.get('puntaje_sentinel')?.setValue(puntaje);
      console.log('Puntaje Sentinel actualizado en el formulario de solicitud');
    }
  }

  /**
   * Maneja el evento cuando cambia la validación del puntaje sentinel
   * @param isValid Si el puntaje sentinel es válido
   */
  handlePuntajeSentinelValidationChange(isValid: boolean): void {
    console.log('Validación de Puntaje Sentinel cambiada:', isValid);

    // Actualizar las tareas pendientes
    this.actualizarTareasPendientes();
  }

  /**
   * Actualiza la lista de tareas pendientes basado en las validaciones actuales
   */
  actualizarTareasPendientes(): void {
    // Verificar si los componentes están inicializados
    if (!this.avalTab || !this.conyugeTab) {
      console.log('Los componentes no están inicializados todavía, no se pueden actualizar las tareas');
      return;
    }

    try {
      // Lista temporal para las nuevas tareas
      const nuevasTareas: Task[] = [];

      // Tarea para AVAL si es requerido por cliente debido a la edad
      if (this.clienteRequiresAval && this.avalRequiredReason.includes('menor de 24 años')) {
        const isAvalComplete = this.avalTab?.isFormComplete() ||
                              (this.avalTab?.avalForm.get('omitido')?.value &&
                               this.avalTab?.avalForm.get('motivo')?.value);

        nuevasTareas.push({
          id: 'aval-edad',
          descripcion: 'Completar información del AVAL (cliente menor de 24 años)',
          completada: isAvalComplete || false
        });
      }

      // Tarea para AVAL si es requerido por cliente debido al tipo de vivienda
      if (this.clienteRequiresAval && this.avalRequiredReason.includes('no tiene casa propia')) {
        const isAvalComplete = this.avalTab?.isFormComplete() ||
                              (this.avalTab?.avalForm.get('omitido')?.value &&
                               this.avalTab?.avalForm.get('motivo')?.value);

        nuevasTareas.push({
          id: 'aval-vivienda',
          descripcion: 'Completar información del AVAL (cliente sin casa propia)',
          completada: isAvalComplete || false
        });
      }

      // Tarea para AVAL si es requerido por monto
      if (this.montoRequiresAval) {
        const isAvalComplete = this.avalTab?.isFormComplete() ||
                              (this.avalTab?.avalForm.get('omitido')?.value &&
                               this.avalTab?.avalForm.get('motivo')?.value);

        nuevasTareas.push({
          id: 'aval-monto',
          descripcion: 'Completar información del AVAL (monto mayor a 1500)',
          completada: isAvalComplete || false
        });
      }

      // Tarea para Cónyuge si es requerido por estado civil
      if (this.clienteRequiresConyuge) {
        const isConyugeComplete = this.conyugeTab?.isFormComplete() ||
                                 (this.conyugeTab?.conyugeForm.get('omitido')?.value &&
                                  this.conyugeTab?.conyugeForm.get('motivo')?.value);

        nuevasTareas.push({
          id: 'conyuge-estado',
          descripcion: 'Completar información del Cónyuge (estado civil)',
          completada: isConyugeComplete || false
        });
      }

      // Tarea para Cónyuge si es requerido por monto
      if (this.montoSolicitud > 1500) {
        const isConyugeComplete = this.conyugeTab?.isFormComplete() ||
                                 (this.conyugeTab?.conyugeForm.get('omitido')?.value &&
                                  this.conyugeTab?.conyugeForm.get('motivo')?.value);

        nuevasTareas.push({
          id: 'conyuge-monto',
          descripcion: 'Completar información del Cónyuge (monto mayor a 1500)',
          completada: isConyugeComplete || false
        });
      }

      // Actualizar la lista de tareas pendientes
      this.tareasPendientes = nuevasTareas;

      // Actualizar el toast estático con las tareas pendientes
      this.taskToastService.updateTasks(this.tareasPendientes);

      // Imprimir en consola para depuración
      console.log('Tareas pendientes:', this.tareasPendientes);
    } catch (error) {
      console.error('Error al actualizar las tareas pendientes:', error);
    }
  }

  /**
   * Muestra un resumen de todas las validaciones activas en un solo toast
   * @deprecated Reemplazado por actualizarTareasPendientes
   */
  showValidationSummary(): void {
    // Ahora usamos el nuevo sistema de tareas pendientes
    this.actualizarTareasPendientes();
  }

  private createEmptySolicitud(): Solicitud {
    return {
      id: 0,
      n_credito: 0,
      fecha: '',
      monto: 0,
      plazo: '',
      v_gerencia: '', // Cambiar de false a string vacío
      puntaje_sentinel: 0,
    };
  }

  private createEmptyFichaTrabajo(): FichaTrabajo {
    return {
      id: -1,
      cliente: null,
      aval: null,
      conyuge: null,
      referencia_familiar: null,
      credito_anterior: null,
      gasto_financieros: null,
      ingreso_adicional: null,
      puntaje_sentinel: null,
      detalleEconomico: null
    };
  }

  prevTab(): void {
    this.activeIndex = Math.max(0, this.activeIndex - 1);
  }

  /**
   * Maneja el cambio de pestaña
   * @param index El índice de la pestaña seleccionada
   */
  onTabChange(index: any): void {
    console.log('Pestaña cambiada a:', index);
    this.activeIndex = Number(index);

    // Si estamos en modo edición o visualización, cargar los datos correspondientes al tab
    if ((this.modoEdicion || this.modoVisualizacion) && this.fichaTrabajoInternal) {
      // Usar un timeout para asegurar que el componente esté renderizado
      setTimeout(() => {
        this.cargarDatosEnTab(Number(index));
      }, 100);
    }

    // Si se selecciona la pestaña de resumen, actualizar la ficha de trabajo
    if (Number(index) === 10) {
      if (!this.modoVisualizacion) {
        this.actualizarFichaTrabajo();
      }
      console.log('Navegando al resumen - datos actualizados');
    }
  }

  canGoNext(): boolean {
    switch (this.activeIndex) {
      case 0:
      // return this.solicitudTab.isValid();
      case 1:
        return this.clienteTab.clienteForm.valid;
      case 2:
        // Si se requiere AVAL por reglas de cliente (no por monto), validar que el formulario de AVAL esté completo o tenga un motivo de omisión
        if (this.clienteRequiresAval) {
          // Verificar si el formulario está marcado como omitido y tiene un motivo
          const isOmitido = this.avalTab.avalForm.get('omitido')?.value === true;
          const hasMotivo = !!this.avalTab.avalForm.get('motivo')?.value;

          if (isOmitido && hasMotivo) {
            console.log('Formulario de AVAL omitido con motivo, permitiendo avanzar');
            return true;
          }

          // Si no está omitido, verificar si está completo
          const isAvalComplete = this.avalTab.isFormComplete();
          if (!isAvalComplete) {
            this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del AVAL o proporcionar un motivo para omitirlo: ' + this.avalRequiredReason);
            return false;
          }
          console.log('Formulario de AVAL completo, permitiendo avanzar');
          return true; // Si el formulario de AVAL está completo, permitir avanzar
        }
        return true;

      case 3:
        // Si se requiere Cónyuge, validar que el formulario de Cónyuge esté completo o tenga un motivo de omisión
        if (this.clienteRequiresConyuge) {
          // Verificar si el formulario está marcado como omitido y tiene un motivo
          const isOmitido = this.conyugeTab.conyugeForm.get('omitido')?.value === true;
          const hasMotivo = !!this.conyugeTab.conyugeForm.get('motivo')?.value;

          if (isOmitido && hasMotivo) {
            console.log('Formulario de Cónyuge omitido con motivo, permitiendo avanzar');
            return true;
          }

          // Si no está omitido, verificar si está completo
          const isConyugeComplete = this.conyugeTab.isFormComplete();
          if (!isConyugeComplete) {
            this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del Cónyuge o proporcionar un motivo para omitirlo: ' + this.conyugeRequiredReason);
            return false;
          }
          console.log('Formulario de Cónyuge completo, permitiendo avanzar');
          return true; // Si el formulario de Cónyuge está completo, permitir avanzar
        }
        return true;

      case 5: // Pestaña de Negocio (Act. Económica)
        // Verificar si el formulario de negocio está inicializado
        if (this.negocioTab) {
          // Llamar al método validateForm() del componente NegocioTabComponent
          // Este método marcará todos los campos como tocados y validará el formulario
          return this.negocioTab.validateForm();
        }
        return false;

      default:
        return true;
    }
  }

  canChangeTab(newIndex: number): boolean {
    // Actualizar la ficha de trabajo en cada cambio de pestaña
    this.actualizarFichaTrabajo();

    // Si estamos intentando ir hacia atrás, siempre permitir
    if (newIndex < this.activeIndex) {
      return true;
    }

    // Validar que la pestaña actual esté completa antes de permitir cambiar
    switch (this.activeIndex) {
      case 0: // Pestaña de Solicitud
        // Validar solo que los campos tengan texto
        if (this.solicitudTab?.solicitudForm) {
          console.log('Formulario de Solicitud:', this.solicitudTab.solicitudForm);

          // Lista de campos requeridos
          const requiredFields = ['monto', 'plazo', 'fecha', 'periodo'];
          const emptyFields: string[] = [];

          // Verificar que cada campo requerido tenga valor
          requiredFields.forEach(field => {
            const control = this.solicitudTab.solicitudForm.get(field);
            const value = control?.value;
            console.log(`- ${field}: valor=${value}`);

            // Verificar si el campo está vacío
            if (value === null || value === undefined || value === '') {
              emptyFields.push(field);
            }
          });

          // Si hay campos vacíos, mostrar mensaje y no permitir avanzar
          if (emptyFields.length > 0) {
            this.messageService.warnMessageToast('Atención', `Complete los siguientes campos en la pestaña de Solicitud: ${emptyFields.join(', ')}`);
            // Marcar todos los campos como touched para mostrar los errores
            this.markFormGroupTouched(this.solicitudTab.solicitudForm);
            return false;
          }

          // Si todos los campos tienen valor, permitir avanzar
          console.log('Todos los campos requeridos tienen valor, permitiendo avanzar');
          return true;
        } else {
          console.log('El formulario de Solicitud no está inicializado');
          return false;
        }

      case 1: // Pestaña de Cliente
        if (this.clienteTab?.clienteForm) {
          console.log('Formulario de Cliente:', this.clienteTab.clienteForm);
          console.log('Formulario válido:', this.clienteTab.clienteForm.valid);
          console.log('Errores del formulario:');

          // Mostrar el estado de cada control
          Object.keys(this.clienteTab.clienteForm.controls).forEach(key => {
            const control = this.clienteTab.clienteForm.get(key);
            console.log(`- ${key}: válido=${control?.valid}, valor=${control?.value}, errores=`, control?.errors);
          });

          // Verificar si el formulario es válido
          if (!this.clienteTab.clienteForm.valid) {
            console.log('Verificando si el formulario está realmente completo...');
            const isReallyComplete = this.isFormReallyComplete(this.clienteTab.clienteForm);
            console.log('¿El formulario está realmente completo?', isReallyComplete);

            if (!isReallyComplete) {
              this.messageService.warnMessageToast('Atención', 'Complete todos los campos requeridos en la pestaña de Cliente antes de continuar.');
              // Marcar todos los campos como touched para mostrar los errores
              this.markFormGroupTouched(this.clienteTab.clienteForm);
              return false;
            } else {
              console.log('El formulario está realmente completo, permitiendo avanzar a pesar de que Angular lo considera inválido');
              // Si el formulario está realmente completo, permitir avanzar
              return true;
            }
          }

          // Si el formulario es válido, permitir avanzar
          console.log('Formulario de Cliente válido, permitiendo avanzar');
          return true; // Asegurarnos de que retorne true explícitamente
        } else {
          console.log('El formulario de Cliente no está inicializado');
          return false;
        }

      default:
        // Para otros casos, continuar con la validación normal
        break;
    }

    // Caso especial 2: Si estamos en la pestaña de AVAL (índice 2)
    if (this.activeIndex === 2) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isOmitido = this.avalTab?.avalForm.get('omitido')?.value === true;
      const hasMotivo = !!this.avalTab?.avalForm.get('motivo')?.value;
      const isFormComplete = this.avalTab?.isFormComplete();
      const isFormValid = this.avalTab?.avalForm.valid;

      console.log('Estado del formulario de AVAL:');
      console.log('- isOmitido:', isOmitido);
      console.log('- hasMotivo:', hasMotivo);
      console.log('- isFormComplete:', isFormComplete);
      console.log('- isFormValid:', isFormValid);
      console.log('- clienteRequiresAval:', this.clienteRequiresAval);
      console.log('- montoRequiresAval:', this.montoRequiresAval);

      // Si el formulario está omitido con motivo, permitir avanzar
      if (isOmitido && hasMotivo) {
        console.log('Formulario de AVAL omitido con motivo, permitiendo avanzar');
        return true;
      }

      // Si el formulario está completo y válido, permitir avanzar
      if (isFormComplete && isFormValid) {
        console.log('Formulario de AVAL completo y válido, permitiendo avanzar');
        return true;
      }

      // Si el formulario no está omitido y no está completo o no es válido, no permitir avanzar
      if (!isOmitido && (!isFormComplete || !isFormValid)) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del AVAL o proporcionar un motivo para omitirlo.');
        // Marcar todos los campos como touched para mostrar los errores
        if (this.avalTab?.avalForm) {
          this.markFormGroupTouched(this.avalTab.avalForm);
        }
        return false;
      }

      // Si se requiere AVAL por reglas de cliente (no por monto), no permitir avanzar
      if (this.clienteRequiresAval) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del AVAL o proporcionar un motivo para omitirlo: ' + this.avalRequiredReason);
        // Marcar todos los campos como touched para mostrar los errores
        if (this.avalTab?.avalForm) {
          this.markFormGroupTouched(this.avalTab.avalForm);
        }
        return false;
      }

      // Si el monto es mayor a 1500, permitir avanzar pero mostrar advertencia
      if (this.montoRequiresAval) {
        this.messageService.infoMessageToast('Información', 'El monto de la solicitud es mayor a 1500. Se recomienda incluir AVAL, pero puede continuar sin él.');
        return true;
      }

      // Si no se requiere AVAL, permitir avanzar
      if (!this.clienteRequiresAval && !this.montoRequiresAval) {
        return true;
      }

      // Si llegamos aquí, no se cumple ninguna condición para avanzar
      this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del AVAL o proporcionar un motivo para omitirlo.');
      // Marcar todos los campos como touched para mostrar los errores
      if (this.avalTab?.avalForm) {
        this.markFormGroupTouched(this.avalTab.avalForm);
      }
      return false;
    }

    // Caso especial 3: Si estamos en la pestaña de Cónyuge (índice 3)
    if (this.activeIndex === 3) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isOmitido = this.conyugeTab?.conyugeForm.get('omitido')?.value === true;
      const hasMotivo = !!this.conyugeTab?.conyugeForm.get('motivo')?.value;
      const isFormComplete = this.conyugeTab?.isFormComplete();
      const isFormValid = this.conyugeTab?.conyugeForm.valid;

      console.log('Estado del formulario de Cónyuge:');
      console.log('- isOmitido:', isOmitido);
      console.log('- hasMotivo:', hasMotivo);
      console.log('- isFormComplete:', isFormComplete);
      console.log('- isFormValid:', isFormValid);
      console.log('- clienteRequiresConyuge:', this.clienteRequiresConyuge);

      // Si el formulario está omitido con motivo, permitir avanzar
      if (isOmitido && hasMotivo) {
        console.log('Formulario de Cónyuge omitido con motivo, permitiendo avanzar');
        return true;
      }

      // Si el formulario está completo y válido, permitir avanzar
      if (isFormComplete && isFormValid) {
        console.log('Formulario de Cónyuge completo y válido, permitiendo avanzar');
        return true;
      }

      // Si el formulario no está omitido y no está completo o no es válido, no permitir avanzar
      if (!isOmitido && (!isFormComplete || !isFormValid)) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del Cónyuge o proporcionar un motivo para omitirlo.');
        // Marcar todos los campos como touched para mostrar los errores
        if (this.conyugeTab?.conyugeForm) {
          this.markFormGroupTouched(this.conyugeTab.conyugeForm);
        }
        return false;
      }

      // Si se requiere Cónyuge, no permitir avanzar
      if (this.clienteRequiresConyuge) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del Cónyuge o proporcionar un motivo para omitirlo: ' + this.conyugeRequiredReason);
        // Marcar todos los campos como touched para mostrar los errores
        if (this.conyugeTab?.conyugeForm) {
          this.markFormGroupTouched(this.conyugeTab.conyugeForm);
        }
        return false;
      }

      // Si no se requiere Cónyuge, permitir avanzar
      if (!this.clienteRequiresConyuge) {
        return true;
      }

      // Si llegamos aquí, no se cumple ninguna condición para avanzar
      this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del Cónyuge o proporcionar un motivo para omitirlo.');
      // Marcar todos los campos como touched para mostrar los errores
      if (this.conyugeTab?.conyugeForm) {
        this.markFormGroupTouched(this.conyugeTab.conyugeForm);
      }
      return false;
    }

    // Caso especial 4: Si estamos en la pestaña de Crédito Anterior (índice 4)
    if (this.activeIndex === 4) {
      // Verificar si el componente está inicializado
      if (this.creditoAnteriorTab) {
        // Si se ha marcado la opción de omitir, permitir avanzar sin validar el formulario
        if (this.creditoAnteriorTab.omitirCreditoAnterior) {
          return true;
        }

        // Llamar al método validateForm() del componente CreditoAnteriorTabComponent
        // Este método marcará todos los campos como tocados y validará el formulario
        return this.creditoAnteriorTab.validateForm();
      } else {
        console.log('El componente de Crédito Anterior no está inicializado');
        return false;
      }
    }

    // Caso especial 5: Si estamos en la pestaña de Negocio (índice 5)
    if (this.activeIndex === 5) {
      // Verificar si el componente está inicializado
      if (this.negocioTab) {
        // Llamar al método validateForm() del componente NegocioTabComponent
        // Este método marcará todos los campos como tocados y validará el formulario
        return this.negocioTab.validateForm();
      } else {
        console.log('El componente de Negocio no está inicializado');
        return false;
      }
    }

    // Caso especial 6: Si estamos en la pestaña de Ingreso Adicional (índice 6)
    if (this.activeIndex === 6) {
      // Verificar si el componente está inicializado
      if (this.ingresoAdicionalTab) {
        // Si se ha marcado la opción de omitir, permitir avanzar sin validar el formulario
        if (this.ingresoAdicionalTab.omitirIngresoAdicional) {
          return true;
        }

        // Llamar al método validateForm() del componente IngresoAdicionalTabComponent
        // Este método marcará todos los campos como tocados y validará el formulario
        return this.ingresoAdicionalTab.validateForm(true);
      } else {
        console.log('El componente de Ingreso Adicional no está inicializado');
        return false;
      }
    }

    // Caso especial 7: Si estamos en la pestaña de Puntaje Sentinel (índice 7)
    if (this.activeIndex === 7) {
      // Verificar si el componente está inicializado
      if (this.puntajeSentinelTab) {
        // Llamar al método validateFromParent() del componente PuntajeSentinelTabComponent
        // Este método marcará todos los campos como tocados y validará el formulario
        return this.puntajeSentinelTab.validateFromParent();
      } else {
        console.log('El componente de Puntaje Sentinel no está inicializado');
        return false;
      }
    }

    // Caso especial 8: Si estamos en la pestaña de Gasto Financiero (índice 8)
    if (this.activeIndex === 8) {
      // Verificar si el componente está inicializado
      if (this.gastoFinancieroTab) {
        // Si se ha marcado la opción de omitir, permitir avanzar sin validar el formulario
        if (this.gastoFinancieroTab.omitirGastoFinanciero) {
          return true;
        }

        // Llamar al método validateFromParent() del componente GastoFinancieroTabComponent
        // Este método marcará todos los campos como tocados y validará el formulario
        return this.gastoFinancieroTab.validateFromParent();
      } else {
        console.log('El componente de Gasto Financiero no está inicializado');
        return false;
      }
    }

    // Caso especial 9: Si estamos en la pestaña de Referencia Familiar (índice 9)
    if (this.activeIndex === 9) {
      // Verificar si el componente está inicializado
      if (this.referenciaFamiliarTab) {
        // Llamar al método validateFromParent() del componente ReferenciaFamiliarTabComponent
        // Este método marcará todos los campos como tocados y validará el formulario
        // Si se ha omitido la información de hijos, el método validateFromParent() lo manejará internamente
        return this.referenciaFamiliarTab.validateFromParent();
      } else {
        console.log('El componente de Referencia Familiar no está inicializado');
        return false;
      }
    }

    // En otros casos, usar la validación normal
    return this.canGoNext();
  }

  /**
   * Verifica si se ha completado el formulario de aval o cónyuge
   * @returns true si se ha completado al menos uno de los dos formularios, false en caso contrario
   */
  verificarAvalOConyugeCompletado(): boolean {
    // Verificar si los componentes están inicializados
    if (!this.avalTab && !this.conyugeTab) {
      return false;
    }

    // Verificar si el formulario de aval está completo o ha sido omitido con motivo
    const isAvalComplete = this.avalTab?.isFormComplete();
    const isAvalOmitido = this.avalTab?.avalForm.get('omitido')?.value === true;
    const hasAvalMotivo = !!this.avalTab?.avalForm.get('motivo')?.value;
    this.avalCompletado = isAvalComplete || (isAvalOmitido && hasAvalMotivo);

    // Verificar si el formulario de cónyuge está completo o ha sido omitido con motivo
    const isConyugeComplete = this.conyugeTab?.isFormComplete();
    const isConyugeOmitido = this.conyugeTab?.conyugeForm.get('omitido')?.value === true;
    const hasConyugeMotivo = !!this.conyugeTab?.conyugeForm.get('motivo')?.value;
    this.conyugeCompletado = isConyugeComplete || (isConyugeOmitido && hasConyugeMotivo);

    // Devolver true si al menos uno de los dos formularios está completo
    return this.avalCompletado || this.conyugeCompletado;
  }

  /**
   * Actualiza la ficha de trabajo con los datos de todos los componentes
   * para que el resumen tenga los datos actualizados
   */
  actualizarFichaTrabajo(): void {
    console.log('=== ACTUALIZANDO FICHA DE TRABAJO ===');

    // Verificar si los componentes están inicializados
    if (!this.solicitudTab || !this.clienteTab) {
      console.log('Los componentes no están inicializados todavía, no se puede actualizar la ficha de trabajo');
      return;
    }

    // Verificar si se ha completado el formulario de aval o cónyuge
    // y actualizar la propiedad montoRequiresAval si es necesario
    if (this.montoSolicitud > 1500) {
      this.verificarAvalOConyugeCompletado();
      if (this.avalCompletado || this.conyugeCompletado) {
        this.montoRequiresAval = false;
        this.montoAvalReason = '';
      }
    }

    try {
      // Actualizar la solicitud
      if (this.solicitudTab.solicitudForm) {
        const formValues = this.solicitudTab.solicitudForm.value;
        console.log('Valores del formulario de solicitud:', formValues);

        this.solicitud = {
          ...this.solicitud,
          ...formValues,
          // Asegurarnos de que estos campos estén presentes
          fecha: formValues.fecha || this.solicitud.fecha,
          monto: formValues.monto || this.solicitud.monto,
          plazo: formValues.plazo || this.solicitud.plazo,
          periodo: formValues.periodo || this.solicitud.periodo
        };

        console.log('Solicitud actualizada:', this.solicitud);
      }

      // Obtener datos de actividad económica específicamente
      let detalleEconomico = null;
      if (this.negocioTab) {
        console.log('Obteniendo datos de actividad económica...');
        detalleEconomico = this.negocioTab.getFormValues();
        console.log('Detalle económico obtenido:', detalleEconomico);

        if (detalleEconomico?.negocio) {
          console.log('Datos de negocio encontrados:', detalleEconomico.negocio);
          console.log('- Actividad económica:', detalleEconomico.negocio.actividad_economica);
          console.log('- Sector económico:', detalleEconomico.negocio.actividad_economica?.sector_economico);
          console.log('- Registro de ventas:', detalleEconomico.negocio.registro_ventas);
          console.log('- Gastos operativos:', detalleEconomico.negocio.gastos_operativos);
        }

        if (detalleEconomico?.ingreso_dependiente) {
          console.log('Datos de ingreso dependiente encontrados:', detalleEconomico.ingreso_dependiente);
        }
      } else {
        console.log('⚠️ NegocioTab no está inicializado');
      }

      // Actualizar la ficha de trabajo con los datos de cada componente usando los métodos getFormValues()
      this.fichaTrabajoInternal = {
        ...this.fichaTrabajoInternal,
        cliente: this.clienteTab?.getFormValues(),
        aval: this.avalTab?.getFormValues(),
        conyuge: this.conyugeTab?.getFormValues(),
        credito_anterior: this.creditoAnteriorTab?.getFormValues(),
        detalleEconomico: detalleEconomico,
        ingreso_adicional: this.ingresoAdicionalTab?.getFormValues(),
        gasto_financieros: this.gastoFinancieroTab?.gastoFinancieros(),
        referencia_familiar: this.referenciaFamiliarTab?.getFormValues(),
        puntaje_sentinel: this.solicitud.puntaje_sentinel
      };

      console.log('=== FICHA DE TRABAJO ACTUALIZADA ===');
      console.log('Ficha completa:', this.fichaTrabajoInternal);

      // Verificar específicamente el detalle económico
      if (this.fichaTrabajoInternal.detalleEconomico) {
        console.log('✅ Detalle económico presente en ficha actualizada');
        if (this.fichaTrabajoInternal.detalleEconomico.negocio) {
          console.log('✅ Datos de negocio presentes');
        }
        if (this.fichaTrabajoInternal.detalleEconomico.ingreso_dependiente) {
          console.log('✅ Datos de ingreso dependiente presentes');
        }
      } else {
        console.log('❌ No hay detalle económico en la ficha actualizada');
      }

      // No mostrar mensaje de éxito aquí para evitar spam
      console.log('=== ACTUALIZACIÓN COMPLETADA ===');
    } catch (error) {
      console.error('Error al actualizar la ficha de trabajo:', error);
      this.messageService.warnMessageToast('Advertencia', 'Error al actualizar los datos (Versión Demo)');
    }
  }

  nextTab() {
    console.log('Issue:', this.canGoNext());

    // Marcar todos los campos como touched para mostrar los errores
    switch (this.activeIndex) {
      case 0: // Pestaña de Solicitud
        // Validar solo que los campos tengan texto
        if (this.solicitudTab?.solicitudForm) {
          // Lista de campos requeridos
          const requiredFields = ['monto', 'plazo', 'fecha', 'periodo'];
          const emptyFields: string[] = [];

          // Verificar que cada campo requerido tenga valor
          requiredFields.forEach(field => {
            const control = this.solicitudTab.solicitudForm.get(field);
            const value = control?.value;

            // Verificar si el campo está vacío
            if (value === null || value === undefined || value === '') {
              emptyFields.push(field);
            }
          });

          // Si hay campos vacíos, mostrar mensaje y no permitir avanzar
          if (emptyFields.length > 0) {
            this.messageService.warnMessageToast('Atención', `Complete los siguientes campos en la pestaña de Solicitud: ${emptyFields.join(', ')}`);
            // Marcar todos los campos como touched para mostrar los errores
            this.markFormGroupTouched(this.solicitudTab.solicitudForm);
            return;
          }

          // Si todos los campos tienen valor, permitir avanzar
          console.log('Todos los campos requeridos tienen valor, avanzando a la siguiente pestaña');
          this.activeIndex++;
          return;
        } else {
          console.log('El formulario de Solicitud no está inicializado');
          return;
        }

      case 1: // Pestaña de Cliente
        this.markFormGroupTouched(this.clienteTab.clienteForm);
        break;
      case 2: // Pestaña de AVAL
        if (this.avalTab?.avalForm) {
          this.markFormGroupTouched(this.avalTab.avalForm);
        }
        break;
      case 3: // Pestaña de Cónyuge
        if (this.conyugeTab?.conyugeForm) {
          this.markFormGroupTouched(this.conyugeTab.conyugeForm);
        }
        break;
      case 4: // Pestaña de Crédito Anterior
        if (this.creditoAnteriorTab) {
          // Si se ha marcado la opción de omitir, permitir avanzar sin validar el formulario
          if (this.creditoAnteriorTab.omitirCreditoAnterior) {
            this.activeIndex++;
            return;
          }

          // Llamar al método validateForm() del componente CreditoAnteriorTabComponent
          // Este método marcará todos los campos como tocados y validará el formulario
          if (!this.creditoAnteriorTab.validateForm()) {
            // No mostramos mensaje aquí porque ya se muestra en validateForm()
            return;
          }

          this.activeIndex++;
          return;
        }
        break;

      case 5: // Pestaña de Negocio (Act. Económica)
        // Verificar si el componente está inicializado
        if (this.negocioTab) {
          // Llamar al método validateForm() del componente NegocioTabComponent
          // Este método marcará todos los campos como tocados y validará el formulario
          if (!this.negocioTab.validateForm()) {
            // No mostramos mensaje aquí porque ya se muestra en validateForm()
            return;
          }

          // Actualizar el objeto detalleEconomico para pasarlo al componente de ingreso adicional
          this.negocioTab.getFormValues();
          console.log('Detalle económico actualizado:', this.negocioTab.detalleEconomico);

          this.activeIndex++;
          return;
        }
        break;

      case 8: // Pestaña de Gasto Financiero
        // Verificar si el componente está inicializado
        if (this.gastoFinancieroTab) {
          // Si se ha marcado la opción de omitir, permitir avanzar sin validar el formulario
          if (this.gastoFinancieroTab.omitirGastoFinanciero) {
            this.activeIndex++;
            return;
          }

          // Llamar al método validateFromParent() del componente GastoFinancieroTabComponent
          // Este método marcará todos los campos como tocados y validará el formulario
          if (!this.gastoFinancieroTab.validateFromParent()) {
            // No mostramos mensaje aquí porque ya se muestra en validateFromParent()
            return;
          }

          this.activeIndex++;
          return;
        }
        break;

      case 9: // Pestaña de Referencia Familiar
        // Verificar si el componente está inicializado
        if (this.referenciaFamiliarTab) {
          // Llamar al método validateFromParent() del componente ReferenciaFamiliarTabComponent
          // Este método marcará todos los campos como tocados y validará el formulario
          // Si se ha omitido la información de hijos, el método validateFromParent() lo manejará internamente
          if (!this.referenciaFamiliarTab.validateFromParent()) {
            // No mostramos mensaje aquí porque ya se muestra en validateFromParent()
            return;
          }

          this.activeIndex++;
          return;
        }
        break;

      case 6: // Pestaña de Ingreso Adicional
        // Verificar si el componente está inicializado
        if (this.ingresoAdicionalTab) {
          // Si se ha marcado la opción de omitir, permitir avanzar sin validar el formulario
          if (this.ingresoAdicionalTab.omitirIngresoAdicional) {
            this.activeIndex++;
            return;
          }

          // Llamar al método validateForm() del componente IngresoAdicionalTabComponent
          // Este método marcará todos los campos como tocados y validará el formulario
          if (!this.ingresoAdicionalTab.validateForm(true)) {
            // No mostramos mensaje aquí porque ya se muestra en validateForm()
            return;
          }

          this.activeIndex++;
          return;
        }
        break;
    }

    // Verificar si podemos cambiar de pestaña
    if (!this.canChangeTab(this.activeIndex + 1)) {
      // No mostramos mensaje aquí porque ya se muestra en canChangeTab
      return;
    }

    // Caso especial 1: Si estamos en la pestaña de Solicitud (índice 0) y el monto es mayor a 1500
    if (this.activeIndex === 0 && this.montoRequiresAval) {
      // Mostrar mensaje informativo y permitir avanzar
      this.messageService.infoMessageToast('Información', 'El monto de la solicitud es mayor a 1500. Se recomienda incluir AVAL, pero puede continuar sin él.');
      this.activeIndex++;
      return;
    }

    // Caso especial 2: Si estamos en la pestaña de AVAL (índice 2)
    if (this.activeIndex === 2) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isOmitido = this.avalTab?.avalForm.get('omitido')?.value === true;
      const hasMotivo = !!this.avalTab?.avalForm.get('motivo')?.value;
      const isFormComplete = this.avalTab?.isFormComplete();
      const isFormValid = this.avalTab?.avalForm.valid;

      // Si el formulario está omitido con motivo, permitir avanzar
      if (isOmitido && hasMotivo) {
        this.messageService.infoMessageToast('Información', 'Formulario de AVAL omitido con motivo: ' + this.avalTab.avalForm.get('motivo')?.value);
        this.activeIndex++;
        return;
      }

      // Si el formulario está completo y válido, permitir avanzar
      if (isFormComplete && isFormValid) {
        this.activeIndex++;
        return;
      }

      // Si el formulario no está omitido y no está completo o no es válido, no permitir avanzar
      if (!isOmitido && (!isFormComplete || !isFormValid)) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del AVAL o proporcionar un motivo para omitirlo.');
        // Marcar todos los campos como touched para mostrar los errores
        if (this.avalTab?.avalForm) {
          this.markFormGroupTouched(this.avalTab.avalForm);
        }
        return;
      }

      // Si se requiere AVAL por reglas de cliente (no por monto), no permitir avanzar
      if (this.clienteRequiresAval) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del AVAL o proporcionar un motivo para omitirlo: ' + this.avalRequiredReason);
        // Marcar todos los campos como touched para mostrar los errores
        if (this.avalTab?.avalForm) {
          this.markFormGroupTouched(this.avalTab.avalForm);
        }
        return;
      }

      // Si el monto es mayor a 1500, permitir avanzar pero mostrar advertencia
      if (this.montoRequiresAval) {
        this.messageService.infoMessageToast('Información', 'El monto de la solicitud es mayor a 1500. Se recomienda incluir AVAL, pero puede continuar sin él.');
        this.activeIndex++;
        return;
      }

      // Si no se requiere AVAL, permitir avanzar
      if (!this.clienteRequiresAval && !this.montoRequiresAval) {
        this.activeIndex++;
        return;
      }

      // Si llegamos aquí, no se cumple ninguna condición para avanzar
      this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del AVAL o proporcionar un motivo para omitirlo.');
      // Marcar todos los campos como touched para mostrar los errores
      if (this.avalTab?.avalForm) {
        this.markFormGroupTouched(this.avalTab.avalForm);
      }
      return;
    }

    // Caso especial 3: Si estamos en la pestaña de Cónyuge (índice 3)
    if (this.activeIndex === 3) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isOmitido = this.conyugeTab?.conyugeForm.get('omitido')?.value === true;
      const hasMotivo = !!this.conyugeTab?.conyugeForm.get('motivo')?.value;
      const isFormComplete = this.conyugeTab?.isFormComplete();
      const isFormValid = this.conyugeTab?.conyugeForm.valid;

      // Si el formulario está omitido con motivo, permitir avanzar
      if (isOmitido && hasMotivo) {
        this.messageService.infoMessageToast('Información', 'Formulario de Cónyuge omitido con motivo: ' + this.conyugeTab.conyugeForm.get('motivo')?.value);
        this.activeIndex++;
        return;
      }

      // Si el formulario está completo y válido, permitir avanzar
      if (isFormComplete && isFormValid) {
        this.activeIndex++;
        return;
      }

      // Si el formulario no está omitido y no está completo o no es válido, no permitir avanzar
      if (!isOmitido && (!isFormComplete || !isFormValid)) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del Cónyuge o proporcionar un motivo para omitirlo.');
        // Marcar todos los campos como touched para mostrar los errores
        if (this.conyugeTab?.conyugeForm) {
          this.markFormGroupTouched(this.conyugeTab.conyugeForm);
        }
        return;
      }

      // Si se requiere Cónyuge, no permitir avanzar
      if (this.clienteRequiresConyuge) {
        this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del Cónyuge o proporcionar un motivo para omitirlo: ' + this.conyugeRequiredReason);
        // Marcar todos los campos como touched para mostrar los errores
        if (this.conyugeTab?.conyugeForm) {
          this.markFormGroupTouched(this.conyugeTab.conyugeForm);
        }
        return;
      }

      // Si no se requiere Cónyuge, permitir avanzar
      if (!this.clienteRequiresConyuge) {
        this.activeIndex++;
        return;
      }

      // Si llegamos aquí, no se cumple ninguna condición para avanzar
      this.messageService.warnMessageToast('Atención', 'Se requiere completar todos los campos del Cónyuge o proporcionar un motivo para omitirlo.');
      // Marcar todos los campos como touched para mostrar los errores
      if (this.conyugeTab?.conyugeForm) {
        this.markFormGroupTouched(this.conyugeTab.conyugeForm);
      }
      return;
    }

    if (this.canGoNext()) {
      // Si estamos en la pestaña de cliente (índice 1)
      if (this.activeIndex === 1) {
        // Si se requiere AVAL por reglas de cliente (no por monto), ir directamente a la pestaña de AVAL (índice 2)
        if (this.clienteRequiresAval) {
          this.activeIndex = 2; // Ir a la pestaña de AVAL
          this.messageService.infoMessageToast('Información', 'Se requiere completar la información del AVAL: ' + this.avalRequiredReason);
        }
        // Si se requiere Cónyuge pero no AVAL, ir directamente a la pestaña de Cónyuge (índice 3)
        else if (this.clienteRequiresConyuge) {
          this.activeIndex = 3; // Ir a la pestaña de Cónyuge
          this.messageService.infoMessageToast('Información', 'Se requiere completar la información del Cónyuge: ' + this.conyugeRequiredReason);
        } else {
          this.activeIndex++;
        }
      }
      // Si estamos en la pestaña de AVAL (índice 2) y se requiere Cónyuge, ir directamente a la pestaña de Cónyuge (índice 3)
      else if (this.activeIndex === 2 && this.clienteRequiresConyuge) {
        this.activeIndex = 3; // Ir a la pestaña de Cónyuge
        this.messageService.infoMessageToast('Información', 'Se requiere completar la información del Cónyuge: ' + this.conyugeRequiredReason);
      } else {
        // Actualizar la ficha de trabajo antes de cambiar de pestaña
        this.actualizarFichaTrabajo();
        this.activeIndex++;
      }
    } else {
      this.messageService.warnMessageToast('Error', 'Complete todos los campos requeridos antes de continuar');
    }
  }

  submit(): void {
    console.log('=== INICIANDO SUBMIT ===');
    this.fichaTrabajoInternal = this.getAllData();
    console.log('Ficha de trabajo obtenida:', this.fichaTrabajoInternal);

    let warnings = [];
    let errors = [];

    // Validar AVAL
    console.log('Validando AVAL...');
    console.log('clienteRequiresAval:', this.clienteRequiresAval);
    console.log('montoRequiresAval:', this.montoRequiresAval);

    if (this.clienteRequiresAval || this.montoRequiresAval) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isAvalOmitido = this.avalTab?.avalForm.get('omitido')?.value === true;
      const hasAvalMotivo = !!this.avalTab?.avalForm.get('motivo')?.value;

      console.log('isAvalOmitido:', isAvalOmitido);
      console.log('hasAvalMotivo:', hasAvalMotivo);
      console.log('avalTab.isFormComplete():', this.avalTab?.isFormComplete());

      if (isAvalOmitido && hasAvalMotivo) {
        // Si está omitido con motivo, permitir continuar
        console.log('Formulario de AVAL omitido con motivo: ' + this.avalTab.avalForm.get('motivo')?.value);
        warnings.push(`AVAL omitido: ${this.avalTab.avalForm.get('motivo')?.value}`);
      } else if (!this.fichaTrabajoInternal.aval || Object.keys(this.fichaTrabajoInternal.aval).length === 0 || !this.avalTab?.isFormComplete()) {
        // Si no está omitido y no está completo
        if (this.clienteRequiresAval) {
          // Si es requerido por cliente, mostrar error y no permitir continuar
          errors.push('Se requiere completar la información del AVAL o proporcionar un motivo para omitirlo: ' + this.avalRequiredReason);
          this.activeIndex = 2; // Ir a la pestaña de AVAL
        } else if (this.montoRequiresAval) {
          // Si es requerido por monto, mostrar advertencia pero permitir continuar
          warnings.push('El monto de la solicitud es mayor a 1500. Se recomienda incluir AVAL, pero puede continuar sin él.');
        }
      }
    } else {
      console.log('AVAL no es requerido');
    }

    // Validar Cónyuge
    console.log('Validando Cónyuge...');
    console.log('clienteRequiresConyuge:', this.clienteRequiresConyuge);

    if (this.clienteRequiresConyuge) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isConyugeOmitido = this.conyugeTab?.conyugeForm.get('omitido')?.value === true;
      const hasConyugeMotivo = !!this.conyugeTab?.conyugeForm.get('motivo')?.value;

      console.log('isConyugeOmitido:', isConyugeOmitido);
      console.log('hasConyugeMotivo:', hasConyugeMotivo);
      console.log('conyugeTab.isFormComplete():', this.conyugeTab?.isFormComplete());

      if (isConyugeOmitido && hasConyugeMotivo) {
        // Si está omitido con motivo, permitir continuar
        console.log('Formulario de Cónyuge omitido con motivo: ' + this.conyugeTab.conyugeForm.get('motivo')?.value);
        warnings.push(`Cónyuge omitido: ${this.conyugeTab.conyugeForm.get('motivo')?.value}`);
      } else if (!this.fichaTrabajoInternal.conyuge || Object.keys(this.fichaTrabajoInternal.conyuge).length === 0 || !this.conyugeTab?.isFormComplete()) {
        // Si no está omitido y no está completo, mostrar error
        errors.push('Se requiere completar la información del Cónyuge o proporcionar un motivo para omitirlo: ' + this.conyugeRequiredReason);

        // Solo cambiar a la pestaña de Cónyuge si no hay errores en AVAL
        if (errors.length === 1) {
          this.activeIndex = 3; // Ir a la pestaña de Cónyuge
        }
      }
    } else {
      console.log('Cónyuge no es requerido');
    }

    // Si hay errores, mostrarlos y no continuar
    console.log('Errores encontrados:', errors);
    if (errors.length > 0) {
      console.log('=== SUBMIT CANCELADO POR ERRORES ===');
      this.messageService.warnMessageToast('Error', errors.join('\n'));
      return;
    }

    // Mostrar advertencias si hay
    console.log('Advertencias encontradas:', warnings);
    if (warnings.length > 0) {
      this.messageService.infoMessageToast('Advertencias', warnings.join('\n'));
    }

    console.log('=== SUBMIT EXITOSO - GUARDANDO ===');
    this.displayJson = true;

    // Usar el servicio local para crear la ficha de trabajo
    console.log('Ficha de Trabajo (DEMO):', this.fichaTrabajoInternal);

    this.fichaTrabajoService.createFichaTrabajo(this.fichaTrabajoInternal).subscribe({
      next: (response) => {
        console.log('Ficha de Trabajo creada:', response);
        this.messageService.successMessageToast('Éxito', 'Ficha de trabajo guardada correctamente (Versión Demo)');
      },
      error: (error) => {
        console.error('Error al crear ficha de trabajo:', error);
        this.messageService.errorMessageToast('Error', 'No se pudo guardar la ficha de trabajo');
      }
    });
  }

  createSolicitud(): void {
    // Obtener todos los datos de la ficha de trabajo
    this.fichaTrabajoInternal = this.getAllData();

    // Actualizar la solicitud con los datos de la ficha de trabajo
    if (this.fichaTrabajoInternal.cliente) {
      this.solicitud.cliente = this.fichaTrabajoInternal.cliente.apellidos + ' ' + this.fichaTrabajoInternal.cliente.nombres;
    }

    if (this.fichaTrabajoInternal.aval) {
      this.solicitud.aval = this.fichaTrabajoInternal.aval.apellidos + ' ' + this.fichaTrabajoInternal.aval.nombres;
    }

    if (this.fichaTrabajoInternal.conyuge) {
      this.solicitud.conyugue = this.fichaTrabajoInternal.conyuge.apellidos + ' ' + this.fichaTrabajoInternal.conyuge.nombres;
    }

    // Asignar otros campos de la solicitud
    this.solicitud.credito_anterior = this.fichaTrabajoInternal.credito_anterior || undefined;
    this.solicitud.gasto_financiero = this.fichaTrabajoInternal.gasto_financieros?.[0] || undefined;
    this.solicitud.referencia_familiar = this.fichaTrabajoInternal.referencia_familiar || undefined;
    this.solicitud.ingreso_adicional = this.fichaTrabajoInternal.ingreso_adicional || undefined;
    this.solicitud.negocio = this.fichaTrabajoInternal.detalleEconomico?.negocio || undefined;

    // Asignar fecha actual si no tiene
    if (!this.solicitud.fecha) {
      this.solicitud.fecha = new Date().toISOString().split('T')[0];
    }

    // Generar número de crédito si no tiene
    if (!this.solicitud.n_credito) {
      this.solicitud.n_credito = Math.floor(10000 + Math.random() * 90000);
    }

    console.log('Creando solicitud (DEMO):', this.solicitud);
    this.messageService.successMessageToast('Éxito', 'Solicitud creada correctamente (Versión Demo)');
    this.switchMessageHandler('create');
  }

  editSolicitud(): void {
    // Obtener todos los datos de la ficha de trabajo
    this.fichaTrabajoInternal = this.getAllData();

    // Actualizar la solicitud con los datos de la ficha de trabajo
    if (this.fichaTrabajoInternal.cliente) {
      this.solicitud.cliente = this.fichaTrabajoInternal.cliente.apellidos + ' ' + this.fichaTrabajoInternal.cliente.nombres;
    }

    if (this.fichaTrabajoInternal.aval) {
      this.solicitud.aval = this.fichaTrabajoInternal.aval.apellidos + ' ' + this.fichaTrabajoInternal.aval.nombres;
    }

    if (this.fichaTrabajoInternal.conyuge) {
      this.solicitud.conyugue = this.fichaTrabajoInternal.conyuge.apellidos + ' ' + this.fichaTrabajoInternal.conyuge.nombres;
    }

    // Asignar otros campos de la solicitud
    this.solicitud.credito_anterior = this.fichaTrabajoInternal.credito_anterior || undefined;
    this.solicitud.gasto_financiero = this.fichaTrabajoInternal.gasto_financieros?.[0] || undefined;
    this.solicitud.referencia_familiar = this.fichaTrabajoInternal.referencia_familiar || undefined;
    this.solicitud.ingreso_adicional = this.fichaTrabajoInternal.ingreso_adicional || undefined;
    this.solicitud.negocio = this.fichaTrabajoInternal.detalleEconomico?.negocio || undefined;

    // Mantener la fecha existente o asignar fecha actual si no tiene
    if (!this.solicitud.fecha) {
      this.solicitud.fecha = new Date().toISOString().split('T')[0];
    }

    console.log('Editando solicitud (DEMO):', this.solicitud);
    console.log('Ficha de trabajo actualizada (DEMO):', this.fichaTrabajoInternal);

    this.messageService.successMessageToast('Éxito', 'Solicitud actualizada correctamente (Versión Demo)');
    this.switchMessageHandler('edit');
  }

  switchMessageHandler(message: string): void {
    this.switchMessage.emit(message);
  }

  getAllData(): FichaTrabajo {
    return {
      id: this.fichaTrabajoInternal.id,
      cliente: this.clienteTab?.getFormValues(),
      aval: this.avalTab?.getFormValues(),
      conyuge: this.conyugeTab?.getFormValues(),
      credito_anterior: this.creditoAnteriorTab?.getFormValues(),
      detalleEconomico: this.negocioTab?.getFormValues(),
      puntaje_sentinel: this.puntajeSentinelTab?.getFormValues(),
      ingreso_adicional: this.ingresoAdicionalTab?.getFormValues(),
      gasto_financieros: this.gastoFinancieroTab?.gastoFinancieros(),
      referencia_familiar: this.referenciaFamiliarTab?.getFormValues(),
    };
  }

  visibleJsonChange(event: boolean) {
    console.log('FICHA TRABAJO:', this.getAllData());
    this.fichaTrabajoInternal = this.getAllData();
    this.displayJson = event;
  }

  /**
   * Aplica el estado de omisión al formulario de Aval
   */
  private aplicarEstadoOmisionAval(): void {
    if (!this.avalTab || !this.avalTab.avalForm) {
      return;
    }

    console.log('Aplicando estado de omisión para Aval');

    // Deshabilitar los campos requeridos
    const requiredFields = [
      'apellidos', 'nombres', 'dni', 'direccion',
      'celular', 'n_referencial', 'actividad', 'parentesco', 'tipo_vivienda'
    ];

    requiredFields.forEach(field => {
      const control = this.avalTab.avalForm.get(field);
      if (control) {
        control.setErrors(null);
        control.markAsUntouched();
        control.disable();
      }
    });

    console.log('Estado de omisión aplicado para Aval');
  }

  /**
   * Aplica el estado de omisión al formulario de Cónyuge
   */
  private aplicarEstadoOmisionConyuge(): void {
    if (!this.conyugeTab || !this.conyugeTab.conyugeForm) {
      return;
    }

    console.log('Aplicando estado de omisión para Cónyuge');

    // Deshabilitar los campos requeridos
    const requiredFields = [
      'apellidos', 'nombres', 'dni', 'celular', 'actividad'
    ];

    requiredFields.forEach(field => {
      const control = this.conyugeTab.conyugeForm.get(field);
      if (control) {
        control.setErrors(null);
        control.markAsUntouched();
        control.disable();
      }
    });

    console.log('Estado de omisión aplicado para Cónyuge');
  }
}
