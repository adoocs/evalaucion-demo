import { Injectable } from '@angular/core';
import { FichaTrabajo } from '../domain/ficha-trabajo.model';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalFichaService {

  // Ficha de trabajo en memoria
  private fichaTrabajo: FichaTrabajo = {
    id: 1,
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

  constructor() { }

  obtenerFichaTrabajo(): Observable<FichaTrabajo> {
    return of(this.fichaTrabajo).pipe(delay(500));
  }

  createFichaTrabajo(fichaTrabajo: FichaTrabajo): Observable<any> {
    this.fichaTrabajo = { ...fichaTrabajo };
    return of({ success: true, message: 'Ficha de trabajo creada con éxito' }).pipe(delay(500));
  }
}
