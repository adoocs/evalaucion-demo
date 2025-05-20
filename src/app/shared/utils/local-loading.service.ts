import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalLoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.loadingSubject.next(true);
    
    // Simulamos un tiempo de carga mínimo para que se vea el spinner
    setTimeout(() => {
      this.hide();
    }, 500);
  }

  hide(): void {
    this.loadingSubject.next(false);
  }
}
