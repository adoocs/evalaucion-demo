import { Injectable } from '@angular/core';
import { FichaTrabajo } from '../domain/ficha-trabajo.model';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  CLIENTES,
  AVALES,
  CONYUGES,
  CREDITOS_ANTERIORES,
  GASTOS_FINANCIEROS,
  INGRESOS_ADICIONALES,
  REFERENCIAS_FAMILIARES,
  NEGOCIOS,
  INGRESOS_DEPENDIENTES
} from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class LocalFichaService {

  // Almacén de fichas de trabajo en memoria (simulando una base de datos)
  private fichasTrabajo: Map<string, FichaTrabajo> = new Map();

  constructor() {
    // Inicializar con datos de ejemplo
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Crear fichas de trabajo de ejemplo para algunos clientes
    const fichaEjemplo1: FichaTrabajo = {
      id: 1,
      cliente: CLIENTES[0], // Juan Carlos Pérez López
      aval: AVALES[0],
      conyuge: CONYUGES[0],
      referencia_familiar: REFERENCIAS_FAMILIARES[0],
      credito_anterior: CREDITOS_ANTERIORES[0],
      gasto_financieros: [GASTOS_FINANCIEROS[0]],
      ingreso_adicional: INGRESOS_ADICIONALES[0],
      puntaje_sentinel: 750,
      detalleEconomico: {
        negocio: NEGOCIOS[0],
        ingreso_dependiente: INGRESOS_DEPENDIENTES[0]
      }
    };

    const fichaEjemplo2: FichaTrabajo = {
      id: 2,
      cliente: CLIENTES[1], // María Elena Gómez Rodríguez
      aval: {
        id: 0,
        apellidos: '',
        nombres: '',
        dni: '',
        direccion: '',
        celular: '',
        n_referencial: undefined,
        actividad: '',
        parentesco: '',
        tipo_vivienda: { id: 0, descripcion: '' },
        omitido: true,
        motivo: 'Cliente mayor de 24 años y con casa propia'
      },
      conyuge: {
        id: 0,
        apellidos: '',
        nombres: '',
        dni: '',
        celular: '',
        actividad: '',
        omitido: true,
        motivo: 'Cliente soltero'
      },
      referencia_familiar: REFERENCIAS_FAMILIARES[1],
      credito_anterior: null,
      gasto_financieros: null,
      ingreso_adicional: null,
      puntaje_sentinel: 820,
      detalleEconomico: {
        negocio: NEGOCIOS[1],
        ingreso_dependiente: null
      }
    };

    // Almacenar por DNI del cliente
    if (fichaEjemplo1.cliente) {
      this.fichasTrabajo.set(fichaEjemplo1.cliente.dni, fichaEjemplo1);
    }
    if (fichaEjemplo2.cliente) {
      this.fichasTrabajo.set(fichaEjemplo2.cliente.dni, fichaEjemplo2);
    }
  }

  obtenerFichaTrabajo(): Observable<FichaTrabajo> {
    const fichaVacia: FichaTrabajo = {
      id: -1,
      cliente: null,
      aval: null,
      conyuge: null,
      referencia_familiar: null,
      credito_anterior: null,
      gasto_financieros: null,
      ingreso_adicional: null,
      puntaje_sentinel: null,
      detalleEconomico: null
    };
    return of(fichaVacia).pipe(delay(500));
  }

  /**
   * Obtiene una ficha de trabajo por DNI del cliente
   * @param dni DNI del cliente
   * @returns Observable con la ficha de trabajo o error si no existe
   */
  obtenerFichaPorDni(dni: string): Observable<FichaTrabajo> {
    console.log('Buscando ficha para DNI:', dni);
    console.log('Fichas disponibles:', Array.from(this.fichasTrabajo.keys()));

    const ficha = this.fichasTrabajo.get(dni);

    if (ficha) {
      console.log('Ficha encontrada:', ficha);
      return of({ ...ficha }).pipe(delay(800)); // Simular retraso de red
    }

    console.log('Ficha no encontrada para DNI:', dni);
    return throwError(() => new Error(`No se encontró ficha de trabajo para el DNI: ${dni}`)).pipe(delay(800));
  }

  /**
   * Obtiene una ficha de trabajo por nombre completo del cliente
   * @param nombreCompleto Nombre completo del cliente
   * @returns Observable con la ficha de trabajo o error si no existe
   */
  obtenerFichaPorNombre(nombreCompleto: string): Observable<FichaTrabajo> {
    console.log('Buscando ficha para nombre:', nombreCompleto);

    // Buscar en todas las fichas por nombre del cliente
    for (const [, ficha] of this.fichasTrabajo.entries()) {
      if (ficha.cliente) {
        const nombreFicha = `${ficha.cliente.nombres} ${ficha.cliente.apellidos}`.trim();
        const nombreFichaInverso = `${ficha.cliente.apellidos} ${ficha.cliente.nombres}`.trim();

        console.log(`Comparando "${nombreCompleto}" con "${nombreFicha}" y "${nombreFichaInverso}"`);

        if (nombreCompleto === nombreFicha || nombreCompleto === nombreFichaInverso) {
          console.log('Ficha encontrada por nombre:', ficha);
          return of({ ...ficha }).pipe(delay(800));
        }
      }
    }

    console.log('Ficha no encontrada para nombre:', nombreCompleto);
    return throwError(() => new Error(`No se encontró ficha de trabajo para el cliente: ${nombreCompleto}`)).pipe(delay(800));
  }

  createFichaTrabajo(fichaTrabajo: FichaTrabajo): Observable<any> {
    if (fichaTrabajo.cliente?.dni) {
      // Asignar un ID si no tiene
      if (fichaTrabajo.id === -1) {
        fichaTrabajo.id = this.getNextId();
      }

      this.fichasTrabajo.set(fichaTrabajo.cliente.dni, { ...fichaTrabajo });
      return of({ success: true, message: 'Ficha de trabajo creada con éxito' }).pipe(delay(500));
    }

    return throwError(() => new Error('No se puede crear la ficha sin DNI del cliente')).pipe(delay(500));
  }

  /**
   * Actualiza una ficha de trabajo existente
   * @param fichaTrabajo Ficha de trabajo a actualizar
   * @returns Observable con el resultado de la operación
   */
  updateFichaTrabajo(fichaTrabajo: FichaTrabajo): Observable<any> {
    if (fichaTrabajo.cliente?.dni) {
      const fichaExistente = this.fichasTrabajo.get(fichaTrabajo.cliente.dni);

      if (fichaExistente) {
        this.fichasTrabajo.set(fichaTrabajo.cliente.dni, { ...fichaTrabajo });
        return of({ success: true, message: 'Ficha de trabajo actualizada con éxito' }).pipe(delay(500));
      }

      return throwError(() => new Error('No se encontró la ficha de trabajo para actualizar')).pipe(delay(500));
    }

    return throwError(() => new Error('No se puede actualizar la ficha sin DNI del cliente')).pipe(delay(500));
  }

  private getNextId(): number {
    const ids = Array.from(this.fichasTrabajo.values()).map(f => f.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
}
