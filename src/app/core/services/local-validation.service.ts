import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Cliente } from '../domain/cliente.model';
import { TipoVivienda } from '../domain/tipo-vivienda.model';
import { Solicitud } from '../domain/solicitud.model';

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

  /**
   * Verifica si un cliente requiere aval basado en reglas de negocio
   * @param cliente El cliente a validar
   * @param tiposVivienda Lista de tipos de vivienda para identificar "alquilada"
   * @param solicitud Opcional: Solicitud para validar el monto
   * @returns Un objeto con el resultado de la validación y el motivo
   */
  requiresAval(cliente: Cliente, tiposVivienda: TipoVivienda[], solicitud?: Solicitud): { required: boolean, reason: string } {
    if (!cliente) {
      return { required: false, reason: '' };
    }

    // Crear un array para almacenar las razones
    const reasons: string[] = [];
    let isRequired = false;

    // Verificar si el cliente tiene casa propia
    const tipoViviendaPropia = tiposVivienda.find(tv =>
      tv.descripcion.toLowerCase().includes('propia')
    );

    const tieneViviendaPropia = tipoViviendaPropia &&
      cliente.tipo_vivienda &&
      cliente.tipo_vivienda.id === tipoViviendaPropia.id;

    // Si NO tiene vivienda propia, requiere AVAL
    if (cliente.tipo_vivienda && !tieneViviendaPropia) {
      isRequired = true;
      reasons.push('El cliente no tiene casa propia, por lo que requiere AVAL.');
    }

    // Verificar si el cliente tiene menos de 24 años
    if (cliente.edad && cliente.edad < 24) {
      isRequired = true;
      reasons.push('El cliente es menor de 24 años, por lo que requiere AVAL independientemente del tipo de vivienda.');
    }

    // Verificar si el cliente tiene más de 64 años
    if (cliente.edad && cliente.edad > 64) {
      isRequired = true;
      reasons.push('El cliente es mayor de 64 años, por lo que requiere AVAL independientemente del tipo de vivienda.');
    }

    // Si hay múltiples razones, devolver la primera razón
    // Esto es para que cada razón se muestre por separado en el toast
    if (reasons.length > 0) {
      return {
        required: isRequired,
        reason: reasons[0]
      };
    }

    // Verificar si el monto de la solicitud es mayor a 1500
    // Nota: Ahora esto es solo una recomendación, no un requisito obligatorio
    if (solicitud && solicitud.monto > 1500) {
      return {
        required: false, // Cambiado a false para que no sea obligatorio
        reason: 'El monto de la solicitud es mayor a 1500, se recomienda incluir AVAL.'
      };
    }

    return { required: false, reason: '' };
  }

  /**
   * Verifica si un cliente requiere firma del cónyuge basado en reglas de negocio
   * @param cliente El cliente a validar
   * @returns Un objeto con el resultado de la validación y el motivo
   */
  requiresConyuge(cliente: Cliente): { required: boolean, reason: string } {
    if (!cliente) {
      return { required: false, reason: '' };
    }

    // Crear un array para almacenar las razones
    const reasons: string[] = [];
    let isRequired = false;

    // Verificar si el cliente es casado o conviviente
    const estadoCivil = cliente.estado_civil?.toLowerCase() || '';

    // Mejorar la detección de estado civil
    const esCasado = estadoCivil === 'casado' || estadoCivil.includes('casad');
    const esConviviente = estadoCivil === 'conviviente' || estadoCivil.includes('conviviente') || estadoCivil.includes('concubin');
    const esCasadoOConviviente = esCasado || esConviviente;

    if (esCasadoOConviviente) {
      isRequired = true;
      const estadoCivilMostrar = esCasado ? 'casado(a)' : 'conviviente';
      reasons.push(`El cliente es ${estadoCivilMostrar}, por lo que requiere firma del cónyuge.`);
    }

    // Verificar si el cliente tiene más de 64 años
    if (cliente.edad && cliente.edad > 64) {
      isRequired = true;
      reasons.push('El cliente es mayor de 64 años, por lo que requiere firma del cónyuge.');
    }

    // Si hay razones, devolver todas juntas
    if (reasons.length > 0) {
      return {
        required: isRequired,
        reason: reasons.join(' ')
      };
    }

    return { required: false, reason: '' };
  }
}
