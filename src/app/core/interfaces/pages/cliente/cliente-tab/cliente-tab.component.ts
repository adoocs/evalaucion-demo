import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
import { Cliente } from '../../../../domain/cliente.model';
import { InputMaskModule } from 'primeng/inputmask';
import { TipoVivienda } from '../../../../domain/tipo-vivienda.model';
import { LocalTipoViviendaService, LocalClienteService } from '../../../../services/local-data-container.service';
import { debounceTime, filter, distinctUntilChanged } from 'rxjs';
import { LocalLoadPersonService } from '../../../../../shared/utils/local-load-person.service';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { dniFormatValidator } from '../../../../validators/dni-unique.validator';

@Component({
  selector: 'app-cliente-tab',
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
    InputMaskModule,
    KeyFilterModule,
    Message
  ],
  templateUrl: './cliente-tab.component.html',
  styleUrl: './cliente-tab.component.scss',
  providers: [MessageService]
})
export class ClienteTabComponent implements OnInit {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() cliente: Cliente | null = null;
  @Input() title = '';
  @Input() editabled: boolean = false;
  @Output() emitCliente = new EventEmitter<Cliente>();
  @Output() dniValid = new EventEmitter<string>();
  @Output() requiresAvalChange = new EventEmitter<{ required: boolean, reason: string }>();
  @Output() clienteChange = new EventEmitter<Cliente>();
  @Input() validateUniqueDni?: (dni: string, type: 'cliente' | 'aval' | 'conyuge') => any;

  selectedClientes!: Cliente[] | null;
  clienteForm!: FormGroup;
  submitted: boolean = false;
  disabled: boolean = true;
  max18Date: Date;

  // Propiedades para la validación de AVAL
  requiresAval: boolean = false;
  avalReason: string = '';

  tipoViviendaList = computed(() => this.tipoViviendaService.data());
  constructor(
    private localLoadPersonService: LocalLoadPersonService,
    protected tipoViviendaService: LocalTipoViviendaService,
    private clienteService: LocalClienteService,
    private messageToastService: MessageToastService,
    private fb: FormBuilder
  ) {
    const today = new Date();
    this.max18Date = new Date(today.getFullYear() - 18, today.getMonth(), today.getDay());
    this.initiateForm();
  }
  ngOnInit(): void {
    this.tipoViviendaService.loadInitialData();
    //this.setupAutoApiCall();

    // Suscribirse a cambios en los campos relevantes
    this.setupFormListeners();
  }

  // Variables para controlar los debounce de los eventos
  private debounceTimer: any = null;
  private isProcessing: boolean = false;

  /**
   * Configura listeners para detectar cambios en campos relevantes
   */
  setupFormListeners() {
    // Listener para estado civil
    this.clienteForm.get('estado_civil')?.valueChanges.subscribe(() => {
      this.debounceValidation();
    });

    // Listener para tipo de vivienda
    this.clienteForm.get('tipo_vivienda')?.valueChanges.subscribe(() => {
      this.debounceValidation();
    });

    // Listener para fecha de nacimiento (que afecta la edad)
    this.clienteForm.get('fecha_born')?.valueChanges.subscribe((value) => {
      if (value) {
        this.calculateAge(value);
        // No llamamos a debounceValidation aquí porque calculateAge ya llama a checkIfRequiresAval
      }
    });
  }

  /**
   * Maneja el evento cuando cambia el estado civil
   * @param event El evento de cambio
   */
  onEstadoCivilChange(event: any): void {
    console.log('Estado civil cambiado:', event.value);

    // Emitir el evento clienteChange con el cliente actualizado
    const clienteData = this.getFormValues();
    this.clienteChange.emit(clienteData);

    // Verificar si requiere AVAL
    this.checkIfRequiresAval();
  }

  /**
   * Aplica un debounce a las validaciones para evitar múltiples llamadas
   */
  private debounceValidation() {
    // Si ya hay un timer pendiente, cancelarlo
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Si ya está procesando, no hacer nada
    if (this.isProcessing) {
      return;
    }

    // Crear un nuevo timer
    this.debounceTimer = setTimeout(() => {
      this.isProcessing = true;
      this.checkIfRequiresAval();
      this.isProcessing = false;
      this.debounceTimer = null;
    }, 300); // Esperar 300ms antes de ejecutar la validación
  }

