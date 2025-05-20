import { signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, shareReplay } from 'rxjs';

export abstract class CachedDataService<T> {
  protected http = inject(HttpClient);
  protected loadingState = signal(false);
  protected errorState = signal<any>(null);
  protected dataSignal = signal<T[]>([]);
  protected fetchRequest: Observable<T[]> | null = null;

  protected abstract getEndpoint(): string;

  get isLoading() { return this.loadingState.asReadonly(); }
  get error() { return this.errorState.asReadonly(); }
  get data() { return this.dataSignal.asReadonly(); }

  loadInitialData(): void {
    if (this.dataSignal().length === 0 && !this.loadingState() && !this.fetchRequest) {
      this.fetchAll();
    }
  }

  fetchAll(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    if (!this.fetchRequest) {
      this.fetchRequest = this.http.get<T[]>(this.getEndpoint()).pipe(
        shareReplay(1),
        tap(data => {
          console.log('Data fetched:', this.constructor.name, data);
          this.dataSignal.set(data);
          this.loadingState.set(false);
          this.fetchRequest = null;
        }),
        catchError(err => {
          this.errorState.set(err);
          this.loadingState.set(false);
          this.fetchRequest = null;
          return [];
        })
      );
    }

    this.fetchRequest.subscribe();
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.getEndpoint()}/${id}`);
  }

  create(item: T): Observable<T> {
    return this.http.post<T>(this.getEndpoint(), item).pipe(
      tap(newItem => {
        this.dataSignal.update(items => [...items, newItem]);
      })
    );
  }

  update(id: number, item: T): Observable<T> {
    return this.http.put<T>(`${this.getEndpoint()}/${id}`, item).pipe(
      tap(updatedItem => {
        this.dataSignal.update(items => 
          items.map(i => (i as any).id === id ? updatedItem : i)
        );
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getEndpoint()}/${id}`).pipe(
      tap(() => {
        this.dataSignal.update(items => 
          items.filter(i => (i as any).id !== id)
        );
      })
    );
  }
}