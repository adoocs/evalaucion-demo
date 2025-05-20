import { signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Servicio base para simular operaciones CRUD con datos locales
 * Reemplaza a CachedDataService para la versión demo
 */
export abstract class LocalDataService<T extends { id: number }> {
  protected loadingState = signal(false);
  protected errorState = signal<any>(null);
  protected dataSignal = signal<T[]>([]);
  
  // Método abstracto que debe ser implementado por las clases hijas
  protected abstract getInitialData(): T[];
  
  // Método para obtener un ID único para nuevos elementos
  protected getNextId(): number {
    const items = this.dataSignal();
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  }

  constructor() {
    // Inicializar con datos de ejemplo
    this.dataSignal.set(this.getInitialData());
  }

  get isLoading() { return this.loadingState.asReadonly(); }
  get error() { return this.errorState.asReadonly(); }
  get data() { return this.dataSignal.asReadonly(); }

  loadInitialData(): void {
    // No es necesario hacer nada, los datos ya están cargados
    // Pero mantenemos el método para compatibilidad con la interfaz original
  }

  fetchAll(): void {
    // Simulamos una carga con un pequeño retraso
    this.loadingState.set(true);
    
    setTimeout(() => {
      this.loadingState.set(false);
    }, 500);
  }

  getById(id: number): Observable<T> {
    const item = this.dataSignal().find(item => item.id === id);
    
    if (item) {
      return of(item).pipe(delay(300)); // Simulamos un pequeño retraso
    }
    
    return throwError(() => new Error(`Item with id ${id} not found`));
  }

  create(item: Partial<T>): Observable<T> {
    // Simulamos la creación de un nuevo elemento
    this.loadingState.set(true);
    
    const newItem = {
      ...item,
      id: this.getNextId()
    } as T;
    
    setTimeout(() => {
      this.dataSignal.update(items => [...items, newItem]);
      this.loadingState.set(false);
    }, 500);
    
    return of(newItem).pipe(delay(500));
  }

  update(id: number, item: Partial<T>): Observable<T> {
    // Simulamos la actualización de un elemento
    this.loadingState.set(true);
    
    const existingItem = this.dataSignal().find(i => i.id === id);
    
    if (!existingItem) {
      this.loadingState.set(false);
      return throwError(() => new Error(`Item with id ${id} not found`));
    }
    
    const updatedItem = { ...existingItem, ...item } as T;
    
    setTimeout(() => {
      this.dataSignal.update(items => 
        items.map(i => i.id === id ? updatedItem : i)
      );
      this.loadingState.set(false);
    }, 500);
    
    return of(updatedItem).pipe(delay(500));
  }

  delete(id: number): Observable<void> {
    // Simulamos la eliminación de un elemento
    this.loadingState.set(true);
    
    const existingItem = this.dataSignal().find(i => i.id === id);
    
    if (!existingItem) {
      this.loadingState.set(false);
      return throwError(() => new Error(`Item with id ${id} not found`));
    }
    
    setTimeout(() => {
      this.dataSignal.update(items => items.filter(i => i.id !== id));
      this.loadingState.set(false);
    }, 500);
    
    return of(undefined).pipe(delay(500));
  }
}
