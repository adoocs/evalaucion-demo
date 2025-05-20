import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private endpoint = `${environment.apiUrl}auth/login`;
  private tokenKey = 'token';
  constructor(private http: HttpClient, private router: Router,) { }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(this.endpoint, credentials).pipe(
      tap(response => {
        if (response.access_token) {
          this.setToken(response.access_token);
        }
      }),
    );
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      this.router.navigateByUrl('/auth/login');
    }
  }

  changePassword(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}password`, payload);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}profile`);
  }

}
