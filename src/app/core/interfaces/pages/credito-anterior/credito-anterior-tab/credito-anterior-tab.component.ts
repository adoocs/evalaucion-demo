import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
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
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { PanelModule } from 'primeng/panel';
import { KeyFilterModule } from 'primeng/keyfilter';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { Tasa } from '../../../../domain/tasa.model';
import { Periodo } from '../../../../domain/periodo.model';
import { CreditoAnterior } from '../../../../domain/credito-anterior.model';
import { LocalCreditoAnteriorService, LocalTasaService, LocalPeriodoService } from '../../../../services/local-data-container.service';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-credito-anterior-tab',
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
    TextareaModule,
    TooltipModule,
    Message
  ],
  templateUrl: './credito-anterior-tab.component.html',
  styleUrl: './credito-anterior-tab.component.scss',
  providers: [LocalCreditoAnteriorService, LocalTasaService, MessageService, LocalPeriodoService, MessageToastService]
})
export class CreditoAnteriorTabComponent implements OnInit, OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() creditoAnterior: CreditoAnterior = { id: 0, monto: 0, saldo: 0, fecha_pago: '', estado: '', tasa: { id: 0, porcentaje: 0 }, periodo: { id: 0, descripcion: '' }, cuotas_pagadas: 0, cuotas_totales: 0 };
  @Input() title = '';
  @Input() editabled: boolean = false;

  creditoAnteriors = signal<CreditoAnterior[]>([]);
  selectedCreditoAnteriors!: CreditoAnterior[] | null;
  tasaList = computed(() => this.tasaService.data());
  periodoList = computed(() => this.periodoService.data());
  creditoAnteriorForm!: FormGroup;
  submitted: boolean = false;
  displayAffiliation: boolean = false;
  omitirCreditoAnterior: boolean = false;

  /**
   * Maneja el cambio en el checkbox de omitir crédito anterior
   * @param event Evento del checkbox
   */
  onOmitirCreditoAnteriorChange(event: any): void {
    this.omitirCreditoAnterior = event;
    this.confirmarOmision();
  }

  constructor(
    private creditoAnteriorService: LocalCreditoAnteriorService,
    private tasaService: LocalTasaService,
    private periodoService: LocalPeriodoService,
    private messageService: MessageToastService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
  }

  ngOnInit(): void {
    this.tasaService.loadInitialData();
    this.periodoService.loadInitialData();
    this.creditoAnteriorForm.get('monto')?.valueChanges.subscribe(() => {
      this.validateMontoSaldo();
    });

    this.creditoAnteriorForm.get('saldo')?.valueChanges.subscribe(() => {
      this.validateMontoSaldo();
    });
  }

  /**
   * Valida en tiempo real que el monto no supere al saldo
   * Muestra mensajes de error en los campos correspondientes
   */
  validateMontoSaldo(): void {
    const montoControl = this.creditoAnteriorForm.get('monto');
    const saldoControl = this.creditoAnteriorForm.get('saldo');
    const monto = montoControl?.value;
    const saldo = saldoControl?.value;

    // Solo validamos si ambos campos tienen valores
    if (monto !== null && saldo !== null && monto !== '' && saldo !== '') {
      if (parseFloat(monto) > parseFloat(saldo)) {
        // Establecer error en el formulario
        this.creditoAnteriorForm.setErrors({ 'montoMayorQueSaldo': true });

        // Mostrar mensaje toast solo si ambos campos han sido tocados
        if (montoControl?.touched && saldoControl?.touched) {
          this.messageService.warnMessageToast(
            'Validación',
            'El monto no debe superar al saldo'
          );
        }
      } else {
        // Eliminar el error si ya no existe
        const currentErrors = this.creditoAnteriorForm.errors;
        if (currentErrors) {
          delete currentErrors['montoMayorQueSaldo'];
          const remainingErrors = Object.keys(currentErrors).length > 0 ? currentErrors : null;
          this.creditoAnteriorForm.setErrors(remainingErrors);
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['creditoAnterior']) {
      this.updateFormValues();
    }
  }

  updateFormValues(credito: Partial<CreditoAnterior> = {}): void {
    this.creditoAnteriorForm.patchValue({
      id: credito.id || null,
      monto: credito.monto || null,
      saldo: credito.saldo || null,
      fecha_pago: credito.fecha_pago ? new Date(credito.fecha_pago) : null,
      cuotas_pagadas: credito.cuotas_pagadas || null,
      cuotas_totales: credito.cuotas_totales || null,
      estado: credito.estado || '',
      tasa: credito.tasa || null,
      periodo: credito.periodo || null
    });
  }

  initiateForm(): void {
    this.creditoAnteriorForm = this.fb.group({
      id: [null], // ID es opcional
      monto: [null, [Validators.required, Validators.min(0)]],
      saldo: [null, [Validators.required, Validators.min(0)]],
      fecha_pago: [null], // Ya no es requerido, lo mantenemos por compatibilidad
      cuotas_pagadas: [null, [Validators.required, Validators.min(0)]],
      cuotas_totales: [null, [Validators.required, Validators.min(1)]],
      estado: ['', [Validators.required]],
      tasa: [null as Tasa | null, [Validators.required]],
      periodo: [null as Periodo | null, [Validators.required]],
      omitido: [false] // Campo para indicar si se omite el formulario
    }, { validators: [this.montoSaldoValidator, this.cuotasValidator] });
  }

  /**
   * Validador personalizado para asegurar que las cuotas pagadas no superen a las cuotas totales
   * @param group - El FormGroup a validar
   * @returns Un objeto con el error si las cuotas pagadas son mayores que las cuotas totales, null en caso contrario
   */
  cuotasValidator(group: FormGroup): { [key: string]: any } | null {
    const cuotasPagadasControl = group.get('cuotas_pagadas');
    const cuotasTotalesControl = group.get('cuotas_totales');
    const cuotasPagadas = cuotasPagadasControl?.value;
    const cuotasTotales = cuotasTotalesControl?.value;

    // Solo validamos si ambos campos tienen valores
    if (cuotasPagadas !== null && cuotasTotales !== null &&
        cuotasPagadas !== '' && cuotasTotales !== '' &&
        !isNaN(parseInt(cuotasPagadas)) && !isNaN(parseInt(cuotasTotales))) {

      if (parseInt(cuotasPagadas) > parseInt(cuotasTotales)) {
        return { 'cuotasPagadasMayorQueTotales': true };
      }
    }

    return null;
  }

  /**
   * Validador personalizado para asegurar que el monto no supere al saldo
   * @param group - El FormGroup a validar
   * @returns Un objeto con el error si el monto es mayor que el saldo, null en caso contrario
   */
  montoSaldoValidator(group: FormGroup): { [key: string]: any } | null {
    const montoControl = group.get('monto');
    const saldoControl = group.get('saldo');
    const monto = montoControl?.value;
    const saldo = saldoControl?.value;

    // Solo validamos si ambos campos tienen valores
    if (monto !== null && saldo !== null && monto !== '' && saldo !== '' &&
        !isNaN(parseFloat(monto)) && !isNaN(parseFloat(saldo))) {

      if (parseFloat(monto) > parseFloat(saldo)) {
        return { 'montoMayorQueSaldo': true };
      }
    }

    return null;
  }

  getFormValues(): CreditoAnterior {
    const formValue = this.creditoAnteriorForm.value;
    const fechaPago = formValue.fecha_pago ? this.formatDate(formValue.fecha_pago) : '';

    return {
      id: formValue.id || 0,
      monto: formValue.monto || 0,
      saldo: formValue.saldo || 0,
      fecha_pago: fechaPago,
      estado: formValue.estado.code || '',
      tasa: formValue.tasa || { id: 0, porcentaje: 0 },
      periodo: formValue.periodo || { id: 0, descripcion: '' },
      cuotas_pagadas: formValue.cuotas_pagadas || 0,
      cuotas_totales: formValue.cuotas_totales || 0
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  estadoList = [
    { name: 'Vigente', code: 'Vigente' },
    { name: 'Cancelado', code: 'Cancelado' }
  ];

  submit() {
    this.submitted = true;

    this.creditoAnteriorForm.markAllAsTouched();

    const requiredFields = ['monto', 'saldo', 'cuotas_pagadas', 'cuotas_totales', 'estado', 'tasa', 'periodo'];
    const emptyRequiredFields: string[] = [];

    requiredFields.forEach(field => {
      const control = this.creditoAnteriorForm.get(field);
      const value = control?.value;

      if (control && (value === null || value === undefined || value === '')) {
        emptyRequiredFields.push(field);
      }
    });

    if (emptyRequiredFields.length > 0) {
      const fieldLabels: {[key: string]: string} = {
        'monto': 'Monto',
        'saldo': 'Saldo',
        'fecha_pago': 'Fecha de pago',
        'estado': 'Estado',
        'tasa': 'Tasa',
        'periodo': 'Periodo'
      };

      const emptyFieldLabels = emptyRequiredFields.map(field => fieldLabels[field]);
      this.showWarnMessage('Campos incompletos', `Por favor complete los siguientes campos: ${emptyFieldLabels.join(', ')}`);
      return;
    }

    const monto = this.creditoAnteriorForm.get('monto')?.value;
    const saldo = this.creditoAnteriorForm.get('saldo')?.value;

    if (monto > saldo) {
      this.showWarnMessage('Error', 'El monto no debe superar al saldo');
      return;
    }

    if (!this.creditoAnteriorForm.get('id')?.value) {
      this.creditoAnteriorForm.get('id')?.setValue(0);
    }

    this.creditoAnterior = {
      ...this.creditoAnteriorForm.value,
    };
    if (this.editabled) {
      this.editcreditoAnterior();
    } else {
      this.tabcreditoAnterior();
    }
    this.hideDialog(false);
  }

  /**
   * Obtiene la lista de campos que están vacíos en el formulario
   * @returns Array con los nombres de los campos vacíos
   */
  getEmptyFields(): string[] {
    const emptyFields: string[] = [];
    const fieldLabels: {[key: string]: string} = {
      'monto': 'Monto',
      'saldo': 'Saldo',
      'cuotas_pagadas': 'Cuotas pagadas',
      'cuotas_totales': 'Cuotas totales',
      'estado': 'Estado',
      'tasa': 'Tasa',
      'periodo': 'Periodo'
    };

    Object.keys(fieldLabels).forEach(field => {
      const control = this.creditoAnteriorForm.get(field);
      const value = control?.value;

      if (control && (value === null || value === undefined || value === '')) {
        emptyFields.push(fieldLabels[field]);
      }
    });

    return emptyFields;
  }

  tabcreditoAnterior() {
    this.creditoAnteriorService.create(this.creditoAnterior).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editcreditoAnterior() {
    this.creditoAnteriorService.update(this.creditoAnterior.id, this.creditoAnterior).subscribe({
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
    this.creditoAnteriorForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.creditoAnteriorForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.creditoAnteriorForm.controls['id'];
  }

  get monto() {
    return this.creditoAnteriorForm.controls['monto'];
  }

  get saldo() {
    return this.creditoAnteriorForm.controls['saldo'];
  }

  get fecha_pago() {
    return this.creditoAnteriorForm.controls['fecha_pago'];
  }

  get cuotas_pagadas() {
    return this.creditoAnteriorForm.controls['cuotas_pagadas'];
  }

  get cuotas_totales() {
    return this.creditoAnteriorForm.controls['cuotas_totales'];
  }

  get estado() {
    return this.creditoAnteriorForm.controls['estado'];
  }

  get tasa() {
    return this.creditoAnteriorForm.controls['tasa'];
  }

  get periodo() {
    return this.creditoAnteriorForm.controls['periodo'];
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
        event.preventDefault();
    }
  }

  /**
   * Muestra un mensaje de advertencia usando MessageService
   * @param summary - Título del mensaje
   * @param detail - Detalle del mensaje
   */
  showWarnMessage(summary: string, detail: string): void {
    this.messageService.warnMessageToast(summary, detail);
  }

  /**
   * Verifica si el formulario está completo y válido
   * @returns true si todos los campos requeridos están completos y válidos o si se ha omitido el formulario
   */
  isFormComplete(): boolean {
    if (!this.creditoAnteriorForm) return false;
    if (this.omitirCreditoAnterior) {
      return true;
    }
    const requiredFields = [
      'monto', 'saldo', 'cuotas_pagadas', 'cuotas_totales', 'estado', 'tasa', 'periodo'
    ];

    for (const field of requiredFields) {
      const control = this.creditoAnteriorForm.get(field);
      if (!control || control.invalid || !control.value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Muestra un mensaje de confirmación cuando se marca la opción de omitir
   * y reinicia el formulario
   */
  confirmarOmision(): void {
    if (this.omitirCreditoAnterior) {
      this.messageService.infoMessageToast(
        'Información',
        'Se omitirá el crédito anterior y el formulario se reiniciará.'
      );

      this.creditoAnteriorForm.reset({
        id: null,
        monto: null,
        saldo: null,
        fecha_pago: null,
        cuotas_pagadas: null,
        cuotas_totales: null,
        estado: '',
        tasa: null,
        periodo: null,
        omitido: true
      });

      Object.keys(this.creditoAnteriorForm.controls).forEach(key => {
        const control = this.creditoAnteriorForm.get(key);
        control?.setErrors(null);
        control?.markAsUntouched();
      });
    } else {
      const requiredFields = [
        'monto', 'saldo', 'cuotas_pagadas', 'cuotas_totales', 'estado', 'tasa', 'periodo'
      ];
      requiredFields.forEach(field => {
        const control = this.creditoAnteriorForm.get(field);
        if (control) {
          control.setValidators([Validators.required]);
          control.updateValueAndValidity();
          control.markAsUntouched();
        }
      });
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar los errores
   * No marca los campos como tocados si se ha marcado la opción de omitir
   */
  markAllFieldsAsTouched() {
    if (this.omitirCreditoAnterior) {
      return;
    }
    this.creditoAnteriorForm.markAllAsTouched();
  }

  /**
   * Valida el formulario marcando todos los campos como touched y verificando si es válido
   * @param markAsTouched - Indica si se deben marcar los campos como tocados (default: true)
   * @returns true si el formulario es válido o si se ha omitido el crédito anterior, false en caso contrario
   */
  validateForm(markAsTouched: boolean = true): boolean {
    // Si se ha omitido el crédito anterior, el formulario se considera válido
    if (this.omitirCreditoAnterior) {
      return true;
    }

    // Campos requeridos para validar
    const requiredFields = [
      'monto', 'saldo', 'cuotas_pagadas', 'cuotas_totales', 'estado', 'tasa', 'periodo'
    ];

    // Asegurarse de que todos los campos tengan validadores requeridos
    requiredFields.forEach(field => {
      const control = this.creditoAnteriorForm.get(field);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    });

    // Marcar todos los campos como tocados solo si se solicita
    if (markAsTouched) {
      this.creditoAnteriorForm.markAllAsTouched();
    }

    // Validar que el formulario sea válido
    if (this.creditoAnteriorForm.invalid) {
      // Mostrar mensaje solo si se solicita marcar como tocados
      if (markAsTouched) {
        this.messageService.warnMessageToast(
          'Atención',
          'Por favor complete todos los campos requeridos en la pestaña de Crédito Anterior o marque la opción para omitirlo.'
        );
      }
      return false;
    }

    // Validar específicamente que el monto no supere al saldo
    const montoControl = this.creditoAnteriorForm.get('monto');
    const saldoControl = this.creditoAnteriorForm.get('saldo');
    const monto = montoControl?.value;
    const saldo = saldoControl?.value;

    if (monto !== null && saldo !== null && monto !== '' && saldo !== '' &&
        !isNaN(parseFloat(monto)) && !isNaN(parseFloat(saldo))) {

      if (parseFloat(monto) > parseFloat(saldo)) {
        // Mostrar mensaje solo si se solicita marcar como tocados
        if (markAsTouched) {
          this.messageService.warnMessageToast(
            'Error',
            'El monto no debe superar al saldo'
          );
        }
        return false;
      }
    }

    return true;
  }
}