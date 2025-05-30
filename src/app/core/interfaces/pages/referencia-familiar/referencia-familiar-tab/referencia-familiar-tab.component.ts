import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ReferenciaFamiliar } from '../../../../domain/referencia-familiar.model';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { FamiliaMiembros } from '../../../../domain/familia-miembros.model';
import { LocalReferenciaFamiliarService, LocalFamiliaMiembrosService } from '../../../../services/local-data-container.service';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-referencia-familiar-tab',
  standalone: true,
  imports: [
    FormsModule,
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
    Message,
    SafePipe
  ],
  templateUrl: './referencia-familiar-tab.component.html',
  styleUrl: './referencia-familiar-tab.component.scss',
  providers: [LocalReferenciaFamiliarService, MessageService, LocalFamiliaMiembrosService]
})
export class ReferenciaFamiliarTabComponent implements OnChanges {

  @Input() display: boolean = false;
  @Output() closedDialog = new EventEmitter<boolean>();
  @Input() referenciaFamiliar: ReferenciaFamiliar = { id: 0, referencia_domicilio: '', latitud: -7.4006, longitud: -79.5671 };
  @Input() familia: FamiliaMiembros = { id: 0, descripcion: '', n_hijos: 0, condicion: false };
  @Input() title = '';
  @Input() editabled: boolean = false;

  referenciaFamiliars = signal<ReferenciaFamiliar[]>([]);
  selectedReferenciaFamiliars!: ReferenciaFamiliar[] | null;
  referenciaFamiliarForm!: FormGroup;
  submitted: boolean = false;
  displayFamilia: boolean = false;
  familiaMiembrosBase: FamiliaMiembros[] = [];
  familiaMiembrosList: FamiliaMiembros[] = [];

  // Variable para controlar si se omiten los hijos
  omitirHijos: boolean = false;

  // Variable para almacenar mensajes de error de validación
  errorDireccion: string = '';

