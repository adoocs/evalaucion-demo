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
import { LocalTipoViviendaService } from '../../../../services/local-data-container.service';
import { PuntajeSentinelTabComponent } from "../../puntaje-sentinel/puntaje-sentinel-tab/puntaje-sentinel-tab.component";
import { ResumenTabComponent } from "../../resumen/resumen-tab/resumen-tab.component";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { LocalFichaService } from '../../../../services/local-ficha.service';
import { LocalValidationService } from '../../../../services/local-validation.service';
import { TaskToastService, Task } from '../../../../../shared/utils/task-toast.service';

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

  @Output() switchMessage = new EventEmitter<string>();

  solituds = signal<Solicitud[]>([]);
  fichaTrabajo: FichaTrabajo = this.createEmptyFichaTrabajo();

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
    private fichaTrabajoService: LocalFichaService
  ) { }

  ngOnInit(): void {
    this.tipoViviendaService.loadInitialData();

    // Mostrar mensaje de bienvenida a la versión demo
    setTimeout(() => {
      this.messageService.infoMessageToast(
        'Versión Demo',
        'Esta es una versión demo con datos locales. Puedes probar todas las funcionalidades sin conexión a base de datos.'
      );
    }, 1000);
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
      v_gerencia: false,
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

    // Si se selecciona la pestaña de resumen, actualizar la ficha de trabajo
    if (Number(index) === 10) {
      this.actualizarFichaTrabajo();

      // Mostrar mensaje de éxito
      this.messageService.successMessageToast(
        'Resumen',
        'Datos actualizados correctamente para el resumen'
      );
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

      // Actualizar la ficha de trabajo con los datos de cada componente usando los métodos getFormValues()
      this.fichaTrabajo = {
        ...this.fichaTrabajo,
        cliente: this.clienteTab?.getFormValues(),
        aval: this.avalTab?.getFormValues(),
        conyuge: this.conyugeTab?.getFormValues(),
        credito_anterior: this.creditoAnteriorTab?.getFormValues(),
        detalleEconomico: this.negocioTab?.getFormValues(),
        ingreso_adicional: this.ingresoAdicionalTab?.getFormValues(),
        gasto_financieros: this.gastoFinancieroTab?.gastoFinancieros(),
        referencia_familiar: this.referenciaFamiliarTab?.getFormValues(),
        puntaje_sentinel: this.solicitud.puntaje_sentinel
      };

      console.log('Ficha de trabajo actualizada (DEMO):', this.fichaTrabajo);

      // Versión demo: Mostrar mensaje de éxito
      this.messageService.infoMessageToast('Información', 'Datos actualizados correctamente (Versión Demo)');
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
    this.fichaTrabajo = this.getAllData();
    let warnings = [];
    let errors = [];

    // Validar AVAL
    if (this.clienteRequiresAval || this.montoRequiresAval) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isAvalOmitido = this.avalTab.avalForm.get('omitido')?.value === true;
      const hasAvalMotivo = !!this.avalTab.avalForm.get('motivo')?.value;

      if (isAvalOmitido && hasAvalMotivo) {
        // Si está omitido con motivo, permitir continuar
        console.log('Formulario de AVAL omitido con motivo: ' + this.avalTab.avalForm.get('motivo')?.value);
        warnings.push(`AVAL omitido: ${this.avalTab.avalForm.get('motivo')?.value}`);
      } else if (!this.fichaTrabajo.aval || Object.keys(this.fichaTrabajo.aval).length === 0 || !this.avalTab.isFormComplete()) {
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
    }

    // Validar Cónyuge
    if (this.clienteRequiresConyuge) {
      // Verificar si el formulario está marcado como omitido y tiene un motivo
      const isConyugeOmitido = this.conyugeTab.conyugeForm.get('omitido')?.value === true;
      const hasConyugeMotivo = !!this.conyugeTab.conyugeForm.get('motivo')?.value;

      if (isConyugeOmitido && hasConyugeMotivo) {
        // Si está omitido con motivo, permitir continuar
        console.log('Formulario de Cónyuge omitido con motivo: ' + this.conyugeTab.conyugeForm.get('motivo')?.value);
        warnings.push(`Cónyuge omitido: ${this.conyugeTab.conyugeForm.get('motivo')?.value}`);
      } else if (!this.fichaTrabajo.conyuge || Object.keys(this.fichaTrabajo.conyuge).length === 0 || !this.conyugeTab.isFormComplete()) {
        // Si no está omitido y no está completo, mostrar error
        errors.push('Se requiere completar la información del Cónyuge o proporcionar un motivo para omitirlo: ' + this.conyugeRequiredReason);

        // Solo cambiar a la pestaña de Cónyuge si no hay errores en AVAL
        if (errors.length === 1) {
          this.activeIndex = 3; // Ir a la pestaña de Cónyuge
        }
      }
    }

    // Si hay errores, mostrarlos y no continuar
    if (errors.length > 0) {
      this.messageService.warnMessageToast('Error', errors.join('\n'));
      return;
    }

    // Mostrar advertencias si hay
    if (warnings.length > 0) {
      this.messageService.infoMessageToast('Advertencias', warnings.join('\n'));
    }

    this.displayJson = true;

    // Usar el servicio local para crear la ficha de trabajo
    console.log('Ficha de Trabajo (DEMO):', this.fichaTrabajo);

    this.fichaTrabajoService.createFichaTrabajo(this.fichaTrabajo).subscribe({
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
    // Versión demo: Simular la creación de la solicitud sin conectarse al backend
    console.log('Creando solicitud (DEMO):', this.solicitud);
    this.messageService.successMessageToast('Éxito', 'Solicitud creada correctamente (Versión Demo)');
    this.switchMessageHandler('create');

    // Comentamos la llamada al servicio real para evitar errores de conexión
    /*
    this.solicitudService.create(this.solicitud).subscribe({
      next: () => this.switchMessageHandler('create'),
      error: () => this.switchMessageHandler('error')
    });
    */
  }

  editSolicitud(): void {
    // Versión demo: Simular la edición de la solicitud sin conectarse al backend
    console.log('Editando solicitud (DEMO):', this.solicitud);
    this.messageService.successMessageToast('Éxito', 'Solicitud actualizada correctamente (Versión Demo)');
    this.switchMessageHandler('edit');

    // Comentamos la llamada al servicio real para evitar errores de conexión
    /*
    this.solicitudService.update(this.solicitud.id, this.solicitud).subscribe({
      next: () => this.switchMessageHandler('edit'),
      error: () => this.switchMessageHandler('error')
    });
    */
  }

  switchMessageHandler(message: string): void {
    this.switchMessage.emit(message);
  }

  getAllData(): FichaTrabajo {
    return {
      id: this.fichaTrabajo.id,
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
    this.fichaTrabajo = this.getAllData();
    this.displayJson = event;
  }
}
