import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FichaTrabajo } from '../domain/ficha-trabajo.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FichaService {

  private endpoint = `${environment.apiUrl}ficha-trabajos`;

  constructor(
    private http: HttpClient,
  ) { }

  obtenerFichaTrabajo(): Observable<FichaTrabajo> {
    return this.http.get<FichaTrabajo>(`${this.endpoint}/ficha-trabajo`);
  }

  createFichaTrabajo(fichaTrabajo: FichaTrabajo): Observable<any> {
    return this.http.post<any>(`${this.endpoint}`, fichaTrabajo);
  }
}
