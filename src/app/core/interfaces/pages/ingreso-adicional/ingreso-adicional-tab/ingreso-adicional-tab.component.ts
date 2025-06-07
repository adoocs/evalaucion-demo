import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Message } from 'primeng/message';
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
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { PanelModule } from 'primeng/panel';
import { KeyFilterModule } from 'primeng/keyfilter';
import { IngresoAdicional } from '../../../../domain/ingreso-adicional.model';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { LocalAportanteService, LocalIngresoAdicionalService } from '../../../../services/local-data-container.service';
import { DetalleEconomico } from '../../../../domain/detalle-economico.model';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';

@Component({
  selector: 'app-ingreso-adicional-tab',
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
    FormsModule,
    FloatLabelModule,
    DatePickerModule,
    SelectModule,
    PanelModule,
    KeyFilterModule,
    CheckboxModule,
    TooltipModule,
    TextareaModule,
    Message
  ],
  templateUrl: './ingreso-adicional-tab.component.html',
  styleUrl: './ingreso-adicional-tab.component.scss',
  providers: [LocalIngresoAdicionalService, MessageService, LocalAportanteService, MessageToastService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngresoAdicionalTabComponent implements OnInit, OnChanges, OnDestroy {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() ingresoAdicional: IngresoAdicional = { id: 0, frecuencia: '', importe_act: 0, firma_aval: false, firma_conyuge: false, actividad: '', motivo: '', aportante: { id: 0, descripcion: '' }, importe_tercero: 0, sustentable: false, detalle: '' };
  @Input() title = '';
  @Input() editabled: boolean = false;
  @Input() detalleEconomico?: DetalleEconomico;

  // Variables para controlar si se omiten los paneles
  omitirIngresoAdicional: boolean = false;
  omitirAportesTerceros: boolean = false;

  /**
   * Alterna el estado de omisión del panel de ingreso adicional
   */
  toggleOmitirIngresoAdicional(): void {
    // Invertir el estado actual
    this.omitirIngresoAdicional = !this.omitirIngresoAdicional;

    // Llamar al método correspondiente para manejar la omisión/desomisión
    this.confirmarOmision();
  }

  /**
   * Alterna el estado de omisión del panel de aportes de terceros
   */
  toggleOmitirAportesTerceros(): void {
    // Invertir el estado actual
    this.omitirAportesTerceros = !this.omitirAportesTerceros;

    // Llamar al método correspondiente para manejar la omisión/desomisión
    this.confirmarOmisionAportesTerceros();
  }

  /**
   * Maneja el cambio en el checkbox de omitir ingreso adicional (método mantenido por compatibilidad)
   * @param event Evento del checkbox
   */
  onOmitirIngresoAdicionalChange(event: any): void {
    // Actualizar el estado del checkbox
    this.omitirIngresoAdicional = event;

    // Llamar al método correspondiente según si se está marcando o desmarcando
    this.confirmarOmision();
  }

  /**
   * Maneja el cambio en el checkbox de omitir aportes de terceros (método mantenido por compatibilidad)
   * @param event Evento del checkbox
   */
  onOmitirAportesTercerosChange(event: any): void {
    // Actualizar el estado del checkbox
    this.omitirAportesTerceros = event;

    // Llamar al método correspondiente según si se está marcando o desmarcando
    this.confirmarOmisionAportesTerceros();
  }

  // Variables para el manejo del checkbox de cónyuge
  esParejaConyuge: boolean = false;
  mostrarDialogoMotivo: boolean = false;
  motivoDeseleccionConyuge: string = '';
  motivoDeseleccionGuardado: string = '';
  valorAnteriorConyuge: boolean = false;
  mostrarMotivo: boolean = false;

  // Subject para manejar la limpieza de suscripciones
  private destroy$ = new Subject<void>();

  selectedIngresoAdicionals!: IngresoAdicional[] | null;
  aportanteList = computed(() => this.aportanteService.data());
  firma_conyugeList: any[] = [];
  ingresoAdicionalForm!: FormGroup;
  submitted: boolean = false;

  isAvalChecked: boolean = false;
  showMessage: boolean = false;
  isConyugeChecked: boolean = false;

  constructor(
    private ingresoAdicionalService: LocalIngresoAdicionalService,
    private aportanteService: LocalAportanteService,
    private fb: FormBuilder,
    private messageToastService: MessageToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.initiateForm();
  }

  /**
   * Limpia las suscripciones cuando se destruye el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // Inicializar variables
    this.mostrarDialogoMotivo = false;
    this.motivoDeseleccionConyuge = '';
    this.motivoDeseleccionGuardado = '';
    this.mostrarMotivo = false;
    this.esParejaConyuge = false;

    // Inicializar variables de omisión
    this.omitirIngresoAdicional = false;
    this.omitirAportesTerceros = false;

    // Cargar datos iniciales una sola vez
    this.aportanteService.loadInitialData();

    // Suscribirse a cambios en el campo de importe para validar en tiempo real
    // Usar takeUntil para limpiar la suscripción automáticamente
    this.importe_act.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validarImporteAdicional();
        // Forzar la detección de cambios para actualizar la vista
        this.cdr.markForCheck();
      });

    // Suscribirse a cambios en el checkbox de sustentable para actualizar los validadores
    this.sustentable.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSustentable => {
        console.log('Checkbox sustentable cambiado a:', isSustentable);

        // Si el checkbox está marcado, el detalle es opcional
        // Si no está marcado, el detalle es requerido
        if (isSustentable) {
          this.ingresoAdicionalForm.get('detalle')?.clearValidators();
          console.log('Detalle ahora es opcional');
        } else {
          this.ingresoAdicionalForm.get('detalle')?.setValidators([Validators.required]);
          console.log('Detalle ahora es requerido');
        }

        // Actualizar el validador
        this.ingresoAdicionalForm.get('detalle')?.updateValueAndValidity();

        // Forzar la detección de cambios para actualizar la vista
        this.cdr.markForCheck();
      });

    // Inicializar detalleEconomico si es undefined
    if (!this.detalleEconomico) {
      this.detalleEconomico = { negocio: null, ingreso_dependiente: null };
    }

    // Suscribirse a los cambios en el aportante
    this.aportante.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {
          // Verificar si el aportante es cónyuge o conviviente (ya no incluye pareja)
          const descripcion = value.descripcion?.toLowerCase() || '';
          console.log('Descripción del aportante:', descripcion);

          const esParejaConyuge = descripcion.includes('cónyuge') ||
                                 descripcion.includes('conyugé') ||
                                 descripcion.includes('conviviente');

          // Si cambia el estado de esParejaConyuge
          if (this.esParejaConyuge !== esParejaConyuge) {
            this.esParejaConyuge = esParejaConyuge;
            console.log('Es cónyuge/conviviente:', this.esParejaConyuge);

            // Si es cónyuge o conviviente, habilitar y marcar el checkbox de cónyuge
            // y reiniciar el estado de deselección
            if (this.esParejaConyuge) {
              const conyugeControl = this.ingresoAdicionalForm.get('firma_conyuge');
              conyugeControl?.enable(); // Habilitar el control
              conyugeControl?.setValue(true); // Marcar el checkbox
              this.mostrarMotivo = false;
              this.motivoDeseleccionGuardado = '';
              console.log('Checkbox cónyuge habilitado y marcado automáticamente');
            } else {
              // Si no es cónyuge o conviviente, desmarcar y deshabilitar el checkbox de cónyuge
              const conyugeControl = this.ingresoAdicionalForm.get('firma_conyuge');
              conyugeControl?.setValue(false); // Desmarcar el checkbox
              conyugeControl?.disable(); // Deshabilitar el control
              this.mostrarMotivo = false;
              this.motivoDeseleccionGuardado = '';
              console.log('Checkbox cónyuge desmarcado y deshabilitado automáticamente');
            }
          }
        } else {
          this.esParejaConyuge = false;
          // Si no hay aportante seleccionado, desmarcar y deshabilitar el checkbox de cónyuge
          const conyugeControl = this.ingresoAdicionalForm.get('firma_conyuge');
          conyugeControl?.setValue(false); // Desmarcar el checkbox
          conyugeControl?.disable(); // Deshabilitar el control
        }

        // Forzar la detección de cambios para actualizar la vista
        this.cdr.detectChanges();
      });

    console.log('Componente inicializado');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Optimizar para procesar solo los cambios relevantes
    if (changes['detalleEconomico']) {
      // Inicializar detalleEconomico si el nuevo valor es undefined
      if (!changes['detalleEconomico'].currentValue) {
        this.detalleEconomico = { negocio: null, ingreso_dependiente: null };
      }

      // Validar solo si hay un valor en el campo de importe
      if (this.importe_act?.value) {
        this.validarImporteAdicional();
        // Forzar la detección de cambios para actualizar la vista
        this.cdr.markForCheck();
      }
    }
  }

  updateFormValues(ingresoAdicional: Partial<IngresoAdicional & { omitido?: boolean, motivoDeseleccion?: string }> = {}): void {
    // Si el ingreso adicional está omitido, aplicar el estado de omisión
    if ((ingresoAdicional as any)?.omitido) {
      console.log('🚫 Ingreso adicional está omitido, aplicando estado de omisión');
      this.omitirIngresoAdicional = true;
      this.omitirAportesTerceros = true;

      // Cargar el motivo de deselección si existe
      if ((ingresoAdicional as any)?.motivoDeseleccion) {
        this.motivoDeseleccionGuardado = (ingresoAdicional as any).motivoDeseleccion;
        this.mostrarMotivo = true;
      }

      // Aplicar la omisión
      this.confirmarOmision();
      this.confirmarOmisionAportesTerceros();

      console.log('✅ Estado de omisión aplicado para ingreso adicional');
      return;
    }

    // Si no está omitido, cargar los datos normalmente
    this.ingresoAdicionalForm.patchValue({
      id: ingresoAdicional.id || null,
      frecuencia: ingresoAdicional.frecuencia || null,
      importe_act: ingresoAdicional.importe_act || null,
      sustentable: ingresoAdicional.sustentable || false,
      detalle: ingresoAdicional.detalle || null,
      firma_aval: ingresoAdicional.firma_aval || false,
      firma_conyuge: ingresoAdicional.firma_conyuge || false,
      actividad: ingresoAdicional.actividad || null,
      motivo: ingresoAdicional.motivo || null,
      aportante: ingresoAdicional.aportante || null,
      importe_tercero: ingresoAdicional.importe_tercero || null
    });

    // Cargar el motivo de deselección si existe
    if ((ingresoAdicional as any)?.motivoDeseleccion) {
      this.motivoDeseleccionGuardado = (ingresoAdicional as any).motivoDeseleccion;
      this.mostrarMotivo = true;
    }

    // Asegurar que no esté marcado como omitido
    this.omitirIngresoAdicional = false;
    this.omitirAportesTerceros = false;
  }

  initiateForm(): void {
    this.ingresoAdicionalForm = this.fb.group({
      id: [null],
      descripcion: [null, [Validators.required, Validators.minLength(1)]],
      frecuencia: [null, [Validators.required]],
      importe_act: [null, [Validators.required, Validators.min(0)]],
      sustentable: [false],
      detalle: [null, [Validators.required]], // Inicialmente requerido, cambiará según el valor de sustentable
      firma_aval: [false],
      firma_conyuge: [{value: false, disabled: true}], // Inicialmente deshabilitado
      actividad: [null, [Validators.required]],
      // Campos del panel de Aportes de Terceros (requeridos)
      motivo: [null, [Validators.required]],
      aportante: [null, [Validators.required]],
      importe_tercero: [null, [Validators.required, Validators.min(0)]]
    });

    // Configurar la validación para el panel de Aportes de Terceros
    this.setupAportesTercerosValidation();

    // Configurar la validación inicial para el campo detalle según el valor de sustentable
    // (aunque inicialmente sustentable es false, es buena práctica hacerlo explícito)
    if (this.ingresoAdicionalForm.get('sustentable')?.value) {
      this.ingresoAdicionalForm.get('detalle')?.clearValidators();
    } else {
      this.ingresoAdicionalForm.get('detalle')?.setValidators([Validators.required]);
    }
    this.ingresoAdicionalForm.get('detalle')?.updateValueAndValidity();
  }

  /**
   * Configura la validación para el panel de Aportes de Terceros
   * Todos los campos son obligatorios a menos que se omita el panel
   */
  setupAportesTercerosValidation(): void {
    // Obtener los controles del panel de Aportes de Terceros
    const motivo = this.ingresoAdicionalForm.get('motivo');
    const aportante = this.ingresoAdicionalForm.get('aportante');
    const importeTercero = this.ingresoAdicionalForm.get('importe_tercero');

    // Función para actualizar los validadores
    const updateValidators = () => {
      // Si se omite el panel de aportes de terceros, no aplicar validaciones
      if (this.omitirAportesTerceros) {
        motivo?.clearValidators();
        aportante?.clearValidators();
        importeTercero?.clearValidators();
      } else {
        // Todos los campos son obligatorios
        motivo?.setValidators([Validators.required]);
        aportante?.setValidators([Validators.required]);
        importeTercero?.setValidators([Validators.required, Validators.min(0)]);
      }

      // Actualizar los validadores
      motivo?.updateValueAndValidity({ emitEvent: false });
      aportante?.updateValueAndValidity({ emitEvent: false });
      importeTercero?.updateValueAndValidity({ emitEvent: false });
    };

    // Actualizar los validadores inmediatamente
    updateValidators();

    // Suscribirse a los cambios en el estado de omisión
    // Usar takeUntil para limpiar las suscripciones automáticamente
    motivo?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => updateValidators());

    aportante?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => updateValidators());

    importeTercero?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => updateValidators());
  }

  getFormValues(): IngresoAdicional & { omitido?: boolean, motivoDeseleccion?: string } {
    const formValue = this.ingresoAdicionalForm.value;

    // Si ambos paneles están omitidos, devolver objeto con información de omisión
    if (this.omitirIngresoAdicional && this.omitirAportesTerceros) {
      return {
        id: 0,
        frecuencia: '',
        importe_act: 0,
        sustentable: false,
        detalle: '',
        firma_aval: false,
        firma_conyuge: false,
        actividad: '',
        motivo: '',
        aportante: { id: 0, descripcion: '' },
        importe_tercero: 0,
        omitido: true,
        motivoDeseleccion: this.motivoDeseleccionGuardado || ''
      };
    }

    return {
      id: formValue.id || 0,
      frecuencia: formValue.frecuencia?.code || '',
      importe_act: formValue.importe_act || 0,
      sustentable: formValue.sustentable || false,
      detalle: formValue.detalle || '',
      firma_aval: formValue.firma_aval || false,
      firma_conyuge: formValue.firma_conyuge || false,
      actividad: formValue.actividad || '',
      motivo: formValue.motivo || '',
      aportante: formValue.aportante || { id: 0, descripcion: '' },
      importe_tercero: formValue.importe_tercero || 0,
      omitido: false,
      motivoDeseleccion: this.motivoDeseleccionGuardado || ''
    };
  }

  frecuenciaList = [
    { name: 'Semanal', code: 'semanal' },
    { name: 'Quincenal', code: 'quincenal' },
    { name: 'Mensual', code: 'mensual' }
  ];

  /**
   * Valida que el importe del ingreso adicional no supere al importe de la actividad económica
   * @param mostrarMensaje Indica si se debe mostrar un mensaje toast con el error
   * @returns true si la validación es exitosa, false en caso contrario
   */
  validarImporteAdicional(mostrarMensaje: boolean = false): boolean {
    // Si se ha omitido el ingreso adicional, no validamos
    if (this.omitirIngresoAdicional) {
      return true;
    }

    const importeAdicional = this.importe_act?.value;

    // Si no hay importe, no podemos validar
    if (!importeAdicional) {
      return true;
    }

    const importeAdicionalNum = Number(importeAdicional);

    // Verificar si tenemos datos de actividad económica
    if (this.detalleEconomico) {
      // Caso 1: Tenemos datos de ingreso dependiente
      if (this.detalleEconomico.ingreso_dependiente?.importe) {
        const importeDependiente = Number(this.detalleEconomico.ingreso_dependiente.importe);

        // Si el importe dependiente es cero o negativo, no podemos validar correctamente
        if (importeDependiente <= 0) {
          if (mostrarMensaje) {
            this.messageToastService.warnMessageToast(
              'Advertencia',
              'El importe del ingreso dependiente es cero o negativo. ' +
              'Por favor, ingrese un valor válido en la sección de Actividad Económica.'
            );
          }
          return true; // Permitimos continuar pero mostramos advertencia
        }

        // Si el ingreso adicional es mayor al ingreso dependiente, mostrar error
        if (importeAdicionalNum > importeDependiente) {
          if (mostrarMensaje) {
            const mensaje = `El importe del ingreso adicional (${importeAdicionalNum}) no puede ser mayor al ingreso dependiente (${importeDependiente}).`;
            this.messageToastService.errorMessageToast('Error de validación', mensaje);
          }
          return false;
        }

        return true;
      }

      // Caso 2: Tenemos datos de negocio
      else if (this.detalleEconomico.negocio?.registro_ventas?.ventas_normales) {
        const ventasNormales = Number(this.detalleEconomico.negocio.registro_ventas.ventas_normales);

        // Si las ventas normales son cero o negativas, no podemos validar correctamente
        if (ventasNormales <= 0) {
          if (mostrarMensaje) {
            this.messageToastService.warnMessageToast(
              'Advertencia',
              'Las ventas normales son cero o negativas. ' +
              'Por favor, ingrese un valor válido en la sección de Actividad Económica.'
            );
          }
          return true; // Permitimos continuar pero mostramos advertencia
        }

        // Si el ingreso adicional es mayor a las ventas normales, mostrar error
        if (importeAdicionalNum > ventasNormales) {
          if (mostrarMensaje) {
            const mensaje = `El importe del ingreso adicional (${importeAdicionalNum}) no puede ser mayor a las ventas normales (${ventasNormales}).`;
            this.messageToastService.errorMessageToast('Error de validación', mensaje);
          }
          return false;
        }

        return true;
      }
    }

    // Si no hay datos de actividad económica, mostrar advertencia
    if (mostrarMensaje) {
      this.messageToastService.warnMessageToast(
        'Advertencia',
        'No se ha detectado información de actividad económica. ' +
        'Por favor, complete primero la sección de Actividad Económica.'
      );
    }

    return true; // Permitimos continuar si no hay datos de actividad económica
  }

  submit() {
    this.submitted = true;

    // Validar el formulario usando el método validateForm
    if (!this.validateForm()) {
      // Hacer scroll al campo de importe para que el usuario vea el error
      setTimeout(() => {
        // Enfocar el campo de importe
        const importeElement = document.getElementById('importe_act');
        if (importeElement) {
          importeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          importeElement.focus();
        }
      }, 100);

      return;
    }

    // Si se han omitido ambos paneles, no guardar datos
    if (this.omitirIngresoAdicional && this.omitirAportesTerceros) {
      console.log('Ingreso adicional y aportes de terceros omitidos');
      this.hideDialog(false);
      return;
    }

    // Si solo se ha omitido el ingreso adicional, no guardar datos
    if (this.omitirIngresoAdicional) {
      console.log('Ingreso adicional principal omitido');
      this.hideDialog(false);
      return;
    }

    // Si no se ha omitido, proceder normalmente
    this.ingresoAdicional = {
      ...this.ingresoAdicionalForm.value,
    };

    if (this.editabled) {
      this.editingresoAdicional();
    } else {
      this.tabingresoAdicional();
    }

    // No reiniciamos el formulario ni cambiamos el estado del checkbox
    // El método hideDialog se encargará de mantener el estado correcto

    this.hideDialog(false);
  }

  tabingresoAdicional() {
    this.ingresoAdicionalService.create(this.ingresoAdicional).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editingresoAdicional() {
    this.ingresoAdicionalService.update(this.ingresoAdicional.id, this.ingresoAdicional).subscribe({
      next: () => {
        this.switchMessageHandler('edit');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  cancel() {
    this.display = !this.display;
    this.submitted = false;
    this.ingresoAdicionalForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;

    // Guardar el estado actual del checkbox de cónyuge y otras variables importantes
    const firmaConyuge = this.firma_conyuge.value;
    const mostrarMotivo = this.mostrarMotivo;
    const motivoGuardado = this.motivoDeseleccionGuardado;
    const esParejaConyuge = this.esParejaConyuge;

    // Emitir el evento antes de reiniciar el formulario
    this.closedDialog.emit(display);

    // Esperar a que se procese el evento antes de reiniciar
    setTimeout(() => {
      const conyugeControl = this.ingresoAdicionalForm.get('firma_conyuge');

      // Si el aportante es cónyuge/conviviente, habilitar y mantener el checkbox marcado
      // a menos que se haya desmarcado explícitamente con un motivo
      if (esParejaConyuge) {
        conyugeControl?.enable(); // Habilitar el control

        if (!firmaConyuge && mostrarMotivo) {
          // Si se desmarcó con motivo, mantener desmarcado
          conyugeControl?.setValue(false);
          this.mostrarMotivo = mostrarMotivo;
          this.motivoDeseleccionGuardado = motivoGuardado;
        } else {
          // Si no se desmarcó o no hay motivo, mantener marcado
          conyugeControl?.setValue(true);
        }
      } else {
        // Si no es cónyuge o conviviente, desmarcar y deshabilitar el checkbox
        conyugeControl?.setValue(false);
        conyugeControl?.disable(); // Deshabilitar el control
        this.mostrarMotivo = false;
        this.motivoDeseleccionGuardado = '';
      }

      // Forzar la detección de cambios
      this.cdr.detectChanges();
    }, 0);
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.ingresoAdicionalForm.controls['id'];
  }

  get descripcion() {
    return this.ingresoAdicionalForm.controls['descripcion'];
  }

  get frecuencia() {
    return this.ingresoAdicionalForm.controls['frecuencia'];
  }

  get importe_act() {
    return this.ingresoAdicionalForm.controls['importe_act'];
  }

  get sustentable() {
    return this.ingresoAdicionalForm.controls['sustentable'];
  }

  get detalle() {
    return this.ingresoAdicionalForm.controls['detalle'];
  }

  get firma_aval() {
    return this.ingresoAdicionalForm.controls['firma_aval'];
  }

  get firma_conyuge() {
    return this.ingresoAdicionalForm.controls['firma_conyuge'];
  }

  get actividad() {
    return this.ingresoAdicionalForm.controls['actividad'];
  }

  get motivo() {
    return this.ingresoAdicionalForm.controls['motivo'];
  }

  get aportante() {
    return this.ingresoAdicionalForm.controls['aportante'];
  }

  get importe_tercero() {
    return this.ingresoAdicionalForm.controls['importe_tercero'];
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
        event.preventDefault();
    }
  }

  /**
   * Valida el formulario marcando todos los campos como touched y verificando si es válido
   * @param markAsTouched Si es true, marca todos los campos como touched para mostrar los errores
   * @returns true si el formulario es válido o si se han omitido los paneles correspondientes, false en caso contrario
   */
  validateForm(markAsTouched: boolean = true): boolean {
    // Validar el panel principal de ingreso adicional
    const isPanelPrincipalValid = this.validatePanelPrincipal(markAsTouched);

    // Validar el panel de aportes de terceros
    const isPanelAportesTercerosValid = this.validatePanelAportesTerceros(markAsTouched);

    // El formulario es válido si ambos paneles son válidos
    return isPanelPrincipalValid && isPanelAportesTercerosValid;
  }

  /**
   * Valida el panel principal de ingreso adicional
   * @param markAsTouched Si es true, marca todos los campos como touched para mostrar los errores
   * @returns true si el panel es válido o si se ha omitido, false en caso contrario
   */
  validatePanelPrincipal(markAsTouched: boolean = true): boolean {
    // Si se ha marcado la opción de omitir, permitir avanzar sin validar este panel
    if (this.omitirIngresoAdicional) {
      return true;
    }

    // Asegurarse de que los validadores estén configurados correctamente
    // Restaurar los validadores para los campos obligatorios
    this.ingresoAdicionalForm.get('actividad')?.setValidators([Validators.required]);
    this.ingresoAdicionalForm.get('frecuencia')?.setValidators([Validators.required]);
    this.ingresoAdicionalForm.get('importe_act')?.setValidators([Validators.required, Validators.min(0)]);

    // Si el checkbox de sustentable está marcado, el detalle es opcional
    // Si no está marcado, el detalle es requerido
    if (this.sustentable.value) {
      this.ingresoAdicionalForm.get('detalle')?.clearValidators();
    } else {
      this.ingresoAdicionalForm.get('detalle')?.setValidators([Validators.required]);
    }

    // Actualizar los validadores
    this.ingresoAdicionalForm.get('actividad')?.updateValueAndValidity();
    this.ingresoAdicionalForm.get('frecuencia')?.updateValueAndValidity();
    this.ingresoAdicionalForm.get('importe_act')?.updateValueAndValidity();
    this.ingresoAdicionalForm.get('detalle')?.updateValueAndValidity();

    // Marcar los campos del panel principal como touched para mostrar los errores
    // Solo cuando se hace clic en "siguiente" (markAsTouched = true)
    if (markAsTouched) {
      this.actividad.markAsTouched();
      this.frecuencia.markAsTouched();
      this.importe_act.markAsTouched();
      this.detalle.markAsTouched();
    }

    // Verificar si hay campos inválidos en el panel principal
    const camposFaltantes: string[] = [];
    if (this.actividad.invalid) camposFaltantes.push('Actividad');
    if (this.frecuencia.invalid) camposFaltantes.push('Frecuencia');
    if (this.importe_act.invalid) camposFaltantes.push('Importe');
    if (this.detalle.invalid) camposFaltantes.push('Detalle');

    // Si hay campos faltantes en el panel principal
    if (camposFaltantes.length > 0) {
      if (markAsTouched) {
        this.messageToastService.warnMessageToast(
          'Atención',
          `Por favor complete los siguientes campos: ${camposFaltantes.join(', ')} o marque la opción para omitir el ingreso adicional.`
        );
      }
      return false;
    }

    // Validar que el importe del ingreso adicional no supere al ingreso de actividad económica
    // Solo mostrar mensajes de error si se solicita marcar como touched
    if (!this.validarImporteAdicional(markAsTouched)) {
      return false;
    }

    return true;
  }

  /**
   * Valida el panel de aportes de terceros
   * @param markAsTouched Si es true, marca todos los campos como touched para mostrar los errores
   * @returns true si el panel es válido o si se ha omitido, false en caso contrario
   */
  validatePanelAportesTerceros(markAsTouched: boolean = true): boolean {
    // Si se ha marcado la opción de omitir, permitir avanzar sin validar este panel
    if (this.omitirAportesTerceros) {
      return true;
    }

    // Configurar la validación para que todos los campos sean requeridos
    this.setupAportesTercerosValidation();

    // Marcar los campos del panel de aportes de terceros como touched para mostrar los errores
    // Solo cuando se hace clic en "siguiente" (markAsTouched = true)
    if (markAsTouched) {
      this.aportante.markAsTouched();
      this.importe_tercero.markAsTouched();
      this.motivo.markAsTouched();
    }

    // Verificar si hay campos inválidos en el panel de aportes de terceros
    const camposFaltantesAportes: string[] = [];
    if (this.aportante.invalid) camposFaltantesAportes.push('Aportante');
    if (this.importe_tercero.invalid) camposFaltantesAportes.push('Importe de tercero');
    if (this.motivo.invalid) camposFaltantesAportes.push('Motivo');

    // Si hay campos faltantes en el panel de aportes de terceros
    if (camposFaltantesAportes.length > 0) {
      if (markAsTouched) {
        this.messageToastService.warnMessageToast(
          'Atención',
          `Por favor complete los siguientes campos en Aportes de Terceros: ${camposFaltantesAportes.join(', ')} o marque la opción para omitir este panel.`
        );
      }
      return false;
    }

    return true;
  }





  /**
   * Muestra un mensaje de confirmación cuando se marca la opción de omitir ingreso adicional
   * o restaura las validaciones cuando se desmarca
   */
  confirmarOmision(): void {
    if (this.omitirIngresoAdicional) {
      // Mostrar mensaje de confirmación
      if (this.omitirAportesTerceros) {
        this.messageToastService.successMessageToast(
          'Correcto',
          'Todos los paneles de Ingreso Adicional han sido omitidos. Puede continuar al siguiente paso.'
        );
      } else {
        this.messageToastService.infoMessageToast(
          'Información',
          'Se ha omitido el panel de Ingreso Adicional. Complete o marque como omitido el panel de Aportes de Terceros para continuar.'
        );
      }

      // Reiniciar solo los campos del panel principal
      this.ingresoAdicionalForm.patchValue({
        id: null,
        descripcion: null,
        frecuencia: null,
        importe_act: null,
        sustentable: false,
        detalle: null,
        actividad: null
      });

      // Limpiar los errores de validación y deshabilitar los campos del panel principal
      const camposPrincipales = ['id', 'descripcion', 'frecuencia', 'importe_act', 'sustentable', 'detalle', 'actividad'];
      camposPrincipales.forEach(key => {
        const control = this.ingresoAdicionalForm.get(key);
        if (control) {
          control.setErrors(null);
          control.markAsUntouched();
          control.disable(); // Deshabilitar el control
        }
      });

      // Forzar la detección de cambios para actualizar la vista
      this.cdr.markForCheck();
    } else {
      // Si se desmarca la opción de omitir, restaurar las validaciones pero no marcar como tocados

      // Habilitar y restaurar los validadores para los campos obligatorios
      const actividadControl = this.ingresoAdicionalForm.get('actividad');
      const frecuenciaControl = this.ingresoAdicionalForm.get('frecuencia');
      const importeControl = this.ingresoAdicionalForm.get('importe_act');
      const detalleControl = this.ingresoAdicionalForm.get('detalle');

      actividadControl?.enable();
      actividadControl?.setValidators([Validators.required]);
      actividadControl?.updateValueAndValidity();
      actividadControl?.markAsUntouched();

      frecuenciaControl?.enable();
      frecuenciaControl?.setValidators([Validators.required]);
      frecuenciaControl?.updateValueAndValidity();
      frecuenciaControl?.markAsUntouched();

      importeControl?.enable();
      importeControl?.setValidators([Validators.required, Validators.min(0)]);
      importeControl?.updateValueAndValidity();
      importeControl?.markAsUntouched();

      detalleControl?.enable();
      detalleControl?.setValidators([Validators.required]);
      detalleControl?.updateValueAndValidity();
      detalleControl?.markAsUntouched();

      // También habilitar los campos no requeridos
      this.ingresoAdicionalForm.get('id')?.enable();
      this.ingresoAdicionalForm.get('descripcion')?.enable();
      this.ingresoAdicionalForm.get('sustentable')?.enable();

      // Mostrar mensaje si el otro panel está omitido
      if (this.omitirAportesTerceros) {
        this.messageToastService.infoMessageToast(
          'Información',
          'Se ha desmarcado la omisión del panel de Ingreso Adicional. Complete este panel o márquelo como omitido nuevamente para continuar.'
        );
      }

      // Forzar la detección de cambios para actualizar la vista
      this.cdr.markForCheck();
    }
  }

  /**
   * Maneja la omisión del panel de aportes de terceros
   */
  confirmarOmisionAportesTerceros(): void {
    if (this.omitirAportesTerceros) {
      // Mostrar mensaje de confirmación
      if (this.omitirIngresoAdicional) {
        this.messageToastService.successMessageToast(
          'Correcto',
          'Todos los paneles de Ingreso Adicional han sido omitidos. Puede continuar al siguiente paso.'
        );
      } else {
        this.messageToastService.infoMessageToast(
          'Información',
          'Se ha omitido el panel de Aportes de Terceros. Complete o marque como omitido el panel de Ingreso Adicional para continuar.'
        );
      }

      // Reiniciar solo los campos del panel de aportes de terceros
      this.ingresoAdicionalForm.patchValue({
        motivo: null,
        aportante: null,
        importe_tercero: null,
        firma_aval: false,
        firma_conyuge: false
      });

      // Limpiar los errores de validación y deshabilitar los campos del panel
      const camposAportesTerceros = ['motivo', 'aportante', 'importe_tercero', 'firma_aval', 'firma_conyuge'];
      camposAportesTerceros.forEach(key => {
        const control = this.ingresoAdicionalForm.get(key);
        if (control) {
          control.setErrors(null);
          control.markAsUntouched();
          control.disable(); // Deshabilitar el control
        }
      });

      // Actualizar los validadores
      this.setupAportesTercerosValidation();
    } else {
      // Si se desmarca la opción de omitir, restaurar las validaciones pero no marcar como tocados

      // Habilitar los campos del panel de Aportes de Terceros
      const camposAportesTerceros = ['motivo', 'aportante', 'importe_tercero', 'firma_aval', 'firma_conyuge'];
      camposAportesTerceros.forEach(key => {
        const control = this.ingresoAdicionalForm.get(key);
        if (control) {
          control.enable(); // Habilitar el control
          control.markAsUntouched();
        }
      });

      this.setupAportesTercerosValidation();

      // Mostrar mensaje si el otro panel está omitido
      if (this.omitirIngresoAdicional) {
        this.messageToastService.infoMessageToast(
          'Información',
          'Se ha desmarcado la omisión del panel de Aportes de Terceros. Complete este panel o márquelo como omitido nuevamente para continuar.'
        );
      }
    }

    // Forzar la detección de cambios para actualizar la vista
    this.cdr.markForCheck();
  }

  /**
   * Verifica si se está desmarcando el checkbox de cónyuge y muestra el diálogo si es necesario
   * @param event El evento de cambio del checkbox
   */
  verificarDeseleccionConyuge(event: any): void {
    const checked = event.checked;
    console.log('Checkbox cónyuge cambiado a:', checked);
    console.log('Es cónyuge/conviviente:', this.esParejaConyuge);

    // Si se está desmarcando el checkbox y es cónyuge/conviviente, mostrar diálogo
    if (this.esParejaConyuge && !checked) {
      console.log('Intentando desmarcar checkbox de cónyuge para cónyuge/conviviente');

      // Prevenir la deselección inmediata
      this.ingresoAdicionalForm.get('firma_conyuge')?.setValue(true);

      // Mostrar el diálogo para ingresar el motivo
      this.mostrarDialogoMotivo = true;
      this.motivoDeseleccionConyuge = '';

      console.log('Diálogo mostrado:', this.mostrarDialogoMotivo);

      // Forzar la detección de cambios
      this.cdr.detectChanges();
    }
  }

  /**
   * Cancela la deselección del checkbox de cónyuge
   */
  cancelarDeseleccionConyuge(): void {
    console.log('Cancelando deselección');

    // Cerrar el diálogo
    this.mostrarDialogoMotivo = false;

    // Restaurar el valor anterior (mantener marcado)
    this.ingresoAdicionalForm.get('firma_conyuge')?.setValue(true);

    // Mostrar mensaje informativo
    this.messageToastService.infoMessageToast(
      'Información',
      'Se ha cancelado la deselección de la firma del cónyuge.'
    );

    // Forzar la detección de cambios para actualizar la vista
    this.cdr.detectChanges();
  }

  /**
   * Confirma la deselección del checkbox de cónyuge
   */
  confirmarDeseleccionConyuge(): void {
    console.log('Confirmando deselección con motivo:', this.motivoDeseleccionConyuge);

    if (this.motivoDeseleccionConyuge && this.motivoDeseleccionConyuge.trim() !== '') {
      // Guardar el motivo
      this.motivoDeseleccionGuardado = this.motivoDeseleccionConyuge.trim();
      this.mostrarMotivo = true;

      console.log('Motivo de deselección guardado:', this.motivoDeseleccionGuardado);

      // Cerrar el diálogo
      this.mostrarDialogoMotivo = false;

      // Asegurarse de que el checkbox quede desmarcado
      this.ingresoAdicionalForm.get('firma_conyuge')?.setValue(false);

      // Mostrar mensaje de confirmación
      this.messageToastService.infoMessageToast(
        'Información',
        'Se ha registrado el motivo de deselección de la firma del cónyuge.'
      );

      // Forzar la detección de cambios para actualizar la vista
      this.cdr.detectChanges();
    } else {
      // Si no hay motivo, mostrar mensaje de error
      this.messageToastService.warnMessageToast(
        'Atención',
        'Debe ingresar un motivo para deseleccionar la firma del cónyuge.'
      );
    }
  }

  /**
   * Verifica si el formulario está completo (válido o omitido)
   * @returns true si el formulario está completo, false en caso contrario
   */
  isFormComplete(): boolean {
    // Si ambos paneles están omitidos, el formulario está completo
    if (this.omitirIngresoAdicional && this.omitirAportesTerceros) {
      return true;
    }

    // Si solo el panel principal está omitido, verificar el panel de aportes de terceros
    if (this.omitirIngresoAdicional && !this.omitirAportesTerceros) {
      return this.validatePanelAportesTerceros(false);
    }

    // Si solo el panel de aportes de terceros está omitido, verificar el panel principal
    if (!this.omitirIngresoAdicional && this.omitirAportesTerceros) {
      return this.validatePanelPrincipal(false);
    }

    // Si ningún panel está omitido, verificar ambos
    if (!this.omitirIngresoAdicional && !this.omitirAportesTerceros) {
      return this.validateForm(false);
    }

    return false;
  }

  /**
   * Obtiene un mensaje de validación detallado para mostrar en el HTML
   * @returns Mensaje de validación
   */
  obtenerMensajeValidacion(): string {
    // Si se ha omitido el ingreso adicional, no mostramos mensaje de validación
    if (this.omitirIngresoAdicional) {
      return '';
    }

    if (this.detalleEconomico) {
      if (this.detalleEconomico.ingreso_dependiente?.importe) {
        const importeDependiente = Number(this.detalleEconomico.ingreso_dependiente.importe);
        return `El ingreso adicional debe ser menor o igual al ingreso principal (${importeDependiente}).`;
      }
      else if (this.detalleEconomico.negocio?.registro_ventas?.ventas_normales) {
        const ventasNormales = Number(this.detalleEconomico.negocio.registro_ventas.ventas_normales);
        return `El ingreso adicional debe ser menor o igual al ingreso principal (${ventasNormales}).`;
      }
    }

    return 'No se ha encontrado información de actividad económica. Por favor, complete primero la sección de Act.Económica antes de ingresar un ingreso adicional.';
  }



}