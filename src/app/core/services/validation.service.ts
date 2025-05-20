import { Injectable } from '@angular/core';
import { Cliente } from '../domain/cliente.model';
import { TipoVivienda } from '../domain/tipo-vivienda.model';
import { Solicitud } from '../domain/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

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
