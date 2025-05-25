import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, signal, SimpleChanges } from '@angular/core';
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
export class NegocioTabComponent implements OnInit, OnChanges, OnDestroy {

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
    private tiempoService: LocalTiempoService,
    private sectorEconomicoService: LocalSectorEconomicoService,
    private actividadEconomica: LocalActividadEconomicaService,
    private denominacionService: LocalDenominacionService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageToastService: MessageToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('Inicializando componente NegocioTabComponent');

    // Inicializar formularios
    this.initiateForm();

    // Cargar datos iniciales
    this.tiempoService.loadInitialData();
    this.sectorEconomicoService.loadInitialData();
    this.actividadEconomica.loadInitialData();
    this.denominacionService.loadInitialData();

    // Inicializar listas
    this.actividadEconomicasList = [];
    this.denominacionesFilter = [];
    this.gastosOperativosList = [];
    this.isPanelCollapsed = true;

    // Inicializar variables de error
    this.errorRegistroVentas = '';
    this.errorVentasNormales = '';
    this.errorVentasAltas = '';
    this.errorVentasBajas = '';

    // Configurar suscripciones para actualizar opciones de tiempo
    this.negocioForm.get('tiempo_valor')?.valueChanges.subscribe(() => {
      this.actualizarOpcionesTiempo();
    });
    this.ingresoDependienteForm.get('ingreso_tiempo_valor')?.valueChanges.subscribe(() => {
      this.actualizarOpcionesTiempoDependiente();
    });

    // Inicialmente, ambos formularios están deshabilitados hasta que se seleccione un tipo de actividad
    this.negocioForm.disable();
    this.ingresoDependienteForm.disable();

    // Si ya hay un tipo de actividad seleccionado, habilitar el formulario correspondiente
    if (this.tipoActividadSeleccionada) {
      console.log(`Tipo de actividad ya seleccionado: ${this.tipoActividadSeleccionada}`);
      this.habilitarFormularioSeleccionado(this.tipoActividadSeleccionada);
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
    // Primero, asegurarse de que ambos formularios estén inicializados
    if (!this.negocioForm || !this.ingresoDependienteForm) {
      console.warn('Los formularios no están inicializados correctamente');
      return;
    }

    // Usar setTimeout para asegurar que la actualización ocurra después del ciclo de detección de cambios
    setTimeout(() => {
      if (this.tipoActividadSeleccionada === 'negocio') {
        // Habilitar formulario de negocio
        this.negocioForm.enable();
        // Deshabilitar formulario de ingreso dependiente
        this.ingresoDependienteForm.disable();

        console.log('Formulario de negocio habilitado, formulario de ingreso dependiente deshabilitado');
      } else if (this.tipoActividadSeleccionada === 'dependiente') {
        // Deshabilitar formulario de negocio
        this.negocioForm.disable();
        // Habilitar formulario de ingreso dependiente
        this.ingresoDependienteForm.enable();

        console.log('Formulario de negocio deshabilitado, formulario de ingreso dependiente habilitado');
      } else {
        // Si no hay selección, deshabilitar ambos formularios
        this.negocioForm.disable();
        this.ingresoDependienteForm.disable();

        console.log('Ambos formularios deshabilitados');
      }
    }, 0);
  }

