import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { Aval } from '../../../../domain/aval.model';
import { LocalAvalService, LocalTipoViviendaService } from '../../../../services/local-data-container.service';
import { debounceTime, filter, distinctUntilChanged } from 'rxjs';
import { LoadPersonService } from '../../../../../shared/utils/load-person.service';


@Component({
  selector: 'app-aval-tab',
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
    TextareaModule,
    KeyFilterModule,
    CheckboxModule,
    Message
  ],
  templateUrl: './aval-tab.component.html',
  styleUrl: './aval-tab.component.scss',
  providers: [LocalAvalService, LocalTipoViviendaService, MessageService]
})
export class AvalTabComponent implements OnInit {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() aval: Aval = { id: 0, apellidos: '', nombres: '', dni: '', tipo_vivienda: { id: 0, descripcion: '' } };
  @Input() title = '';
  @Input() editabled: boolean = false;
  @Input() isRequired: boolean = false;
  @Input() requiredReason: string = '';
  @Input() isRecommended: boolean = false;
  @Input() recommendedReason: string = '';
  @Input() conyugeCompletado: boolean = false;
  selectedAvals!: Aval[] | null;
  tipoViviendasList = computed(() => this.tipoViviendaService.data());
  avalForm!: FormGroup;
  submitted: boolean = false;
  motivoDialogVisible: boolean = false;
  motivoTemp: string = '';

  constructor(
    private avalService: LocalAvalService,
    private tipoViviendaService: LocalTipoViviendaService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private loadPersonService: LoadPersonService
  ) {
    this.initiateForm();
  }
  ngOnInit(): void {
    this.tipoViviendaService.loadInitialData();
    // this.setupAutoApiCall()

  }

  get showWarning(): boolean {
    return this.isRequired && !this.isFormComplete();
  }

  get showRecommendation(): boolean {
    return this.isRecommended && !this.isFormComplete();
  }

  /**
   * Verifica si el formulario está completo y válido
   * @returns true si todos los campos requeridos están completos y válidos
   */
  isFormComplete(): boolean {
    if (!this.avalForm) return false;

    if (this.avalForm.get('omitido')?.value === true && this.avalForm.get('motivo')?.value) {
      return true;
    }

    const requiredFields = [
      'apellidos', 'nombres', 'dni', 'direccion',
      'celular', 'actividad', 'parentesco', 'tipo_vivienda'
    ];

    for (const field of requiredFields) {
      const control = this.avalForm.get(field);
      if (!control || control.invalid || !control.value) {
        return false;
      }
    }

    // Verificar que n_referencial sea válido si tiene valor
    const nReferencialControl = this.avalForm.get('n_referencial');
    if (nReferencialControl && nReferencialControl.value && nReferencialControl.invalid) {
      return false;
    }

    return true;
  }

