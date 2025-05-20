import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
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

import { Conyuge } from '../../../../domain/conyuge.model';
import { LocalConyugeService, LocalTipoViviendaService } from '../../../../services/local-data-container.service';
import { debounceTime, filter, distinctUntilChanged } from 'rxjs';
import { LoadPersonService } from '../../../../../shared/utils/load-person.service';


@Component({
  selector: 'app-conyuge-tab',
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
    Message
  ],
  templateUrl: './conyuge-tab.component.html',
  styleUrl: './conyuge-tab.component.scss',
  providers: [LocalConyugeService, LocalTipoViviendaService, MessageService]
})
export class ConyugeTabComponent implements OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() conyuge: Conyuge = { id: 0, apellidos: '', nombres: '', dni: '' };
  @Input() title = '';
  @Input() editabled: boolean = false;
  @Input() isRequired: boolean = false;
  @Input() requiredReason: string = '';
  @Input() montoSolicitud: number = 0;
  @Input() avalCompletado: boolean = false;

  get showWarning(): boolean {
    return this.isRequired && !this.isFormComplete();
  }

  conyuges = signal<Conyuge[]>([]);
  selectedConyuges!: Conyuge[] | null;
  tipoViviendasList = computed(() => this.tipoViviendaService.data());
  conyugeForm!: FormGroup;
  submitted: boolean = false;
  displayAffiliation: boolean = false;
  motivoDialogVisible: boolean = false;
  motivoTemp: string = '';

  constructor(
    private conyugeService: LocalConyugeService,
    private tipoViviendaService: LocalTipoViviendaService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private loadPersonService: LoadPersonService
  ) {
    this.initiateForm();
    this.setupAutoApiCall()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conyuge']) {
      this.updateFormValues();
    }
  }

  updateFormValues(conyuge: Partial<Conyuge> = {}): void {
    this.conyugeForm.patchValue({
      id: conyuge.id || 0,
      apellidos: conyuge.apellidos || '',
      nombres: conyuge.nombres || '',
      dni: conyuge.dni || '',
      celular: conyuge.celular || '',
      actividad: conyuge.actividad || '',
      omitido: conyuge.omitido || false,
      motivo: conyuge.motivo || ''
    });
  }

  getFormValues(): Conyuge {
    const formValue = this.conyugeForm.value;

    return {
      id: formValue.id || 0,
      apellidos: formValue.apellidos || '',
      nombres: formValue.nombres || '',
      dni: formValue.dni || '',
      celular: formValue.celular || undefined,
      actividad: formValue.actividad || undefined,
      omitido: formValue.omitido || false,
      motivo: formValue.motivo || undefined
    };
  }

  initiateForm(): void {
    this.conyugeForm = this.fb.group({
      id: [0], // No es requerido, se generará automáticamente
      apellidos: ['', [Validators.required, Validators.minLength(1)]],
      nombres: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      fecha_born: [null],
      celular: ['', [Validators.required]],
      actividad: ['', [Validators.required]],
      omitido: [false],
      motivo: ['']
    });
  }

  submit() {
    this.submitted = true;
    if (this.conyugeForm.invalid) {
      this.conyugeForm.markAllAsTouched();
      return;
    }

    if (this.conyugeForm.valid) {
      this.conyuge = {
        ...this.conyugeForm.value
      };
      if (this.editabled) {
        this.editConyuge();
      } else {
        this.tabConyuge();
      }
      this.hideDialog(false);
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar los errores
   * No marca los campos como tocados si se ha marcado la opción de omitir
   */
  markAllFieldsAsTouched() {
    const isOmitido = this.conyugeForm.get('omitido')?.value === true;
    const hasMotivo = !!this.conyugeForm.get('motivo')?.value;

    if (isOmitido && hasMotivo) {
      return;
    }
    this.conyugeForm.markAllAsTouched();
  }

  tabConyuge() {
    this.conyugeService.create(this.conyuge).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
        // Emitir evento para indicar que se ha completado el cónyuge
        this.conyugeCompletado.emit(true);
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editConyuge() {
    this.conyugeService.update(this.conyuge.id, this.conyuge).subscribe({
      next: () => {
        this.switchMessageHandler('edit');
        // Emitir evento para indicar que se ha completado el cónyuge
        this.conyugeCompletado.emit(true);
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  cancel() {
    this.display = !this.display;
    this.submitted = false;
    this.conyugeForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.conyugeForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();
  @Output() conyugeCompletado = new EventEmitter<boolean>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.conyugeForm.controls['id'];
  }

  get apellidos() {
    return this.conyugeForm.controls['apellidos'];
  }

  get nombres() {
    return this.conyugeForm.controls['nombres'];
  }

  get dni() {
    return this.conyugeForm.controls['dni'];
  }

  get celular() {
    return this.conyugeForm.controls['celular'];
  }

  get actividad() {
    return this.conyugeForm.controls['actividad'];
  }

  showClearIcon = false;

  onDniInput() {
    const dniValue = this.dni.value;
    this.showClearIcon = dniValue && this.dniEncontradoEnBD;
  }

  dniEncontradoEnBD = false;

  buscarDni() {
    const dni = this.dni.value;
    this.conyugeService.getById(dni).subscribe(resp => {
      if (resp) {
        this.dniEncontradoEnBD = true;
        this.showClearIcon = true;
      }
    });
  }

  clearDni() {
    this.dni.reset();
    this.dniEncontradoEnBD = false;
    this.showClearIcon = false;
    this.conyugeForm.reset();
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
      event.preventDefault();
    }
  }

  /**
   * Verifica si el formulario está completo y válido
   * @returns true si todos los campos requeridos están completos y válidos
   */
  isFormComplete(): boolean {
    if (!this.conyugeForm) return false;
    if (this.conyugeForm.get('omitido')?.value === true && this.conyugeForm.get('motivo')?.value) {
      return true;
    }

    const requiredFields = [
      'apellidos', 'nombres', 'dni', 'celular', 'actividad'
    ];

    for (const field of requiredFields) {
      const control = this.conyugeForm.get(field);
      if (!control || control.invalid || !control.value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Alterna el estado de omisión del cónyuge
   */
  toggleOmitirConyuge(): void {
    // Invertir el estado actual
    const omitido = !this.conyugeForm.get('omitido')?.value;
    this.conyugeForm.get('omitido')?.setValue(omitido);

    if (omitido) {
      this.motivoTemp = this.conyugeForm.get('motivo')?.value || '';
      this.motivoDialogVisible = true;
      if (this.conyugeForm) {
        const requiredFields = [
          'apellidos', 'nombres', 'dni', 'celular', 'actividad'
        ];
        requiredFields.forEach(field => {
          const control = this.conyugeForm.get(field);
          if (control) {
            control.setErrors(null);
            control.markAsUntouched();
          }
        });
      }
    } else {
      this.conyugeForm.patchValue({ motivo: '' });
      const requiredFields = [
        'apellidos', 'nombres', 'dni', 'celular', 'actividad'
      ];

      // Restaurar los validadores para cada campo
      requiredFields.forEach(field => {
        const control = this.conyugeForm.get(field);
        if (control) {
          control.setValidators([Validators.required]);
          control.updateValueAndValidity();
        }
      });

      this.conyugeForm.markAllAsTouched();
    }
  }

  confirmarMotivo(): void {
    if (this.motivoTemp.trim()) {
      this.conyugeForm.patchValue({ motivo: this.motivoTemp });
      this.motivoDialogVisible = false;
      if (this.conyugeForm) {
        const requiredFields = [
          'apellidos', 'nombres', 'dni', 'celular', 'actividad'
        ];
        requiredFields.forEach(field => {
          const control = this.conyugeForm.get(field);
          if (control) {
            control.setErrors(null);
            control.markAsUntouched();
          }
        });
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Formulario de Cónyuge omitido correctamente. Puede continuar.'
      });

      // Emitir evento para indicar que se ha completado el cónyuge (omitido)
      this.conyugeCompletado.emit(true);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe ingresar un motivo para omitir el formulario'
      });
    }
  }


  cancelarMotivo(): void {
    this.conyugeForm.patchValue({ omitido: false, motivo: '' });
    this.motivoDialogVisible = false;

    const requiredFields = [
      'apellidos', 'nombres', 'dni', 'celular', 'actividad'
    ];

    requiredFields.forEach(field => {
      const control = this.conyugeForm.get(field);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    });
    this.conyugeForm.markAllAsTouched();

    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Se ha cancelado la omisión del formulario de Cónyuge. Por favor, complete todos los campos requeridos.'
    });
  }

  setupAutoApiCall() {
    this.dni?.valueChanges
      .pipe(
        debounceTime(500),
        filter((dni) => dni?.length === 8 && this.dni.valid),
        distinctUntilChanged()
      )
      .subscribe((dni) => {
        this.callApi(dni);
      });
  }

  callApi(dni: string) {
    this.loadPersonService.consultarDni(dni).subscribe({
      next: (response) => {
        if (response.persona.codigoRespuesta === '0000') {
          const client = this.loadPersonService.mapApiToAval(response);
          this.conyugeForm.patchValue({
            apellidos: client.apellidos,
            nombres: client.nombres,
            direccion: client.direccion
          });
        } else {
          this.conyugeForm.reset();
        }
      },
    });
  }
}