  // Output para comunicar el estado de validación al componente padre
  @Output() validationChange = new EventEmitter<boolean>();
  constructor(
    private referenciaFamiliarService: LocalReferenciaFamiliarService,
    private familiaMiembrosService: LocalFamiliaMiembrosService,
    private messageService: MessageToastService,
    private fb: FormBuilder
  ) {
    this.initiateForm();
    this.initDataFamiliaMiembros();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['referenciaFamiliar']) {
      this.updateFormValues();
    }
  }

  updateFormValues() {
    if (this.referenciaFamiliar) {
      console.log('Actualizando formulario de referencia familiar:', this.referenciaFamiliar);

      this.referenciaFamiliarForm.patchValue({
        id: this.referenciaFamiliar.id,
        referencia_domicilio: this.referenciaFamiliar.referencia_domicilio,
        direccion: this.referenciaFamiliar.direccion,
        latitud: this.referenciaFamiliar.latitud || 0,
        longitud: this.referenciaFamiliar.longitud || 0,
        familia_miembros: this.referenciaFamiliar.familia_miembros
      });

      // Cargar los miembros de la familia en la tabla
      if (this.referenciaFamiliar.familia_miembros && this.referenciaFamiliar.familia_miembros.length > 0) {
        // Cargar los datos existentes en la lista
        this.familiaMiembrosList = [...this.referenciaFamiliar.familia_miembros];
        console.log('Miembros de familia cargados en la tabla:', this.familiaMiembrosList);
      } else {
        // Si no hay datos, usar la lista base
        this.familiaMiembrosList = [...this.familiaMiembrosBase];
        console.log('No hay miembros de familia para cargar, usando lista base');
      }

      console.log('Formulario de referencia familiar actualizado');
    }
  }

  initDataFamiliaMiembros() {
    this.familiaMiembrosBase = [
      { id: 0, descripcion: 'Infantes', n_hijos: 0, condicion: false },
      { id: 0, descripcion: 'Escolares', n_hijos: 0, condicion: true },
      { id: 0, descripcion: 'Universitarios', n_hijos: 0, condicion: true },
      { id: 0, descripcion: 'Mayores', n_hijos: 0, condicion: false },
    ]
    this.familiaMiembrosList = this.familiaMiembrosBase;
  }

  initiateForm() {
    this.referenciaFamiliarForm = this.fb.group({
      id: [this.referenciaFamiliar.id, [Validators.required, Validators.minLength(1)]],
      referencia_domicilio: [this.referenciaFamiliar.referencia_domicilio, [Validators.minLength(3)]],
      direccion: [this.referenciaFamiliar.direccion, [Validators.required, Validators.minLength(1)]],
      latitud: [this.referenciaFamiliar.latitud || this.PACASMAYO_LAT],
      longitud: [this.referenciaFamiliar.longitud || this.PACASMAYO_LNG],
    });

    // Suscribirse a los cambios en el campo de direccion (intercambiado)
    this.referenciaFamiliarForm.get('direccion')?.valueChanges.subscribe(value => {
      if (value && value.length > 3) {
        this.buscarDireccion(value);
      }
    });

    this.referenciaFamiliarForm.reset();
  }

  getFormValues(): ReferenciaFamiliar {
    return {...this.referenciaFamiliarForm.value, familia_miembros: this.familiaMiembrosList };
  }

  submit() {
    this.submitted = true;
    if (this.referenciaFamiliarForm.invalid) {
      this.referenciaFamiliarForm.markAllAsTouched();
      return;
    }

    if (this.referenciaFamiliarForm.valid) {
      this.referenciaFamiliar = {
        ...this.referenciaFamiliarForm.value,
      };
      if (this.editabled) {
        this.editReferenciaFamiliar();
      } else {
        this.createReferenciaFamiliar();
      }
      this.hideDialog(false);
    }
  }

  createReferenciaFamiliar() {
    this.referenciaFamiliarService.create(this.referenciaFamiliar).subscribe({
      next: () => {
        this.switchMessageHandler('tab');
      },
      error: () => {
        this.switchMessageHandler('error');
      }
    });
  }

  editReferenciaFamiliar() {
    this.referenciaFamiliarService.update(this.referenciaFamiliar.id, this.referenciaFamiliar).subscribe({
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
    this.referenciaFamiliarForm.reset();
    this.closedDialog.emit(this.display)
  }

  hideDialog(display: boolean) {
    this.submitted = false;
    this.editabled = false;
    this.referenciaFamiliarForm.reset();
    this.closedDialog.emit(display)
  }

  @Output() switchMessage = new EventEmitter<string>();

  switchMessageHandler(message: string) {
    this.switchMessage.emit(message);
  }

  get id() {
    return this.referenciaFamiliarForm.controls['id'];
  }

  get referencia_domicilio() {
    return this.referenciaFamiliarForm.controls['referencia_domicilio'];
  }

  get direccion() {
    return this.referenciaFamiliarForm.controls['direccion'];
  }

  closeFamilia(close: boolean) {
    this.displayFamilia = close;
  }

  validarCaracteresDireccion(event: KeyboardEvent) {
    // Patrón actualizado para permitir letras, números, espacios y caracteres especiales comunes en direcciones
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.,#\-_°/]$/;
    const key = event.key;

    if (!pattern.test(key)) {
        event.preventDefault();
    }
  }

  // Método para actualizar las coordenadas del mapa
  actualizarCoordenadas(lat: number, lng: number) {
    this.referenciaFamiliarForm.patchValue({
      latitud: lat,
      longitud: lng
    });
  }

  // Coordenadas predeterminadas para Pacasmayo
  private readonly PACASMAYO_LAT = -7.4006;
  private readonly PACASMAYO_LNG = -79.5671;

  // Método para obtener la URL del mapa con las coordenadas actuales o la dirección
  getMapUrl(): string {
    const direccion = this.referenciaFamiliarForm.get('direccion')?.value;

    // Si hay una dirección con suficiente longitud, usamos la dirección para la búsqueda
    if (direccion && direccion.length > 3) {
      const direccionCompleta = `${direccion}, Pacasmayo, Perú`;
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(direccionCompleta)}&zoom=15`;
    } else {
      // Si no hay dirección, usamos las coordenadas
      const lat = this.referenciaFamiliarForm.get('latitud')?.value || this.PACASMAYO_LAT;
      const lng = this.referenciaFamiliarForm.get('longitud')?.value || this.PACASMAYO_LNG;
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=15`;
    }
  }

  // Método para abrir el mapa en una nueva ventana
  abrirMapaCompleto() {
    const direccion = this.referenciaFamiliarForm.get('direccion')?.value;

    // Si hay una dirección con suficiente longitud, usamos la dirección para la búsqueda
    if (direccion && direccion.length > 3) {
      const direccionCompleta = `${direccion}, Pacasmayo, Perú`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`, '_blank');
    } else {
      // Si no hay dirección, usamos las coordenadas
      const lat = this.referenciaFamiliarForm.get('latitud')?.value || this.PACASMAYO_LAT;
      const lng = this.referenciaFamiliarForm.get('longitud')?.value || this.PACASMAYO_LNG;
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  }

  // Método para buscar una dirección y actualizar las coordenadas
  buscarDireccion(_direccion: string) {
    // En una implementación real, usaríamos la API de Geocoding de Google para obtener las coordenadas exactas
    // basadas en la dirección proporcionada (_direccion)

    // Como alternativa, podemos simular coordenadas cercanas a Pacasmayo
    // Generamos una pequeña variación aleatoria para simular diferentes ubicaciones en Pacasmayo
    const latVariation = (Math.random() - 0.5) * 0.01; // Variación de ±0.005 grados
    const lngVariation = (Math.random() - 0.5) * 0.01; // Variación de ±0.005 grados

    const newLat = this.PACASMAYO_LAT + latVariation;
    const newLng = this.PACASMAYO_LNG + lngVariation;

    // Actualizamos las coordenadas en el formulario
    this.actualizarCoordenadas(newLat, newLng);
  }

  /**
   * Valida la dirección
   * @returns true si la validación es exitosa, false en caso contrario
   */
  validarDireccion(): boolean {
    const direccion = this.referenciaFamiliarForm.get('direccion')?.value;

    if (!direccion || direccion.trim().length < 3) {
      this.errorDireccion = 'La dirección es requerida y debe tener al menos 3 caracteres';
      return false;
    }

    this.errorDireccion = '';
    return true;
  }

  /**
   * Valida que al menos un hijo esté registrado
   * @returns true si hay al menos un hijo, false en caso contrario
   */
  validarAlMenosUnHijo(): boolean {
    // Si se ha omitido la información de hijos, no validar
    if (this.omitirHijos) {
      return true;
    }

    // Verificar si hay al menos un hijo en cualquier categoría
    const hayAlMenosUnHijo = this.familiaMiembrosList.some(m => m.n_hijos > 0);

    return hayAlMenosUnHijo;
  }

  /**
   * Valida que los hijos escolares y universitarios tengan la condición correcta (siempre true)
   */
  validarCondicionEscolaresUniversitarios(): void {
    // Buscar los miembros de familia "Escolares" y "Universitarios"
    const escolares = this.familiaMiembrosList.find(m => m.descripcion === 'Escolares');
    const universitarios = this.familiaMiembrosList.find(m => m.descripcion === 'Universitarios');

    // Si hay escolares, verificar que la condición sea true
    if (escolares && escolares.n_hijos > 0) {
      escolares.condicion = true;
    }

    // Si hay universitarios, verificar que la condición sea true
    if (universitarios && universitarios.n_hijos > 0) {
      universitarios.condicion = true;
    }
  }

  /**
   * Valida todos los campos de la referencia familiar
   * @param markAsTouched Indica si se deben marcar los campos como tocados
   * @returns true si todos los campos son válidos o si se ha omitido la información de hijos, false en caso contrario
   */
  validateForm(markAsTouched: boolean = true): boolean {
    let isValid = true;

    // Validar la dirección (siempre se valida)
    if (!this.validarDireccion()) {
      isValid = false;
      if (markAsTouched) {
        this.messageService.warnMessageToast(
          'Error en Dirección',
          'La dirección es requerida y debe tener al menos 3 caracteres'
        );
      }
    }

    // Validar que al menos un hijo esté registrado (solo si no se ha omitido)
    if (!this.validarAlMenosUnHijo()) {
      isValid = false;
      if (markAsTouched) {
        this.messageService.warnMessageToast(
          'Error en Referencia Familiar',
          'Debe registrar al menos un hijo en cualquier categoría'
        );
      }
    }

    // Validar que los hijos escolares y universitarios tengan la condición correcta
    this.validarCondicionEscolaresUniversitarios();

    // Marcar los campos como tocados si se solicita
    if (markAsTouched) {
      this.referenciaFamiliarForm.markAllAsTouched();
    }

    return isValid;
  }

  /**
   * Verifica si el formulario está completo y válido
   * @returns true si todos los campos son válidos o si se ha omitido la información de hijos, false en caso contrario
   */
  isFormComplete(): boolean {
    return this.validateForm(false);
  }

  /**
   * Alterna el estado de omisión de hijos
   */
  toggleOmitirHijos(): void {
    // Invertir el estado actual
    this.omitirHijos = !this.omitirHijos;
    this.confirmarOmisionHijos();
  }

  /**
   * Muestra un mensaje de confirmación cuando se marca la opción de omitir hijos
   * y reinicia la información de hijos
   */
  confirmarOmisionHijos(): void {
    if (this.omitirHijos) {
      this.messageService.infoMessageToast(
        'Información',
        'Se omitirá la información de hijos.'
      );

      // Reiniciar los miembros de familia
      this.familiaMiembrosList.forEach(m => {
        m.n_hijos = 5;
        if (m.descripcion === 'Escolares' || m.descripcion === 'Universitarios') {
          m.condicion = true;
        } else {
          m.condicion = false;
        }
      });

      // Emitir el estado de validación al componente padre
      this.validationChange.emit(true);
    } else {
      // Emitir el estado de validación al componente padre
      this.validationChange.emit(this.isFormComplete());
    }
  }

  /**
   * Método público para validar el formulario desde el componente padre
   * @returns true si el formulario es válido, false en caso contrario
   */
  public validateFromParent(): boolean {
    // La dirección siempre se valida
    const isDireccionValid = this.validarDireccion();

    // Si la dirección no es válida, mostrar mensaje y marcar como tocado
    if (!isDireccionValid) {
      this.messageService.warnMessageToast(
        'Error en Dirección',
        'La dirección es requerida y debe tener al menos 3 caracteres'
      );
      this.referenciaFamiliarForm.markAllAsTouched();
      this.validationChange.emit(false);
      return false;
    }

    // Si se ha omitido la información de hijos, el formulario se considera válido
    if (this.omitirHijos) {
      this.validationChange.emit(true);
      return true;
    }

    // Validar que al menos un hijo esté registrado
    if (!this.validarAlMenosUnHijo()) {
      this.messageService.warnMessageToast(
        'Error en Referencia Familiar',
        'Debe registrar al menos un hijo en cualquier categoría'
      );
      this.validationChange.emit(false);
      return false;
    }

    // Validar que los hijos escolares y universitarios tengan la condición correcta
    this.validarCondicionEscolaresUniversitarios();

    // Si llegamos aquí, el formulario es válido
    this.validationChange.emit(true);
    return true;
  }
}