  /**
   * Alterna el estado de omisión del aval
   */
  toggleOmitirAval(): void {
    // Invertir el estado actual
    const omitido = !this.avalForm.get('omitido')?.value;
    this.avalForm.get('omitido')?.setValue(omitido);

    if (omitido) {
      this.motivoTemp = this.avalForm.get('motivo')?.value || '';
      this.motivoDialogVisible = true;
      if (this.avalForm) {
        const requiredFields = [
          'apellidos', 'nombres', 'dni', 'direccion',
          'celular', 'n_referencial', 'actividad', 'parentesco', 'tipo_vivienda'
        ];
        requiredFields.forEach(field => {
          const control = this.avalForm.get(field);
          if (control) {
            control.setErrors(null);
            control.markAsUntouched();
            control.disable(); // Deshabilitar el control
          }
        });
      }
    } else {
      this.avalForm.patchValue({ motivo: '' });
      const requiredFields = [
        'apellidos', 'nombres', 'dni', 'direccion',
        'celular', 'n_referencial', 'actividad', 'parentesco', 'tipo_vivienda'
      ];

      requiredFields.forEach(field => {
        const control = this.avalForm.get(field);
        if (control) {
          control.enable(); // Habilitar el control
          if (field !== 'n_referencial') { // n_referencial es opcional
            control.setValidators([Validators.required]);
          }
          control.updateValueAndValidity();
        }
      });

      this.avalForm.markAllAsTouched();
    }
  }
  confirmarMotivo(): void {
    if (this.motivoTemp.trim()) {
      this.avalForm.patchValue({ motivo: this.motivoTemp });
      this.motivoDialogVisible = false;

      if (this.avalForm) {
        const requiredFields = [
          'apellidos', 'nombres', 'dni', 'direccion',
          'celular', 'n_referencial', 'actividad', 'parentesco', 'tipo_vivienda'
        ];

        requiredFields.forEach(field => {
          const control = this.avalForm.get(field);
          if (control) {
            control.setErrors(null);
            control.markAsUntouched();
            control.disable(); // Asegurar que estén deshabilitados
          }
        });
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Formulario de AVAL omitido correctamente. Puede continuar.'
      });

      // Emitir evento para indicar que se ha completado el aval (omitido)
      this.avalCompletado.emit(true);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe ingresar un motivo para omitir el formulario'
      });
    }
  }

  /**
   * Cancela el diálogo de motivo y desmarca el checkbox
   * Restaura los validadores y marca los campos como tocados
   */
  cancelarMotivo(): void {
    this.avalForm.patchValue({ omitido: false, motivo: '' });
    this.motivoDialogVisible = false;
    const requiredFields = [
      'apellidos', 'nombres', 'dni', 'direccion',
      'celular', 'n_referencial', 'actividad', 'parentesco', 'tipo_vivienda'
    ];

    requiredFields.forEach(field => {
      const control = this.avalForm.get(field);
      if (control) {
        control.enable(); // Habilitar el control
        if (field !== 'n_referencial') { // n_referencial es opcional
          control.setValidators([Validators.required]);
        }
        control.updateValueAndValidity();
      }
    });

    this.avalForm.markAllAsTouched();

    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Se ha cancelado la omisión del formulario de AVAL. Por favor, complete todos los campos requeridos.'
    });
  }

  updateFormValues(aval: Partial<Aval> = {}): void {
    console.log('Actualizando formulario de aval:', aval);

    // Buscar el tipo de vivienda completo
    const tipoViviendaCompleto = this.tipoViviendasList().find(tv => tv.id === aval.tipo_vivienda?.id);

    console.log('Tipo vivienda encontrado para aval:', tipoViviendaCompleto);

    this.avalForm.patchValue({
      id: aval.id || null,
      apellidos: aval.apellidos || '',
      nombres: aval.nombres || '',
      dni: aval.dni || '',
      direccion: aval.direccion || '',
      celular: aval.celular || '',
      n_referencial: aval.n_referencial || null,
      actividad: aval.actividad || '',
      parentesco: aval.parentesco || '',
      tipo_vivienda: tipoViviendaCompleto,
      omitido: aval.omitido || false,
      motivo: aval.motivo || ''
    });

    console.log('Formulario de aval actualizado');
  }

  initiateForm(): void {
    this.avalForm = this.fb.group({
      id: [0], // No es requerido, se generará automáticamente
      apellidos: ['', [Validators.required, Validators.minLength(1)]],
      nombres: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      n_referencial: ['', [Validators.minLength(9), Validators.maxLength(9)]],
      actividad: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
      tipo_vivienda: [null, [Validators.required]],
      omitido: [false],
      motivo: ['']
    });
  }

  getFormValues(): Aval {
    const formValue = this.avalForm.value;

    return {
      id: formValue.id || 0,
      apellidos: formValue.apellidos || '',
      nombres: formValue.nombres || '',
      dni: formValue.dni || '',
      direccion: formValue.direccion || undefined,
      celular: formValue.celular || undefined,
      n_referencial: formValue.n_referencial || undefined,
      actividad: formValue.actividad || undefined,
      parentesco: formValue.parentesco || undefined,
      tipo_vivienda: formValue.tipo_vivienda,
      omitido: formValue.omitido || false,
      motivo: formValue.motivo || undefined
    };
  }

  submit() {
    this.submitted = true;
    if (this.avalForm.invalid) {
      this.avalForm.markAllAsTouched();
      return;
    }

    if (this.avalForm.valid) {
      this.aval = {
        ...this.avalForm.value,
      };
      if (this.editabled) {
        this.editAval();
      } else {
        this.tabAval();
      }
      this.hideDialog(false);
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar los errores
   * No marca los campos como tocados si se ha marcado la opción de omitir
   */
  markAllFieldsAsTouched() {
    const isOmitido = this.avalForm.get('omitido')?.value === true;
    const hasMotivo = !!this.avalForm.get('motivo')?.value;

    if (isOmitido && hasMotivo) {
      return;
    }
    this.avalForm.markAllAsTouched();
  }

  tabAval() {
    this.avalService.create(this.aval).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
        // Emitir evento para indicar que se ha completado el aval
        this.avalCompletado.emit(true);
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editAval() {
    this.avalService.update(this.aval.id, this.aval).subscribe({
      next: () => {
        this.switchMessageHandler('edit');
        // Emitir evento para indicar que se ha completado el aval
        this.avalCompletado.emit(true);
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  cancel() {
    this.display = !this.display;
    this.submitted = false;
    this.avalForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.avalForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();
  @Output() avalCompletado = new EventEmitter<boolean>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.avalForm.controls['id'];
  }

  get apellidos() {
    return this.avalForm.controls['apellidos'];
  }

  get nombres() {
    return this.avalForm.controls['nombres'];
  }

  get dni() {
    return this.avalForm.controls['dni'];
  }

  get direccion() {
    return this.avalForm.controls['direccion'];
  }

  get celular() {
    return this.avalForm.controls['celular'];
  }

  get n_referencial() {
    return this.avalForm.controls['n_referencial'];
  }

  get actividad() {
    return this.avalForm.controls['actividad'];
  }

  get parentesco() {
    return this.avalForm.controls['parentesco'];
  }

  get tipo_vivienda() {
    return this.avalForm.controls['tipo_vivienda'];
  }

  showClearIcon = false;

  onDniInput() {
    const dniValue = this.dni.value;
    this.showClearIcon = dniValue && this.dniEncontradoEnBD;
  }

  dniEncontradoEnBD = false;

  buscarDni() {
    const dni = this.dni.value;
    this.avalService.getById(dni).subscribe(resp => {
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
    this.avalForm.reset();
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
      event.preventDefault();
    }
  }

  /**
   * Verifica si el formulario está completo y muestra un mensaje
   */
  verificarFormulario() {
    this.avalForm.markAllAsTouched();

    if (this.isFormComplete()) {
      this.messageService.add({
        severity: 'success',
        summary: '¡Correcto!',
        detail: 'El formulario de AVAL está completo. Puede continuar.'
      });
    } else {
      const camposFaltantes = this.getCamposFaltantes();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario incompleto',
        detail: `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`
      });
    }
  }

  /**
   * Obtiene la lista de campos que faltan por completar
   * @returns Array con los nombres de los campos faltantes
   */
  private getCamposFaltantes(): string[] {
    const camposFaltantes: string[] = [];
    const camposNombres: { [key: string]: string } = {
      'apellidos': 'Apellidos',
      'nombres': 'Nombres',
      'dni': 'DNI',
      'direccion': 'Dirección',
      'celular': 'Celular',
      'actividad': 'Actividad',
      'parentesco': 'Parentesco',
      'tipo_vivienda': 'Tipo de vivienda'
    };

    for (const field in camposNombres) {
      const control = this.avalForm.get(field);
      if (!control || control.invalid || !control.value) {
        camposFaltantes.push(camposNombres[field]);
      }
    }
    return camposFaltantes;
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
          this.avalForm.patchValue({
            apellidos: client.apellidos,
            nombres: client.nombres,
            direccion: client.direccion
          });
        } else {
          this.avalForm.reset();
        }
      },
    });
  }
}