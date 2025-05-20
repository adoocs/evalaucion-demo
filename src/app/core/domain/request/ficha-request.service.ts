import { Injectable } from '@angular/core';
import { FichaTrabajo } from '../ficha-trabajo.model';

@Injectable({
  providedIn: 'root'
})
export class FichaRequestService {

  fichaTrabajo: FichaTrabajo | null = null;
  constructor() { }
}