  /**
   * Cambia el tipo de actividad económica con confirmación si ya hay datos
   * @param nuevoTipo El nuevo tipo de actividad económica ('negocio' o 'dependiente')
   */
  cambiarTipoActividad(nuevoTipo: 'negocio' | 'dependiente'): void {
    console.log(`Intentando cambiar a: ${nuevoTipo}, tipo actual: ${this.tipoActividadSeleccionada}`);

    // Si ya está seleccionado este tipo, solo asegurar que el formulario esté habilitado
    if (this.tipoActividadSeleccionada === nuevoTipo) {
      console.log(`El tipo ${nuevoTipo} ya está seleccionado, asegurando que el formulario esté habilitado`);
      this.habilitarFormularioSeleccionado(nuevoTipo);
      return;
    }

    const tipoAnterior = this.tipoActividadSeleccionada;
    let formularioConDatos = false;

    // Verificar si hay datos en el formulario anterior
    if (tipoAnterior === 'negocio' && this.negocioForm) {
      formularioConDatos = this.hayDatosEnFormulario(this.negocioForm);
    } else if (tipoAnterior === 'dependiente' && this.ingresoDependienteForm) {
      formularioConDatos = this.hayDatosEnFormulario(this.ingresoDependienteForm);
    }

    // Si hay datos en el formulario anterior, mostrar confirmación
    if (tipoAnterior && formularioConDatos) {
      console.log(`El formulario anterior (${tipoAnterior}) tiene datos, mostrando confirmación`);

      // Mantener el radio button en su estado actual hasta que se confirme el cambio
      this.restaurarRadioButton(tipoAnterior);

      this.confirmationService.confirm({
        header: 'Confirmación',
        message: `¿Está seguro que desea cambiar a ${nuevoTipo === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}? Se perderán los datos ingresados en ${tipoAnterior === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}.`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, cambiar',
        rejectLabel: 'No, cancelar',
        accept: () => {
          console.log(`Confirmado cambio a ${nuevoTipo}`);
          // Resetear el formulario anterior
          this.resetearFormularioAnterior(tipoAnterior);

          // Cambiar el tipo seleccionado
          this.tipoActividadSeleccionada = nuevoTipo;

          // Habilitar el formulario seleccionado
          this.habilitarFormularioSeleccionado(nuevoTipo);

          // Mostrar mensaje toast informativo
          this.messageToastService.infoMessageToast(
            'Información',
            `Se ha cambiado a ${nuevoTipo === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}. Por favor complete todos los campos requeridos.`
          );
        },
        reject: () => {
          console.log(`Rechazado cambio, manteniendo ${tipoAnterior}`);
          // Mantener el tipo anterior
          this.tipoActividadSeleccionada = tipoAnterior;

          // Restaurar el radio button
          this.restaurarRadioButton(tipoAnterior);

          // Habilitar el formulario anterior
          this.habilitarFormularioSeleccionado(tipoAnterior);
        }
      });
    } else {
      console.log(`Cambiando directamente a ${nuevoTipo}`);
      // Si no hay datos o no hay tipo anterior, simplemente cambiar
      this.tipoActividadSeleccionada = nuevoTipo;

      // Habilitar el formulario seleccionado
      this.habilitarFormularioSeleccionado(nuevoTipo);

      // Mostrar mensaje toast informativo
      this.messageToastService.infoMessageToast(
        'Información',
        `Se ha seleccionado ${nuevoTipo === 'negocio' ? 'Negocio' : 'Ingreso Dependiente'}. Por favor complete todos los campos requeridos.`
      );
    }
  }

  /**
   * Restaura el estado del radio button según el tipo seleccionado
   * @param tipo El tipo de actividad económica ('negocio' o 'dependiente')
   */
  private restaurarRadioButton(tipo: 'negocio' | 'dependiente'): void {
    // Asegurar que el radio button correcto esté seleccionado
    const radioButton = document.querySelector(`input[name="tipoActividad"][value="${tipo}"]`) as HTMLInputElement;
    if (radioButton) {
      radioButton.checked = true;
    }
  }

