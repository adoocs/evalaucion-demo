import { Injectable } from '@angular/core';
import { Cliente } from '../../core/domain/cliente.model';
import { Aval } from '../../core/domain/aval.model';
import { Conyuge } from '../../core/domain/conyuge.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadPersonService {

  private apiUrl = '/reniec-proxy/apps/?c=app&a=consultaReniec';

  constructor(private http: HttpClient) { }

  consultarDni(dni: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')


    const body = new HttpParams()
      .set('id', dni)

    return this.http.post(this.apiUrl, body.toString(), { headers });
  }

  mapToPersonBase(apiPerson: any): Person {
    return {
      id: 0,
      apellidos: `${apiPerson.paterno} ${apiPerson.materno}`.trim(),
      nombres: apiPerson.nombres || '',
      dni: apiPerson.dni || '',
      celular: undefined
    };
  }

  mapApiToCliente(apiResponse: any): Cliente {
    const persona = apiResponse.persona;
    const personBase = this.mapToPersonBase(persona);
    return {
      ...personBase,
      fecha_born: this.parseBornDate(persona.fechaNacimiento) || '',
      estado_civil: persona.estadoCivil.toLowerCase() || undefined,
      genero: persona.sexo === '1' ? 'M' : 'F',
      direccion: persona.direccion || undefined,
      n_referencial: undefined,
      ...(persona.fechaNacimiento && {
        edad: this.calcularEdad(persona.fechaNacimiento)
      })
    };
  }

  calcularEdad(fechaNacimiento: string): number {
    const birthDate = new Date(fechaNacimiento);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  parseBornDate(birthDate: string): string {
    const dateParts = birthDate.split('/');
    if (dateParts.length === 3) {
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
    return birthDate; 
  }

  mapApiToConyuge(apiResponse: any): Conyuge {
    return {
      ...this.mapToPersonBase(apiResponse.persona),
      actividad: undefined
    };
  }

  mapApiToAval(apiResponse: any): Aval {
    const personBase = this.mapToPersonBase(apiResponse.persona);

    return {
      ...personBase,
      direccion: apiResponse.persona.direccion || undefined,
      n_referencial: undefined,
      actividad: undefined,
      parentesco: undefined,
      tipo_vivienda: null
    };
  }
}

export interface Person {
  id: number;
  apellidos: string;
  nombres: string;
  dni: string;
  celular?: string;
}