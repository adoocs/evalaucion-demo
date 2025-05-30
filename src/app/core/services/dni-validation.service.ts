import { Injectable } from '@angular/core';
import { Cliente } from '../domain/cliente.model';
import { Aval } from '../domain/aval.model';
import { Conyuge } from '../domain/conyuge.model';

export interface DniValidationResult {
  isValid: boolean;
  message?: string;
  usedIn?: 'cliente' | 'aval' | 'conyuge';
}

@Injectable({
  providedIn: 'root'
})
export class DniValidationService {

  constructor() { }

  /**
   * Valida que un DNI no esté siendo usado en cliente, aval o cónyuge
   * @param dni El DNI a validar
   * @param cliente Los datos del cliente actual
   * @param aval Los datos del aval actual
   * @param conyuge Los datos del cónyuge actual
   * @param currentType El tipo actual donde se está ingresando el DNI
   * @returns Resultado de la validación
   */
  validateUniqueDni(
    dni: string,
    cliente: Cliente | null,
    aval: Aval | null,
    conyuge: Conyuge | null,
    currentType: 'cliente' | 'aval' | 'conyuge'
  ): DniValidationResult {

    if (!dni || dni.length !== 8) {
      return { isValid: true }; // No validamos DNI incompletos
    }

    console.log(`🔍 Validando DNI ${dni} para ${currentType}:`, {
      cliente: cliente?.dni,
      aval: aval?.dni,
      conyuge: conyuge?.dni
    });

    // Verificar en cliente (solo si no es el tipo actual)
    if (currentType !== 'cliente' && cliente?.dni === dni) {
      const message = `⚠️ DNI DUPLICADO: El DNI ${dni} ya está registrado como CLIENTE. Por favor, ingrese un DNI diferente.`;
      console.log(message);
      return {
        isValid: false,
        message,
        usedIn: 'cliente'
      };
    }

    // Verificar en aval (solo si no es el tipo actual)
    if (currentType !== 'aval' && aval?.dni === dni) {
      const message = `⚠️ DNI DUPLICADO: El DNI ${dni} ya está registrado como AVAL. Por favor, ingrese un DNI diferente.`;
      console.log(message);
      return {
        isValid: false,
        message,
        usedIn: 'aval'
      };
    }

    // Verificar en cónyuge (solo si no es el tipo actual)
    if (currentType !== 'conyuge' && conyuge?.dni === dni) {
      const message = `⚠️ DNI DUPLICADO: El DNI ${dni} ya está registrado como CÓNYUGE. Por favor, ingrese un DNI diferente.`;
      console.log(message);
      return {
        isValid: false,
        message,
        usedIn: 'conyuge'
      };
    }

    console.log(`✅ DNI ${dni} es único para ${currentType}`);
    return { isValid: true };
  }

  /**
   * Obtiene un mensaje de error personalizado según donde esté siendo usado el DNI
   * @param usedIn Donde está siendo usado el DNI
   * @param dni El DNI duplicado
   * @param nombres Los nombres de la persona que ya usa el DNI
   * @param apellidos Los apellidos de la persona que ya usa el DNI
   * @returns Mensaje de error personalizado
   */
  getErrorMessage(usedIn: 'cliente' | 'aval' | 'conyuge', dni: string): string {
    const tipoPersona = usedIn.toUpperCase();
    return `⚠️ DNI DUPLICADO: El DNI ${dni} ya está registrado como ${tipoPersona}. Por favor, ingrese un DNI diferente.`;
  }

  /**
   * Valida que un DNI tenga el formato correcto
   * @param dni El DNI a validar
   * @returns true si el formato es válido
   */
  isValidDniFormat(dni: string): boolean {
    if (!dni) return false;

    // Debe tener exactamente 8 dígitos
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
  }

  /**
   * Limpia y formatea un DNI
   * @param dni El DNI a limpiar
   * @returns DNI limpio y formateado
   */
  cleanDni(dni: string): string {
    if (!dni) return '';

    // Remover espacios y caracteres no numéricos
    return dni.replace(/\D/g, '');
  }
}