  updateFormValues(cliente: Cliente): void {
    if (!cliente) return;

    console.log('Actualizando formulario de cliente:', cliente);

    // Buscar objetos completos para los selects
    const estadoCivilCompleto = this.estadoCivilList.find(ec => ec.code === cliente.estado_civil);
    const generoCompleto = this.generoList.find(g => g.code === cliente.genero);
    const gradoInstruccionCompleto = this.gradoInstruccionList.find(gi => gi.code === cliente.grado_instruccion);
    const tipoViviendaCompleto = this.tipoViviendaList().find(tv => tv.id === cliente.tipo_vivienda?.id);

    console.log('Estado civil encontrado:', estadoCivilCompleto);
    console.log('Género encontrado:', generoCompleto);
    console.log('Grado instrucción encontrado:', gradoInstruccionCompleto);
    console.log('Tipo vivienda encontrado:', tipoViviendaCompleto);

    this.clienteForm.patchValue({
      id: cliente.id,
      apellidos: cliente.apellidos,
      nombres: cliente.nombres,
      dni: cliente.dni,
      fecha_born: cliente.fecha_born ? new Date(cliente.fecha_born + 'T00:00:00') : null,
      estado_civil: estadoCivilCompleto,
      edad: cliente.edad,
      genero: generoCompleto,
      direccion: cliente.direccion,
      celular: cliente.celular,
      n_referencial: cliente.n_referencial,
      grado_instruccion: gradoInstruccionCompleto,
      email: cliente.email,
      tipo_vivienda: tipoViviendaCompleto
    });

    // Calcular la edad si hay fecha de nacimiento
    if (cliente.fecha_born) {
      this.calculateAge(new Date(cliente.fecha_born + 'T00:00:00'));
    }

    // Verificar si requiere aval después de cargar los datos
    this.checkIfRequiresAval();

    console.log('Formulario de cliente actualizado');
  }

  initiateForm() {
    this.clienteForm = this.fb.group({
      id: [null, []],
      apellidos: [null, [Validators.required, Validators.minLength(1)]],
      nombres: [null, [Validators.required]],
      dni: ['', [Validators.required, dniFormatValidator, this.dniUniqueValidatorFn.bind(this)]],
      fecha_born: [this.max18Date, [Validators.required, this.minAgeValidator(18)]],
      estado_civil: [null, [Validators.required]],
      edad: [{ value: null, disabled: true }, [Validators.required]],
      genero: [null, [Validators.required]],
      direccion: [null, [Validators.required]],
      celular: [null, [Validators.required]],
      n_referencial: [null, [Validators.minLength(9), Validators.maxLength(9)]],
      grado_instruccion: [null, [Validators.required]],
      email: [null, [Validators.email]],
      tipo_vivienda: [null, [Validators.required]],
    });
    this.calculateAge(this.max18Date);
  }

  estadoCivilList = [
    { name: 'Soltero(a)', code: 'soltero' },
    { name: 'Casado(a)', code: 'casado' },
    { name: 'Viudo(a)', code: 'viudo' },
    { name: 'Divorciado(a)', code: 'divorciado' },
    { name: 'Conviviente', code: 'conviviente' },
  ];

  generoList = [
    { name: 'Masculino', code: 'M' },
    { name: 'Femenino', code: 'F' }
  ];

  gradoInstruccionList = [
    { name: 'Primaria', code: 'primaria' },
    { name: 'Secundaria', code: 'secundaria' },
    { name: 'Tecnica Superior', code: 'tecnica' },
    { name: 'Universitaria', code: 'universitaria' },
    { name: 'No especifica', code: 'no' },
  ];

