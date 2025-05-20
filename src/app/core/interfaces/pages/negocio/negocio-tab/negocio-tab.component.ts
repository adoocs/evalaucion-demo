import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
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
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { PanelModule } from 'primeng/panel';
import { KeyFilterModule } from 'primeng/keyfilter';
import { Negocio } from '../../../../domain/negocio.model';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GastosOperativos } from '../../../../domain/gastos-operativos.model';
import { IngresoDependiente } from '../../../../domain/ingreso-dependiente.model';
import { RegistroVentas } from '../../../../domain/registro-ventas.model';
import { LocalNegocioService, LocalTiempoService, LocalActividadEconomicaService, LocalIngresoDependienteService, LocalRegistroVentasService, LocalGastosOperativosService, LocalSectorEconomicoService, LocalDenominacionService } from '../../../../services/local-data-container.service';
import { DetalleEconomico } from '../../../../domain/detalle-economico.model';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';

@Component({
  selector: 'app-negocio-tab',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    DropdownModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    FloatLabelModule,
    DatePickerModule,
    SelectModule,
    PanelModule,
    KeyFilterModule,
    CheckboxModule,
    TooltipModule,
    FormsModule,
    Message,
    RadioButtonModule
  ],
  templateUrl: './negocio-tab.component.html',
  styleUrl: './negocio-tab.component.scss',
  providers: [LocalNegocioService, LocalTiempoService, ConfirmationService, LocalActividadEconomicaService, LocalIngresoDependienteService, LocalRegistroVentasService, LocalGastosOperativosService, MessageToastService],
})
export class NegocioTabComponent implements OnInit, OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  detalleEconomico: DetalleEconomico = { negocio: null, ingreso_dependiente: null };
  @Input() title = '';
  @Input() editabled: boolean = false;
  @Input() gasto: GastosOperativos = { id: 0, cantidad: 1, importe: 0, detalle: '', denominacion: { id: 0, descripcion: '', sector_economico: { id: 0, descripcion: '' } } };
  @Input() venta: RegistroVentas = { id: 0, ventas_normales: 0, ventas_bajas: 0, ventas_altas: 0, frecuencia: '' };
  @Input() ingreso: IngresoDependiente = { id: 0, frecuencia: '', importe: 0, tiempo_valor: 0, actividad: '', tiempo: { id: 0, descripcion: '', valor: 0 } };
  negocios = signal<Negocio[]>([]);
  selectedNegocios!: Negocio[] | null;
  tiemposList = computed(() => this.tiempoService.data());
  tiempoList: any[] = [
    { name: 'Meses', code: 'MES' },
    { name: 'Años', code: 'ANIO' }
  ];
  tiempoListDependiente: any[] = [
    { name: 'Meses', code: 'MES' },
    { name: 'Años', code: 'ANIO' }
  ];
  actividadEconomicasList: any[] = [];
  actividadEconomicasAllList: any = computed(() => this.actividadEconomica.data());
  ingresoDependientsList: any[] = [];
  sectoresList = computed(() => this.sectorEconomicoService.data());
  negocioForm!: FormGroup;
  ingresoDependienteForm!: FormGroup;
  // Variable para controlar si se muestran los errores de validación
  submitted: boolean = false;
  formSubmitted: boolean = false;
  displayGasto: boolean = false;
  totalDenominacion: number = 0;
  totalGastos: number = 0;
  denominacionesFilter: any[] = [];
  denominacionesAll = computed(() => this.denominacionService.data());
  gastosOperativosList: GastosOperativos[] = [];
  isPanelCollapsed: boolean = true;

  tipoActividadSeleccionada: 'negocio' | 'dependiente' | null = null;

  errorRegistroVentas: string = '';
  errorVentasNormales: string = '';
  errorVentasAltas: string = '';
  errorVentasBajas: string = '';

  constructor(
    private negocioService: LocalNegocioService,
    private tiempoService: LocalTiempoService,
    private sectorEconomicoService: LocalSectorEconomicoService,
    private actividadEconomica: LocalActividadEconomicaService,
    private denominacionService: LocalDenominacionService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageToastService: MessageToastService
  ) { }

  ngOnInit(): void {
    this.initiateForm();

    this.tiempoService.loadInitialData();
    this.sectorEconomicoService.loadInitialData();
    this.actividadEconomica.loadInitialData();
    this.denominacionService.loadInitialData();
    this.isPanelCollapsed = true;

    this.negocioForm.get('tiempo_valor')?.valueChanges.subscribe(() => {
      this.actualizarOpcionesTiempo();
    });
    this.ingresoDependienteForm.get('ingreso_tiempo_valor')?.valueChanges.subscribe(() => {
      this.actualizarOpcionesTiempoDependiente();
    });

    // Inicialmente, ambos formularios están deshabilitados hasta que se seleccione un tipo de actividad
    this.negocioForm.disable();
    this.ingresoDependienteForm.disable();

    // Si ya hay un tipo de actividad seleccionado, actualizar el estado de los formularios
    if (this.tipoActividadSeleccionada) {
      this.actualizarEstadoFormularios();
    }
  }

  /**
   * Actualiza las opciones de tiempo según el valor para el formulario de negocio
   */
  actualizarOpcionesTiempo() {
    const tiempoValor = Number(this.tiempo_valor?.value) || 0;

    this.tiempoList = [
      { name: tiempoValor === 1 ? 'Mes' : 'Meses', code: 'MES' },
      { name: tiempoValor === 1 ? 'Año' : 'Años', code: 'ANIO' }
    ];

    if (this.tiempo.value) {
      const selectedCode = this.tiempo.value.code;
      const updatedOption = this.tiempoList.find(item => item.code === selectedCode);
      if (updatedOption) {
        this.tiempo.setValue(updatedOption);
      }
    }
  }

  /**
   * Actualiza las opciones de tiempo según el valor para el formulario de ingreso dependiente
   */
  actualizarOpcionesTiempoDependiente() {
    const tiempoValor = Number(this.ingreso_tiempo_valor?.value) || 0;
    this.tiempoListDependiente = [
      { name: tiempoValor === 1 ? 'Mes' : 'Meses', code: 'MES' },
      { name: tiempoValor === 1 ? 'Año' : 'Años', code: 'ANIO' }
    ];

    if (this.ingreso_tiempo.value) {
      const selectedCode = this.ingreso_tiempo.value.code;
      const updatedOption = this.tiempoListDependiente.find(item => item.code === selectedCode);
      if (updatedOption) {
        this.ingreso_tiempo.setValue(updatedOption);
      }
    }
  }

  actualizarEstadoFormularios(): void {
    if (this.tipoActividadSeleccionada === 'negocio') {
      this.negocioForm.enable();
      this.ingresoDependienteForm.disable();
    } else if (this.tipoActividadSeleccionada === 'dependiente') {
      this.negocioForm.disable();

      this.ingresoDependienteForm.enable();
    } else {
      this.negocioForm.disable();
      this.ingresoDependienteForm.disable();
    }
  }

  /**
   * Cambia el tipo de actividad económica con confirmación si ya hay datos
   * @param nuevoTipo El nuevo tipo de actividad económica ('negocio' o 'dependiente')
   */
  cambiarTipoActividad(nuevoTipo: 'negocio' | 'dependiente'): void {
    if (this.tipoActividadSeleccionada === nuevoTipo) {
      return;
    }

    const tipoAnterior = this.tipoActividadSeleccionada;
    let formularioConDatos = false;

    if (tipoAnterior === 'negocio') {
      formularioConDatos = this.hayDatosEnFormulario(this.negocioForm);
    } else if (tipoAnterior === 'dependiente') {
      formularioConDatos = this.hayDatosEnFormulario(this.ingresoDependienteForm);
    }

    if (tipoAnterior && formularioConDatos) {
      const radioButtonActual = document.querySelector(`input[name="tipoActividad"][value="${tipoAnterior}"]`) as HTMLInputElement;
      if (radioButtonActual) {
        radioButtonActual.checked = true;
      }

      this.tipoActividadSeleccionada = tipoAnterior;

      this.confirmationService.confirm({
        header: 'Confirmación',
        message: `¿Está seguro que desea cambiar a ${nuevoTipo === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}? Se perderán los datos ingresados en ${tipoAnterior === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}.`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, cambiar',
        rejectLabel: 'No, cancelar',
        accept: () => {
          this.resetearFormularioAnterior(tipoAnterior);
          this.tipoActividadSeleccionada = nuevoTipo;
          // Actualizar inmediatamente el estado de los formularios
          this.actualizarEstadoFormularios();

          // Mostrar mensaje toast informativo
          this.messageToastService.infoMessageToast(
            'Información',
            `Se ha cambiado a ${nuevoTipo === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}. Por favor complete todos los campos requeridos.`
          );
        },
        reject: () => {
          this.tipoActividadSeleccionada = tipoAnterior;
          // Actualizar inmediatamente el estado de los formularios
          this.actualizarEstadoFormularios();
        }
      });
    } else {
      this.tipoActividadSeleccionada = nuevoTipo;
      // Actualizar inmediatamente el estado de los formularios
      this.actualizarEstadoFormularios();

      // Mostrar mensaje toast informativo
      this.messageToastService.infoMessageToast(
        'Información',
        `Se ha seleccionado ${nuevoTipo === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}. Por favor complete todos los campos requeridos.`
      );
    }
  }

  /**
   * Verifica si hay datos en un formulario
   * @param form El formulario a verificar
   * @returns true si hay datos en el formulario, false en caso contrario
   */
  private hayDatosEnFormulario(form: FormGroup): boolean {
    let hayDatos = false;

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);

      if (control instanceof FormGroup) {
        if (this.hayDatosEnFormulario(control)) {
          hayDatos = true;
        }
      }
      else if (control instanceof FormArray) {
        if (control.length > 0) {
          hayDatos = true;
        }
      }
      else if (control?.value !== null && control?.value !== undefined && control?.value !== '') {
        hayDatos = true;
      }
    });

    return hayDatos;
  }

  /**
   * Resetea el formulario anterior
   * @param tipoAnterior El tipo de actividad económica anterior
   */
  private resetearFormularioAnterior(tipoAnterior: 'negocio' | 'dependiente' | null): void {
    // Establecer submitted a false para no mostrar los errores de validación
    this.submitted = false;

    if (tipoAnterior === 'negocio') {
      this.negocioForm.reset();
      // Marcar todos los campos como no tocados
      Object.keys(this.negocioForm.controls).forEach(key => {
        const control = this.negocioForm.get(key);
        control?.markAsUntouched();
      });
    } else if (tipoAnterior === 'dependiente') {
      this.ingresoDependienteForm.reset();
      // Marcar todos los campos como no tocados
      Object.keys(this.ingresoDependienteForm.controls).forEach(key => {
        const control = this.ingresoDependienteForm.get(key);
        control?.markAsUntouched();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['negocio']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.detalleEconomico.negocio) {
      this.negocioForm.patchValue({
        id: this.detalleEconomico.negocio.id,
        tiempo_valor: this.detalleEconomico.negocio.tiempo_valor,
        direccion: this.detalleEconomico.negocio.direccion,
        // sector: this.negocio.sector,
        actividad_economica: this.detalleEconomico.negocio.actividad_economica?.descripcion,
        tiempo: this.detalleEconomico.negocio.tiempo?.descripcion,
        ventas_normales: this.detalleEconomico.negocio.registro_ventas?.ventas_normales,
        ventas_bajas: this.detalleEconomico.negocio.registro_ventas?.ventas_bajas,
        ventas_altas: this.detalleEconomico.negocio.registro_ventas?.ventas_altas,
        frecuencia: this.detalleEconomico.negocio.registro_ventas?.frecuencia,
        gastos_operativos: this.detalleEconomico.negocio.gastos_operativos?.map(g => g.id),
      });
    }

    if (this.detalleEconomico.ingreso_dependiente) {
      this.ingresoDependienteForm.patchValue({
        ingreso_id: this.detalleEconomico.ingreso_dependiente.id,
        ingreso_frecuencia: this.detalleEconomico.ingreso_dependiente.frecuencia,
        ingreso_importe: this.detalleEconomico.ingreso_dependiente.importe,
        ingreso_actividad: this.detalleEconomico.ingreso_dependiente.actividad,
        ingreso_tiempo_valor: this.detalleEconomico.ingreso_dependiente.tiempo_valor,
        ingreso_tiempo: this.detalleEconomico.ingreso_dependiente.tiempo?.descripcion
      });
    }
  }

  /**
   * Inicializa los formularios con sus validadores
   */
  initiateForm(): void {
    // Inicializar el formulario de negocio
    this.negocioForm = this.fb.group({
      sector: [null, [Validators.required]],
      actividad_economica: [null, [Validators.required]],
      direccion: ['', [Validators.required]],
      tiempo_valor: [null, [Validators.required, Validators.min(0)]],
      tiempo: [null, [Validators.required]],
      registro_ventas: this.fb.group({
        ventas_id: [null],
        ventas_frecuencia: [null, [Validators.required]],
        ventas_normales: [null, [Validators.required, Validators.min(0)]],
        ventas_altas: [null, [Validators.required, Validators.min(0)]],
        ventas_bajas: [null, [Validators.required, Validators.min(0)]]
      }),

      gastos_operativos: this.fb.array([])
    });

    // Inicializar el formulario de ingreso dependiente
    this.ingresoDependienteForm = this.fb.group({
      ingreso_id: [null],
      ingreso_frecuencia: [null, [Validators.required]],
      ingreso_importe: [null, [Validators.required, Validators.min(0)]],
      ingreso_actividad: [null, [Validators.required]],
      ingreso_tiempo_valor: [null, [Validators.required, Validators.min(0)]],
      ingreso_tiempo: [null, [Validators.required]]
    });

    // Establecer submitted a false para no mostrar los errores de validación
    this.submitted = false;
  }

  /**
   * Obtiene los valores del formulario según el tipo de actividad seleccionada
   * @returns Un objeto DetalleEconomico con los valores del formulario
   */
  getFormValues(): DetalleEconomico {
    this.formSubmitted = true;

    if (!this.tipoActividadSeleccionada) {
      console.error('No se ha seleccionado un tipo de actividad económica');
      return { negocio: null, ingreso_dependiente: null };
    }

    if (this.tipoActividadSeleccionada === 'negocio') {
      return {
        negocio: { ...this.negocioForm.value, gastos_operativos: this.gastosOperativosList },
        ingreso_dependiente: null
      };
    } else if (this.tipoActividadSeleccionada === 'dependiente') {
      return {
        negocio: null,
        ingreso_dependiente: {
          id: this.ingreso_id.value,
          frecuencia: this.ingreso_frecuencia.value?.code,
          importe: this.ingreso_importe.value,
          actividad: this.ingreso_actividad.value,
          tiempo_valor: this.ingreso_tiempo_valor.value,
          tiempo: this.ingreso_tiempo.value.code === 'MES' ?
            this.tiemposList().find(item => item.id === 1)
            : this.tiemposList().find(item => item.id === 2),
        }
      };
    }
    return { negocio: null, ingreso_dependiente: null };
  }

  // Opciones de frecuencia para negocio
  frecuenciaList = [
    { name: 'Diario', code: 'diario' },
    { name: 'Semanal', code: 'semanal' }
  ];

  // Opciones de frecuencia para ingreso dependiente
  frecuenciaListDependiente = [
    { name: 'Semanal', code: 'semanal' },
    { name: 'Quincenal', code: 'quincenal' },
    { name: 'Mensual', code: 'mensual' }
  ];

  updateTiempoBasedOnValor(): void {
    this.actualizarOpcionesTiempo();
  }

  sectorEconomicoOnChage(sector: any) {
    this.actividadEconomicasList = this.actividadEconomicasAllList().filter((actividades: any) => {
      return actividades.sector_economico_id === sector.value.id;
    })
    this.denominacionesFilter = this.denominacionesAll().filter((denominacion: any) => {
      return denominacion.sector_economico_id === sector.value.id;
    });
    console.log('denominacionesFilter', this.denominacionesFilter);
    this.gastosOperativosList = this.denominacionesFilter.map((denominacion) => {
      return { id: -1, importe: 0, cantidad: 0, detalle: '', denominacion: { id: denominacion.id, descripcion: denominacion.descripcion, sector_economico: { id: denominacion.sector_economico_id, descripcion: '' } } };
    });

    console.log('fomr', this.negocioForm.value)
  }

  calcularTotalGastos(): number {
    return this.gastosOperativosList.reduce((acc, gasto) => acc + (gasto.cantidad || 0) * (gasto.importe || 0), 0) || 0;
  }

  submit() {
    this.markAllFieldsAsTouched();
    if (this.isFormValid()) {
      this.switchMessageHandler('tab');
      this.display = false;
      this.closedDialog.emit(false);
    }
  }

  scrollToFirstInvalidControl(tipoFormulario: 'negocio' | 'dependiente'): void {
    const invalidControls = document.querySelectorAll('.ng-invalid');

    if (invalidControls.length > 0) {
      let formularioSelector = '';

      if (tipoFormulario === 'negocio') {
        formularioSelector = 'form[formGroup="negocioForm"]';
      } else {
        formularioSelector = 'form[formGroup="ingresoDependienteForm"]';
      }

      const firstInvalidControl = Array.from(invalidControls).find(
        control => control.closest(formularioSelector)
      );

      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstInvalidControl instanceof HTMLInputElement ||
            firstInvalidControl instanceof HTMLSelectElement ||
            firstInvalidControl instanceof HTMLTextAreaElement) {
          firstInvalidControl.focus();
        }
      }
    }
  }

  /**
   * Cierra el diálogo y resetea el estado de validación
   * @param display Indica si se debe mostrar el diálogo
   */
  hideDialog(display: boolean) {
    // Establecer submitted a false para no mostrar los errores de validación
    this.submitted = false;
    this.formSubmitted = false;
    this.display = display;
    this.closedDialog.emit(display);

    // Marcar todos los campos como no tocados
    if (this.negocioForm) {
      Object.keys(this.negocioForm.controls).forEach(key => {
        const control = this.negocioForm.get(key);
        control?.markAsUntouched();
      });
    }

    if (this.ingresoDependienteForm) {
      Object.keys(this.ingresoDependienteForm.controls).forEach(key => {
        const control = this.ingresoDependienteForm.get(key);
        control?.markAsUntouched();
      });
    }
  }

  /**
   * Verifica si el formulario está completo (para uso interno)
   * @returns true si el formulario está completo, false en caso contrario
   */
  isFormComplete(): boolean {
    if (!this.tipoActividadSeleccionada) {
      return false;
    }
    if (this.tipoActividadSeleccionada === 'negocio') {
      return this.negocioForm.valid;
    } else if (this.tipoActividadSeleccionada === 'dependiente') {
      return this.ingresoDependienteForm.valid;
    }
    return false;
  }

  validarRegistroVentas(): { valido: boolean, mensaje?: string } {
    const ventasNormales = parseFloat(this.ventas_normales.value) || 0;
    const ventasAltas = parseFloat(this.ventas_altas.value) || 0;
    const ventasBajas = parseFloat(this.ventas_bajas.value) || 0;

    if (ventasNormales > ventasAltas) {
      return {
        valido: false,
        mensaje: 'Las ventas normales deben ser menores o iguales que las ventas altas'
      };
    }

    if (ventasNormales < ventasBajas) {
      return {
        valido: false,
        mensaje: 'Las ventas normales deben ser mayores o iguales a las ventas bajas'
      };
    }

    if (ventasAltas < ventasNormales || ventasAltas < ventasBajas) {
      return {
        valido: false,
        mensaje: 'Las ventas altas deben ser mayores o iguales a las ventas normales y bajas'
      };
    }

    if (ventasBajas > ventasNormales || ventasBajas > ventasAltas) {
      return {
        valido: false,
        mensaje: 'Las ventas bajas deben ser menores o iguales a las ventas normales y altas'
      };
    }

    return { valido: true };
  }

  validarVentasEnTiempoReal(): void {
    this.errorVentasNormales = '';
    this.errorVentasAltas = '';
    this.errorVentasBajas = '';

    const ventasNormales = parseFloat(this.ventas_normales.value) || 0;
    const ventasAltas = parseFloat(this.ventas_altas.value) || 0;
    const ventasBajas = parseFloat(this.ventas_bajas.value) || 0;

    if (ventasNormales > ventasAltas && ventasAltas > 0) {
      this.errorVentasNormales = 'Debe ser menor o igual que ventas altas';
    }
    if (ventasNormales < ventasBajas && ventasBajas > 0) {
      this.errorVentasNormales = 'Debe ser mayor o igual que ventas bajas';
    }
    if (ventasAltas < ventasNormales && ventasNormales > 0) {
      this.errorVentasAltas = 'Debe ser mayor o igual que ventas normales';
    }

    if (ventasAltas < ventasBajas && ventasBajas > 0) {
      this.errorVentasAltas = 'Debe ser mayor o igual que ventas bajas';
    }

    if (ventasBajas > ventasNormales && ventasNormales > 0) {
      this.errorVentasBajas = 'Debe ser menor o igual que ventas normales';
    }

    if (ventasBajas > ventasAltas && ventasAltas > 0) {
      this.errorVentasBajas = 'Debe ser menor o igual que ventas altas';
    }
  }

  isFormValid(): boolean {
    if (!this.tipoActividadSeleccionada) {
      // Mostrar mensaje toast de advertencia
      this.messageToastService.warnMessageToast(
        'Atención',
        'Por favor, seleccione un tipo de actividad económica (Negocio o Ingreso Dependiente).'
      );
      return false;
    }

    if (this.tipoActividadSeleccionada === 'negocio') {
      if (this.negocioForm.invalid) {
        this.scrollToFirstInvalidControl('negocio');

        // Mostrar mensaje toast de advertencia
        this.messageToastService.warnMessageToast(
          'Atención',
          'Por favor, complete todos los campos requeridos en el formulario de Negocio.'
        );
        return false;
      }

      const validacionVentas = this.validarRegistroVentas();
      if (!validacionVentas.valido) {
        this.scrollToRegistroVentas();
        this.errorRegistroVentas = validacionVentas.mensaje || '';

        // Mostrar mensaje toast de advertencia
        this.messageToastService.warnMessageToast(
          'Error en Registro de Ventas',
          validacionVentas.mensaje || 'Verifique los valores de ventas normales, altas y bajas.'
        );
        return false;
      } else {
        this.errorRegistroVentas = '';
      }

      const totalGastos = this.calcularTotalGastos();
      if (totalGastos === 0) {
        this.scrollToGastosOperativos();

        // Mostrar mensaje toast de advertencia
        this.messageToastService.warnMessageToast(
          'Atención',
          'Debe ingresar al menos un gasto operativo con importe y cantidad mayor a 0.'
        );
        return false;
      }

      this.detalleEconomico = {
        negocio: { ...this.negocioForm.value, gastos_operativos: this.gastosOperativosList },
        ingreso_dependiente: null
      };

      return true;
    } else if (this.tipoActividadSeleccionada === 'dependiente') {
      if (this.ingresoDependienteForm.invalid) {
        this.scrollToFirstInvalidControl('dependiente');

        // Mostrar mensaje toast de advertencia
        this.messageToastService.warnMessageToast(
          'Atención',
          'Por favor, complete todos los campos requeridos en el formulario de Ingreso Dependiente.'
        );
        return false;
      }

      this.detalleEconomico = {
        negocio: null,
        ingreso_dependiente: {
          id: this.ingreso_id.value,
          frecuencia: this.ingreso_frecuencia.value?.code,
          importe: this.ingreso_importe.value,
          actividad: this.ingreso_actividad.value,
          tiempo_valor: this.ingreso_tiempo_valor.value,
          tiempo: this.ingreso_tiempo.value.code === 'MES' ?
            this.tiemposList().find(item => item.id === 1)
            : this.tiemposList().find(item => item.id === 2)
        }
      };

      return true;
    }

    return false;
  }

  scrollToGastosOperativos(): void {
    setTimeout(() => {
      const gastosOperativosSection = document.querySelector('.gastos-operativos-section');

      if (gastosOperativosSection) {
        gastosOperativosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  scrollToRegistroVentas(): void {
    setTimeout(() => {
      const registroVentasSection = document.querySelector('.registro-ventas-section');
      if (registroVentasSection) {
        registroVentasSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
  validateForm(): boolean {
    this.markAllFieldsAsTouched();
    return this.isFormValid();
  }
  markFormTouched(): void {
    console.log('markFormTouched() llamado desde el componente padre');
    this.markAllFieldsAsTouched();
  }
  /**
   * Marca todos los campos como tocados y establece submitted a true
   * para mostrar los errores de validación
   */
  markAllFieldsAsTouched(): void {
    // Establecer submitted a true para mostrar los errores de validación
    this.submitted = true;

    if (this.tipoActividadSeleccionada === 'negocio') {
      this.negocioForm.markAllAsTouched();
    } else if (this.tipoActividadSeleccionada === 'dependiente') {
      this.ingresoDependienteForm.markAllAsTouched();
    } else {
      this.negocioForm.markAllAsTouched();
      this.ingresoDependienteForm.markAllAsTouched();
    }
  }


  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }
  get sector() {
    return this.negocioForm.controls['sector'];
  }

  get actividad_economica() {
    return this.negocioForm.controls['actividad_economica'];
  }

  get direccion() {
    return this.negocioForm.controls['direccion'];
  }

  get tiempo_valor() {
    return this.negocioForm.controls['tiempo_valor'];
  }

  get tiempo() {
    return this.negocioForm.controls['tiempo'];
  }

  get registro_ventas(): FormGroup {
    return this.negocioForm.controls['registro_ventas'] as FormGroup;
  }

  get ventas_id() {
    return this.registro_ventas.controls['ventas_id'];
  }

  get ventas_frecuencia() {
    return this.registro_ventas.controls['ventas_frecuencia'];
  }

  get ventas_normales() {
    return this.registro_ventas.controls['ventas_normales'];
  }

  get ventas_altas() {
    return this.registro_ventas.controls['ventas_altas'];
  }

  get ventas_bajas() {
    return this.registro_ventas.controls['ventas_bajas'];
  }

  get ingreso_id() {
    return this.ingresoDependienteForm.controls['ingreso_id'];
  }

  get ingreso_frecuencia() {
    return this.ingresoDependienteForm.controls['ingreso_frecuencia'];
  }

  get ingreso_importe() {
    return this.ingresoDependienteForm.controls['ingreso_importe'];
  }

  get ingreso_actividad() {
    return this.ingresoDependienteForm.controls['ingreso_actividad'];
  }

  get ingreso_tiempo_valor() {
    return this.ingresoDependienteForm.controls['ingreso_tiempo_valor'];
  }

  get ingreso_tiempo() {
    return this.ingresoDependienteForm.controls['ingreso_tiempo'];
  }

  get gastos_operativos(): FormArray {
    return this.negocioForm.controls['gastos_operativos'] as FormArray;
  }

  getGastoControl(index: number, controlName: string): AbstractControl {
    return (this.gastos_operativos.at(index) as FormGroup).controls[controlName];
  }
  gastoList: GastosOperativos[] = [];

  addGastos() {
    // this.gastoList();
    this.gasto = { id: 0, cantidad: 1, importe: 0, detalle: '', denominacion: { id: 0, descripcion: '', sector_economico: { id: 0, descripcion: '' } } };
    this.displayGasto = true;
  }

  editGastos(_: GastosOperativos) {
    // Método no implementado
  }

  removeGastos(add: GastosOperativos) {
    if (this.detalleEconomico && this.detalleEconomico.negocio) {
      this.detalleEconomico.negocio.gastos_operativos =
        this.detalleEconomico.negocio.gastos_operativos?.filter(a => a.id !== add.id) || [];
    }
  }

  closeGasto(close: boolean) {
    this.displayGasto = close;
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
      event.preventDefault();
    }
  }

}