import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageToastService } from '../../../../../shared/utils/message-toast.service';

interface RangoSentinel {
  nombre: string;
  minimo: number;
  maximo: number;
  colorClass: string;
}

@Component({
  selector: 'app-puntaje-sentinel-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    KeyFilterModule,
    FormsModule,
    PanelModule,
    TableModule,
    CheckboxModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './puntaje-sentinel-tab.component.html',
  styleUrl: './puntaje-sentinel-tab.component.scss'
})
export class PuntajeSentinelTabComponent implements OnInit, OnChanges {
  @Input() puntajeSentinelInput: number = 0;
  @Output() puntajeSentinelChange = new EventEmitter<number>();
  @Output() validationChange = new EventEmitter<boolean>();

  puntajeForm!: FormGroup;
  puntajeSentinel: number = 0;
  columnaSeleccionada: number = -1;

  rangos: RangoSentinel[] = [
    { nombre: 'Muy Bajo', minimo: 1, maximo: 146, colorClass: 'bg-red-50' },
    { nombre: 'Bajo', minimo: 147, maximo: 476, colorClass: 'bg-orange-50' },
    { nombre: 'Medio', minimo: 477, maximo: 597, colorClass: 'bg-yellow-50' },
    { nombre: 'Bueno', minimo: 598, maximo: 721, colorClass: 'bg-green-50' },
    { nombre: 'Excelente', minimo: 722, maximo: 999, colorClass: 'bg-green-100' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageToastService: MessageToastService
  ) {}

  ngOnInit() {
    this.puntajeForm = this.fb.group({
      puntaje: ['', [Validators.required, Validators.min(1), Validators.max(999)]],
      omitido: [false]
    });

    this.puntajeForm.get('puntaje')?.valueChanges.subscribe(value => {
      this.puntajeSentinel = value;
      this.actualizarColumnaSeleccionada();
      this.emitChanges();
    });

    // Si hay un valor inicial, establecerlo
    if (this.puntajeSentinelInput) {
      this.puntajeForm.get('puntaje')?.setValue(this.puntajeSentinelInput);
    }

    // Suscribirse a cambios en el formulario para actualizar la validación
    this.puntajeForm.statusChanges.subscribe(() => {
      this.validationChange.emit(this.isFormComplete());
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['puntajeSentinelInput'] && this.puntajeForm) {
      this.puntajeForm.get('puntaje')?.setValue(this.puntajeSentinelInput);
    }
  }

  /**
   * Emite los cambios al componente padre
   */
  emitChanges(): void {
    // Si está omitido, emitir 0 y asegurarse de que puntajeSentinel sea 0
    if (this.puntajeForm.get('omitido')?.value) {
      this.puntajeSentinel = 0;
      this.puntajeSentinelChange.emit(0);
    } else {
      this.puntajeSentinelChange.emit(this.puntajeSentinel);
    }

    // Emitir el estado de validación
    this.validationChange.emit(this.isFormComplete());
  }

  /**
   * Verifica si el formulario está completo (válido o omitido)
   * @returns true si el formulario está completo, false en caso contrario
   */
  isFormComplete(): boolean {
    // Si está omitido, está completo
    if (this.puntajeForm.get('omitido')?.value) {
      return true;
    }

    // Si no está omitido, debe tener un puntaje válido
    if (!this.puntajeForm.get('omitido')?.value) {
      return this.puntajeForm.get('puntaje')?.valid || false;
    }

    return false;
  }

  /**
   * Método público para validar el formulario desde el componente padre
   * @returns true si el formulario es válido, false en caso contrario
   */
  public validateFromParent(): boolean {
    // Si está omitido, el formulario es válido
    if (this.puntajeForm.get('omitido')?.value) {
      this.validationChange.emit(true);
      return true;
    }

    // Marcar todos los campos como tocados para mostrar errores
    this.puntajeForm.markAllAsTouched();

    // Verificar si el formulario es válido
    const isValid = this.puntajeForm.valid;

    // Si no es válido, mostrar mensaje de error
    if (!isValid) {
      this.messageToastService.warnMessageToast(
        'Error en Puntaje Sentinel',
        'Debe ingresar un puntaje válido entre 1 y 999'
      );
    } else {
      this.messageToastService.successMessageToast(
        'Puntaje Sentinel',
        'La información de Puntaje Sentinel ha sido completada correctamente'
      );
    }

    // Emitir el estado de validación
    this.validationChange.emit(isValid);

    return isValid;
  }

  /**
   * Alterna el estado de omisión del puntaje sentinel
   */
  toggleOmitirPuntajeSentinel(): void {
    // Invertir el estado actual
    const omitido = !this.puntajeForm.get('omitido')?.value;
    this.puntajeForm.get('omitido')?.setValue(omitido);

    if (omitido) {
      // Resetear el valor del input de puntaje
      this.puntajeForm.get('puntaje')?.setValue('');
      this.puntajeSentinel = 0;
      this.columnaSeleccionada = -1;

      // Deshabilitar el control de puntaje
      this.puntajeForm.get('puntaje')?.disable();

      // Mostrar mensaje
      this.messageToastService.infoMessageToast(
        'Información',
        'Se ha omitido el puntaje sentinel'
      );
    } else {
      // Habilitar el control de puntaje
      this.puntajeForm.get('puntaje')?.enable();

      // Resetear el estado de validación del campo
      this.puntajeForm.get('puntaje')?.setValue('');
      this.puntajeForm.get('puntaje')?.markAsUntouched();
      this.puntajeForm.get('puntaje')?.markAsPristine();
      this.puntajeSentinel = 0;
      this.columnaSeleccionada = -1;
    }

    // Emitir cambios
    this.emitChanges();
  }

  actualizarColumnaSeleccionada() {
    const puntaje = this.puntajeSentinel;

    if (puntaje >= 1 && puntaje <= 146) this.columnaSeleccionada = 0;
    else if (puntaje >= 147 && puntaje <= 476) this.columnaSeleccionada = 1;
    else if (puntaje >= 477 && puntaje <= 597) this.columnaSeleccionada = 2;
    else if (puntaje >= 598 && puntaje <= 721) this.columnaSeleccionada = 3;
    else if (puntaje >= 722 && puntaje <= 999) this.columnaSeleccionada = 4;
    else this.columnaSeleccionada = -1;
  }

  getFormValues() {
    return this.puntajeForm.get('puntaje')?.value;
  }
  getColorClass(index: number): string {
    return this.columnaSeleccionada === index ? this.rangos[index].colorClass : '';
  }

  getInputColorClass(): string {
    if (this.columnaSeleccionada === -1) return '';
    return this.rangos[this.columnaSeleccionada].colorClass;
  }

  validatePuntajeInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^0-9]/g, '');

    value = value.replace(/^0+/, '');

    if (value) {
      const numValue = parseInt(value, 10);
      if (numValue < 1) {
        value = '1';
      } else if (numValue > 999) {
        value = '999';
      } else {
        value = numValue.toString();
      }
    }

    input.value = value;
    this.puntajeForm.get('puntaje')?.setValue(value ? parseInt(value, 10) : null);
  }
}