  getFormValues(): Cliente {
    const formValue = this.clienteForm.value;

    // Manejar correctamente los valores aunque el formulario no esté completamente válido
    return {
      id: formValue.id || 0,
      apellidos: formValue.apellidos || '',
      nombres: formValue.nombres || '',
      dni: formValue.dni || '',
      fecha_born: formValue.fecha_born ? this.formatDate(formValue.fecha_born) : undefined,
      estado_civil: formValue.estado_civil?.code || formValue.estado_civil || undefined,
      edad: this.clienteForm.get('edad')?.value || undefined,
      genero: formValue.genero?.code || formValue.genero || '',
      direccion: formValue.direccion || undefined,
      celular: formValue.celular || undefined,
      n_referencial: formValue.n_referencial || undefined,
      grado_instruccion: formValue.grado_instruccion?.code || formValue.grado_instruccion || undefined,
      email: formValue.email || undefined,
      tipo_vivienda: formValue.tipo_vivienda || {} as TipoVivienda
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  submit() {
    this.submitted = true;
  }

  emitData() {
    this.emitCliente.emit(this.getFormValues());
  }

  onDniBlur() {
    if (this.dni?.value?.length === 8 && this.dni.valid) {
      this.dniValid.emit(this.dni.value);
    }
  }

  onDateSelect(event: any) {
    this.calculateAge(event);
    this.checkIfRequiresAval();
  }

  cancel() {
    this.display = !this.display;
    this.submitted = false;
    this.clienteForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.clienteForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.clienteForm.controls['id'];
  }

  get apellidos() {
    return this.clienteForm.controls['apellidos'];
  }

  get nombres() {
    return this.clienteForm.controls['nombres'];
  }

  get dni() {
    return this.clienteForm.controls['dni'];
  }

  get fecha_born() {
    return this.clienteForm.controls['fecha_born'];
  }

  get estado_civil() {
    return this.clienteForm.controls['estado_civil'];
  }

  get edad() {
    return this.clienteForm.controls['edad'];
  }

  get genero() {
    return this.clienteForm.controls['genero'];
  }

  get direccion() {
    return this.clienteForm.controls['direccion'];
  }

  get celular() {
    return this.clienteForm.controls['celular'];
  }

  get n_referencial() {
    return this.clienteForm.controls['n_referencial'];
  }

  get grado_instruccion() {
    return this.clienteForm.controls['grado_instruccion'];
  }

  get email() {
    return this.clienteForm.controls['email'];
  }

  get tipo_vivienda() {
    return this.clienteForm.controls['tipo_vivienda'];
  }

  /**
   * Validador personalizado para DNI único
   * @param control Control del formulario
   * @returns ValidationErrors | null
   */
  dniUniqueValidatorFn(control: AbstractControl): ValidationErrors | null {
    const dni = control.value;

    if (!dni || dni.length !== 8) {
      return null; // No validar DNI incompletos
    }

    // Solo validar si tenemos la función de validación del padre
    if (this.validateUniqueDni) {
      const validation = this.validateUniqueDni(dni, 'cliente');

      if (!validation.isValid) {
        return {
          dniDuplicated: {
            message: validation.message,
            usedIn: validation.usedIn
          }
        };
      }
    }

    return null;
  }

  minAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const dateValue = control.value;
      if (!dateValue) return null;

      const today = new Date();
      const birthDate = new Date(dateValue);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge ? null : { minAge: true };
      }

      return age >= minAge ? null : { minAge: true };
    };
  }

  showClearIcon = false;

  onDniInput() {
    const dniValue = this.dni.value;
    this.showClearIcon = dniValue && this.dniEncontradoEnBD;
  }

  dniEncontradoEnBD = false;

  buscarDni() {
    const dni = this.dni.value;
    console.log('Buscando DNI en BD (DEMO):', dni);

    // Versión demo: Simular la búsqueda del DNI en la base de datos
    // Consideramos que los DNI que comienzan con 1 ya existen en la BD
    const exists = dni && dni.startsWith('1');

    if (exists) {
      console.log('DNI encontrado en BD (DEMO)');
      this.dniEncontradoEnBD = true;
      this.showClearIcon = true;
    } else {
      console.log('DNI no encontrado en BD (DEMO)');
      this.dniEncontradoEnBD = false;
      this.showClearIcon = false;
    }
  }

  clearDni() {
    this.dni.reset();
    this.dniEncontradoEnBD = false;
    this.showClearIcon = false;
    this.clienteForm.reset();
  }

  getForm() {
    return this.clienteForm;
  }



  calculateAge(birthDate: Date) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    this.clienteForm.patchValue({
      edad: age
    });
    this.disabled = false;

    // Verificar si requiere AVAL por edad
    this.checkIfRequiresAval();
  }

  /**
   * Verifica si el cliente requiere AVAL basado en las reglas de negocio
   * - Si tiene casa alquilada
   * - Si es menor de 24 años
   */
  checkIfRequiresAval() {
    // Obtener los datos del formulario aunque no esté completamente válido
    const clienteData = this.getFormValues();
    const tiposVivienda = this.tipoViviendaList();

    if (!clienteData || !tiposVivienda || tiposVivienda.length === 0) {
      return;
    }

    // Verificar si tenemos los campos mínimos necesarios para la validación
    const hasMinimumFields = clienteData.edad !== undefined &&
      clienteData.tipo_vivienda !== undefined &&
      clienteData.estado_civil !== undefined;

    if (!hasMinimumFields) {
      return;
    }

    // Verificar cada regla por separado para emitir eventos individuales

    // 1. Verificar si el cliente tiene menos de 24 años
    if (clienteData.edad && clienteData.edad < 24) {
      const edadValidation = {
        required: true,
        reason: 'El cliente es menor de 24 años, por lo que requiere AVAL independientemente del tipo de vivienda.'
      };

      // Actualizar propiedades
      this.requiresAval = true;
      this.avalReason = edadValidation.reason;

      // Emitir eventos
      this.requiresAvalChange.emit(edadValidation);
      this.clienteChange.emit(clienteData);
    }

    // 1.1 Verificar si el cliente tiene más de 64 años
    if (clienteData.edad && clienteData.edad > 64) {
      const edadValidation = {
        required: true,
        reason: 'El cliente es mayor de 64 años, por lo que requiere AVAL independientemente del tipo de vivienda.'
      };

      // Actualizar propiedades
      this.requiresAval = true;
      this.avalReason = edadValidation.reason;

      // Emitir eventos
      this.requiresAvalChange.emit(edadValidation);
      this.clienteChange.emit(clienteData);
    }

    // 2. Verificar si el cliente tiene casa propia
    const tipoViviendaPropia = tiposVivienda.find((tv: TipoVivienda) =>
      tv.descripcion.toLowerCase() === 'propia'
    );

    const tieneViviendaPropia = tipoViviendaPropia &&
      clienteData.tipo_vivienda &&
      clienteData.tipo_vivienda.id === tipoViviendaPropia.id;

    if (clienteData.tipo_vivienda && !tieneViviendaPropia) {
      const viviendaValidation = {
        required: true,
        reason: 'El cliente no tiene casa propia, por lo que requiere AVAL.'
      };

      // Actualizar propiedades
      this.requiresAval = true;
      this.avalReason = viviendaValidation.reason;

      // Emitir eventos
      this.requiresAvalChange.emit(viviendaValidation);
      this.clienteChange.emit(clienteData);
    }

    // Si no se cumple ninguna regla, actualizar a false
    if (!(clienteData.edad && clienteData.edad < 24) &&
      !(clienteData.edad && clienteData.edad > 64) &&
      !(clienteData.tipo_vivienda && !tieneViviendaPropia)) {

      const noRequiredValidation = {
        required: false,
        reason: ''
      };

      // Guardar el estado anterior para detectar cambios
      const prevRequiresAval = this.requiresAval;

      // Actualizar propiedades
      this.requiresAval = false;
      this.avalReason = '';

      // Solo emitir eventos si hubo un cambio en el estado de validación
      if (prevRequiresAval !== this.requiresAval) {
        this.requiresAvalChange.emit(noRequiredValidation);
        this.clienteChange.emit(clienteData);
      }
    }
  }

  alpha(event: KeyboardEvent) {
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;
    const key = event.key;

    if (!pattern.test(key)) {
      event.preventDefault();
    }
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
    // Versión demo: Usar el servicio local para consultar DNI
    console.log('Consultando DNI (DEMO):', dni);

    // Primero verificamos si el cliente existe en la base de datos local
    const clienteExistente = this.clienteService.data().find(cliente => cliente.dni === dni);

    if (clienteExistente) {
      console.log('Cliente encontrado en la base de datos local:', clienteExistente);
      this.messageToastService.infoMessageToast('Cliente encontrado', 'Se ha encontrado un cliente con el DNI ' + dni);

      // Actualizar el formulario con los datos del cliente existente
      this.updateFormValues(clienteExistente);
      return;
    }

    // Si no existe en la base de datos local, consultamos el servicio de carga de personas
    this.localLoadPersonService.consultarDni(dni).subscribe({
      next: (response: any) => {
        console.log('Respuesta de consulta DNI (DEMO):', response);

        if (response && response.success && response.persona) {
          const client = this.localLoadPersonService.mapApiToCliente(response);
          console.log('Cliente mapeado (DEMO):', client);

          this.clienteForm.patchValue({
            apellidos: client.apellidos,
            nombres: client.nombres,
            fecha_born: new Date(client.fecha_born ? client.fecha_born + 'T00:00:00.00' : Date.now()),
            estado_civil: this.estadoCivilList.find(ec => ec.code === client.estado_civil) || this.estadoCivilList[0],
            genero: this.generoList.find(g => g.code === client.genero) || this.generoList[0],
            direccion: client.direccion || 'Dirección de ejemplo'
          });

          this.messageToastService.infoMessageToast('Cliente encontrado', 'Se ha encontrado un cliente con el DNI ' + dni);
        } else {
          console.log('No se encontró información para el DNI (DEMO)');
          this.messageToastService.warnMessageToast('Cliente no encontrado', 'No se ha encontrado un cliente con el DNI ' + dni);
          this.clienteForm.reset();

          // Mantener el DNI en el formulario
          this.clienteForm.patchValue({
            dni: dni
          });
        }
      },
      error: (error: any) => {
        console.error('Error al consultar DNI (DEMO):', error);
        this.messageToastService.errorMessageToast('Error', 'No se pudo consultar el servicio de carga de personas');
        this.clienteForm.reset();

        // Mantener el DNI en el formulario
        this.clienteForm.patchValue({
          dni: dni
        });
      }
    });
  }
}