import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalValidationService {

  constructor() { }

  /**
   * Valida si un DNI ya existe en el sistema
   * @param dni DNI a validar
   * @returns Observable con true si el DNI existe, false en caso contrario
   */
  validateDni(dni: string): Observable<boolean> {
    // Simulamos que los DNI que comienzan con 1 ya existen
    const exists = dni.startsWith('1');
    return of(exists).pipe(delay(500));
  }

  /**
   * Valida si un cliente ya tiene una solicitud activa
   * @param clienteId ID del cliente
   * @returns Observable con true si el cliente tiene una solicitud activa, false en caso contrario
   */
  validateClienteHasSolicitud(clienteId: number): Observable<boolean> {
    // Simulamos que los clientes con ID par ya tienen una solicitud activa
    const hasSolicitud = clienteId % 2 === 0;
    return of(hasSolicitud).pipe(delay(500));
  }

  /**
   * Valida si un cliente tiene un puntaje Sentinel adecuado
   * @param clienteId ID del cliente
   * @returns Observable con el puntaje Sentinel del cliente
   */
  validateSentinel(clienteId: number): Observable<number> {
    // Simulamos un puntaje Sentinel aleatorio entre 300 y 850
    const puntaje = Math.floor(Math.random() * (850 - 300 + 1)) + 300;
    return of(puntaje).pipe(delay(800));
  }
}
