import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Person } from './load-person.service';

@Injectable({
  providedIn: 'root'
})
export class LocalLoadPersonService {
  // Base de datos simulada de personas
  private personas = [
    {
      dni: '12345678',
      paterno: 'Pérez',
      materno: 'López',
      nombres: 'Juan Carlos',
      fechaNacimiento: '15/05/1985',
      sexo: 'M'
    },
    {
      dni: '87654321',
      paterno: 'Gómez',
      materno: 'Rodríguez',
      nombres: 'María Elena',
      fechaNacimiento: '20/10/1990',
      sexo: 'F'
    },
    {
      dni: '23456789',
      paterno: 'Martínez',
      materno: 'Sánchez',
      nombres: 'Roberto',
      fechaNacimiento: '05/03/1982',
      sexo: 'M'
    },
    {
      dni: '34567890',
      paterno: 'Torres',
      materno: 'Vega',
      nombres: 'Ana María',
      fechaNacimiento: '12/07/1988',
      sexo: 'F'
    }
  ];

  constructor() { }

  consultarDni(dni: string): Observable<any> {
    // Buscar la persona en nuestra base de datos simulada
    const persona = this.personas.find(p => p.dni === dni);
    
    if (persona) {
      return of({
        success: true,
        persona: persona
      }).pipe(delay(800)); // Simular retraso de red
    }
    
    // Si no se encuentra, devolver un error
    return throwError(() => new Error('No se encontró la persona con el DNI proporcionado')).pipe(delay(800));
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

  parseBornDate(birthDate: string): string {
    const dateParts = birthDate.split('/');
    if (dateParts.length === 3) {
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
    return birthDate; 
  }

  mapApiToConyuge(apiResponse: any): any {
    return {
      ...this.mapToPersonBase(apiResponse.persona),
      actividad: undefined
    };
  }

  mapApiToAval(apiResponse: any): any {
    const personBase = this.mapToPersonBase(apiResponse.persona);
    return {
      ...personBase,
      direccion: undefined,
      celular: undefined,
      n_referencial: undefined,
      actividad: undefined,
      parentesco: undefined,
      tipo_vivienda: null
    };
  }

  mapApiToCliente(apiResponse: any): any {
    const personBase = this.mapToPersonBase(apiResponse.persona);
    const fechaNacimiento = this.parseBornDate(apiResponse.persona.fechaNacimiento);
    
    return {
      ...personBase,
      fecha_born: fechaNacimiento,
      estado_civil: undefined,
      edad: this.calcularEdad(fechaNacimiento),
      genero: apiResponse.persona.sexo === 'M' ? 'M' : 'F',
      direccion: undefined,
      celular: undefined,
      n_referencial: undefined,
      grado_instruccion: undefined,
      email: undefined,
      tipo_vivienda: null
    };
  }

  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  }
}