  /**
   * Habilita el formulario correspondiente al tipo seleccionado
   * @param tipo El tipo de actividad económica ('negocio' o 'dependiente')
   */
  private habilitarFormularioSeleccionado(tipo: 'negocio' | 'dependiente'): void {
    console.log(`Habilitando formulario para: ${tipo}`);

    if (tipo === 'negocio') {
      // Habilitar formulario de negocio
      this.negocioForm.enable();
      // Deshabilitar formulario de ingreso dependiente
      this.ingresoDependienteForm.disable();

      console.log('Formulario de negocio habilitado, formulario de ingreso dependiente deshabilitado');
    } else if (tipo === 'dependiente') {
      // Deshabilitar formulario de negocio
      this.negocioForm.disable();
      // Habilitar formulario de ingreso dependiente
      this.ingresoDependienteForm.enable();

      console.log('Formulario de negocio deshabilitado, formulario de ingreso dependiente habilitado');
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
    this.formSubmitted = false;

    if (tipoAnterior === 'negocio' && this.negocioForm) {
      // Resetear el formulario de negocio
      this.negocioForm.reset();

      // Resetear los gastos operativos
      this.gastosOperativosList = [];

      // Limpiar errores de validación de ventas
      this.errorRegistroVentas = '';
      this.errorVentasNormales = '';
      this.errorVentasAltas = '';
      this.errorVentasBajas = '';

      // Marcar todos los campos como no tocados
      this.resetearControlesFormulario(this.negocioForm);

    } else if (tipoAnterior === 'dependiente' && this.ingresoDependienteForm) {
      // Resetear el formulario de ingreso dependiente
      this.ingresoDependienteForm.reset();

      // Marcar todos los campos como no tocados
      this.resetearControlesFormulario(this.ingresoDependienteForm);
    }
  }

  /**
   * Resetea todos los controles de un formulario, incluyendo controles anidados
   * @param form El formulario cuyos controles se resetearán
   */
  private resetearControlesFormulario(form: FormGroup): void {
    // Recorrer todos los controles del formulario
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);

      if (control instanceof FormGroup) {
        // Si es un FormGroup anidado, resetear sus controles recursivamente
        this.resetearControlesFormulario(control);
      } else if (control instanceof FormArray) {
        // Si es un FormArray, resetear cada elemento
        for (let i = 0; i < control.length; i++) {
          if (control.at(i) instanceof FormGroup) {
            this.resetearControlesFormulario(control.at(i) as FormGroup);
          } else {
            control.at(i).reset();
            control.at(i).markAsUntouched();
            control.at(i).markAsPristine();
          }
        }
      } else if (control) {
        // Resetear el control individual
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['negocio']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    console.log('=== ACTUALIZANDO FORMULARIO DE ACTIVIDAD ECONÓMICA ===');
    console.log('Detalle económico recibido:', this.detalleEconomico);

    if (this.detalleEconomico.negocio) {
      console.log('Cargando datos de negocio:', this.detalleEconomico.negocio);

      // Establecer el tipo de actividad y forzar detección de cambios
      this.tipoActividadSeleccionada = 'negocio';
      console.log('Tipo de actividad establecido:', this.tipoActividadSeleccionada);

      // Habilitar el formulario de negocio
      this.habilitarFormularioSeleccionado('negocio');

      // Forzar detección de cambios para actualizar la UI
      this.cdr.detectChanges();

      // Buscar el sector económico completo
      const sectorCompleto = this.sectoresList().find(s =>
        s.id === this.detalleEconomico.negocio?.actividad_economica?.sector_economico?.id
      );

      if (sectorCompleto) {
        console.log('Sector encontrado:', sectorCompleto);

        // Primero establecer el sector para cargar las actividades económicas
        this.negocioForm.patchValue({
          sector: sectorCompleto
        });

        // Ejecutar el cambio de sector para cargar las actividades
        this.sectorEconomicoOnChage({ value: sectorCompleto });

        // Luego buscar la actividad económica completa
        setTimeout(() => {
          const actividadCompleta = this.actividadEconomicasList.find(a =>
            a.id === this.detalleEconomico.negocio?.actividad_economica?.id
          );

          // Buscar el tiempo completo
          const tiempoCompleto = this.tiemposList().find(t =>
            t.id === this.detalleEconomico.negocio?.tiempo?.id
          );

          // Buscar la frecuencia completa
          const frecuenciaCompleta = this.frecuenciaList.find(f =>
            f.code === this.detalleEconomico.negocio?.registro_ventas?.frecuencia
          );

          console.log('Actividad encontrada:', actividadCompleta);
          console.log('Tiempo encontrado:', tiempoCompleto);
          console.log('Frecuencia encontrada:', frecuenciaCompleta);

          // Actualizar el formulario con todos los datos
          this.negocioForm.patchValue({
            id: this.detalleEconomico.negocio?.id,
            tiempo_valor: this.detalleEconomico.negocio?.tiempo_valor,
            direccion: this.detalleEconomico.negocio?.direccion,
            actividad_economica: actividadCompleta,
            tiempo: tiempoCompleto,
            registro_ventas: {
              ventas_normales: this.detalleEconomico.negocio?.registro_ventas?.ventas_normales,
              ventas_bajas: this.detalleEconomico.negocio?.registro_ventas?.ventas_bajas,
              ventas_altas: this.detalleEconomico.negocio?.registro_ventas?.ventas_altas,
              ventas_frecuencia: frecuenciaCompleta
            }
          });

          // Cargar gastos operativos si existen
          if (this.detalleEconomico.negocio?.gastos_operativos) {
            this.gastosOperativosList = [...this.detalleEconomico.negocio.gastos_operativos];
            console.log('Gastos operativos cargados:', this.gastosOperativosList);
          }

          console.log('✅ Formulario de negocio completamente actualizado');
          console.log('✅ Panel de negocio debería estar abierto (tipoActividadSeleccionada = negocio)');
        }, 100);
      }
    }

    if (this.detalleEconomico.ingreso_dependiente) {
      console.log('Cargando datos de ingreso dependiente:', this.detalleEconomico.ingreso_dependiente);

      // Establecer el tipo de actividad y forzar detección de cambios
      this.tipoActividadSeleccionada = 'dependiente';
      console.log('Tipo de actividad establecido:', this.tipoActividadSeleccionada);

      // Habilitar el formulario de ingreso dependiente
      this.habilitarFormularioSeleccionado('dependiente');

      // Forzar detección de cambios para actualizar la UI
      this.cdr.detectChanges();

      // Buscar objetos completos para los selects
      const frecuenciaCompleta = this.frecuenciaListDependiente.find(f =>
        f.code === this.detalleEconomico.ingreso_dependiente?.frecuencia
      );

      const tiempoCompleto = this.tiemposList().find(t =>
        t.id === this.detalleEconomico.ingreso_dependiente?.tiempo?.id
      );

      console.log('Frecuencia encontrada:', frecuenciaCompleta);
      console.log('Tiempo encontrado:', tiempoCompleto);

      this.ingresoDependienteForm.patchValue({
        ingreso_id: this.detalleEconomico.ingreso_dependiente.id,
        ingreso_frecuencia: frecuenciaCompleta,
        ingreso_importe: this.detalleEconomico.ingreso_dependiente.importe,
        ingreso_actividad: this.detalleEconomico.ingreso_dependiente.actividad,
        ingreso_tiempo_valor: this.detalleEconomico.ingreso_dependiente.tiempo_valor,
        ingreso_tiempo: tiempoCompleto
      });

      console.log('✅ Formulario de ingreso dependiente completamente actualizado');
      console.log('✅ Panel de ingreso dependiente debería estar abierto (tipoActividadSeleccionada = dependiente)');
    }

    // Si no hay datos de ningún tipo, establecer un valor por defecto
    if (!this.detalleEconomico.negocio && !this.detalleEconomico.ingreso_dependiente) {
      console.log('No hay datos de actividad económica, manteniendo estado actual');
    }

    console.log('=== ACTUALIZACIÓN DE FORMULARIO COMPLETADA ===');
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

    console.log('=== OBTENIENDO VALORES DE ACTIVIDAD ECONÓMICA ===');
    console.log('tipoActividadSeleccionada:', this.tipoActividadSeleccionada);
    console.log('detalleEconomico actual:', this.detalleEconomico);

    // Si no hay tipo seleccionado, intentar detectar automáticamente basándose en los datos cargados
    if (!this.tipoActividadSeleccionada) {
      console.log('No hay tipo de actividad seleccionada, intentando detectar automáticamente...');

      // Verificar si hay datos de negocio en detalleEconomico
      if (this.detalleEconomico?.negocio) {
        console.log('Detectado: Negocio (basado en detalleEconomico)');
        this.tipoActividadSeleccionada = 'negocio';
      }
      // Verificar si hay datos de ingreso dependiente en detalleEconomico
      else if (this.detalleEconomico?.ingreso_dependiente) {
        console.log('Detectado: Ingreso Dependiente (basado en detalleEconomico)');
        this.tipoActividadSeleccionada = 'dependiente';
      }
      // Verificar si el formulario de negocio tiene datos válidos
      else if (this.negocioForm.get('actividad_economica')?.value) {
        console.log('Detectado: Negocio (basado en formulario)');
        this.tipoActividadSeleccionada = 'negocio';
      }
      // Verificar si el formulario de ingreso dependiente tiene datos válidos
      else if (this.ingresoDependienteForm.get('ingreso_actividad')?.value) {
        console.log('Detectado: Ingreso Dependiente (basado en formulario)');
        this.tipoActividadSeleccionada = 'dependiente';
      }
      else {
        console.error('No se pudo detectar el tipo de actividad económica');
        return { negocio: null, ingreso_dependiente: null };
      }
    }

    if (this.tipoActividadSeleccionada === 'negocio') {
      console.log('Obteniendo datos de negocio...');
      console.log('Formulario de negocio:', this.negocioForm.value);
      console.log('Gastos operativos:', this.gastosOperativosList);

      const negocioData = {
        negocio: { ...this.negocioForm.value, gastos_operativos: this.gastosOperativosList },
        ingreso_dependiente: null
      };

      console.log('Datos de negocio obtenidos:', negocioData);
      return negocioData;
    } else if (this.tipoActividadSeleccionada === 'dependiente') {
      console.log('Obteniendo datos de ingreso dependiente...');
      console.log('Formulario de ingreso dependiente:', this.ingresoDependienteForm.value);

      const ingresoData = {
        negocio: null,
        ingreso_dependiente: {
          id: this.ingreso_id.value,
          frecuencia: this.ingreso_frecuencia.value?.code,
          importe: this.ingreso_importe.value,
          actividad: this.ingreso_actividad.value,
          tiempo_valor: this.ingreso_tiempo_valor.value,
          tiempo: this.ingreso_tiempo.value?.code === 'MES' ?
            this.tiemposList().find(item => item.id === 1)
            : this.tiemposList().find(item => item.id === 2),
        }
      };

      console.log('Datos de ingreso dependiente obtenidos:', ingresoData);
      return ingresoData;
    }

    console.log('Retornando datos vacíos');
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
    // Filtrar actividades económicas por sector seleccionado
    this.actividadEconomicasList = this.actividadEconomicasAllList().filter((actividad: any) => {
      return actividad.sector_economico && actividad.sector_economico.id === sector.value.id;
    });

    console.log('Actividades filtradas por sector:', this.actividadEconomicasList);

    // Limpiar el valor de actividad_economica cuando se cambia el sector
    this.negocioForm.get('actividad_economica')?.setValue(null);

    // Filtrar denominaciones por sector seleccionado
    this.denominacionesFilter = this.denominacionesAll().filter((denominacion: any) => {
      return denominacion.sector_economico && denominacion.sector_economico.id === sector.value.id;
    });

    console.log('Denominaciones filtradas por sector:', this.denominacionesFilter);

    // Crear gastos operativos basados en las denominaciones filtradas
    this.gastosOperativosList = this.denominacionesFilter.map((denominacion) => {
      return {
        id: -1,
        importe: 0,
        cantidad: 0,
        detalle: '',
        denominacion: {
          id: denominacion.id,
          descripcion: denominacion.descripcion,
          sector_economico: denominacion.sector_economico
        }
      };
    });
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

  /**
   * Método del ciclo de vida que se ejecuta cuando el componente se destruye
   * Limpia los recursos para evitar memory leaks
   */
  ngOnDestroy(): void {
    console.log('Destruyendo componente NegocioTabComponent');

    // Desuscribirse de todas las suscripciones
    try {
      // Limpiar suscripciones de formularios
      if (this.negocioForm) {
        const tiempoValorControl = this.negocioForm.get('tiempo_valor');
        if (tiempoValorControl) {
          // Crear una suscripción temporal y desuscribirse inmediatamente
          const tempSub = tiempoValorControl.valueChanges.subscribe();
          if (tempSub) {
            tempSub.unsubscribe();
          }
        }
      }

      if (this.ingresoDependienteForm) {
        const ingresoTiempoValorControl = this.ingresoDependienteForm.get('ingreso_tiempo_valor');
        if (ingresoTiempoValorControl) {
          // Crear una suscripción temporal y desuscribirse inmediatamente
          const tempSub = ingresoTiempoValorControl.valueChanges.subscribe();
          if (tempSub) {
            tempSub.unsubscribe();
          }
        }
      }
    } catch (error) {
      console.error('Error al limpiar suscripciones:', error);
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