import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DniValidationService } from '../services/dni-validation.service';
import { Cliente } from '../domain/cliente.model';
import { Aval } from '../domain/aval.model';
import { Conyuge } from '../domain/conyuge.model';

/**
 * Validador personalizado para DNI único
 * @param dniService Servicio de validación de DNI
 * @param getCurrentData Función que retorna los datos actuales de cliente, aval y cónyuge
 * @param currentType Tipo actual donde se está validando el DNI
 * @returns ValidatorFn
 */
export function dniUniqueValidator(
  dniService: DniValidationService,
  getCurrentData: () => { cliente: Cliente | null, aval: Aval | null, conyuge: Conyuge | null },
  currentType: 'cliente' | 'aval' | 'conyuge'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dni = control.value;
    
    if (!dni || dni.length !== 8) {
      return null; // No validar DNI incompletos
    }

    const data = getCurrentData();
    const validation = dniService.validateUniqueDni(
      dni,
      data.cliente,
      data.aval,
      data.conyuge,
      currentType
    );

    if (!validation.isValid) {
      return {
        dniDuplicated: {
          message: validation.message,
          usedIn: validation.usedIn
        }
      };
    }

    return null;
  };
}

/**
 * Validador para formato de DNI
 * @param control Control del formulario
 * @returns ValidationErrors | null
 */
export function dniFormatValidator(control: AbstractControl): ValidationErrors | null {
  const dni = control.value;
  
  if (!dni) {
    return null; // No validar campos vacíos (usar required para eso)
  }

  // Debe tener exactamente 8 dígitos
  const dniRegex = /^\d{8}$/;
  
  if (!dniRegex.test(dni)) {
    return {
      dniFormat: {
        message: 'El DNI debe tener exactamente 8 dígitos numéricos'
      }
    };
  }

  return null;
}
