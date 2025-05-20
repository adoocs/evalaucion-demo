import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {
  private tokenKey = 'token';
  private users = [
    { email: '12345678', password: 'password', name: 'Usuario Demo' },
    { email: '87654321', password: 'password', name: 'María Gómez' },
    { email: '23456789', password: 'password', name: 'Roberto Martínez' },
    { email: 'admin', password: 'admin', name: 'Administrador' }
  ];

  constructor(private router: Router) { }

  login(credentials: any): Observable<any> {
    console.log('LocalAuthService: Intento de login con', credentials);

    // Verificar si las credenciales coinciden con algún usuario
    const user = this.users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      console.log('LocalAuthService: Usuario encontrado', user);
      // Generar un token falso
      const token = this.generateFakeToken(user);
      this.setToken(token);

      const response = {
        access_token: token,
        user: {
          name: user.name,
          email: user.email
        }
      };

      console.log('LocalAuthService: Respuesta de login', response);
      return of(response).pipe(delay(800)); // Simular retraso de red
    }

    console.error('LocalAuthService: Credenciales incorrectas');
    // Si las credenciales no coinciden, devolver un error
    return throwError(() => new Error('Credenciales incorrectas')).pipe(delay(800));
  }

  private generateFakeToken(user: any): string {
    // Crear un payload simple
    const payload = {
      sub: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
    };

    // Codificar el payload en base64
    const encodedPayload = btoa(JSON.stringify(payload));

    // Crear un token simple (header.payload.signature)
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.fake-signature`;
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
    // Simulamos el cambio de contraseña
    return of({ message: 'Contraseña cambiada con éxito' }).pipe(delay(800));
  }

  getProfile(): Observable<any> {
    // Devolvemos un perfil de usuario falso
    return of({
      name: 'Usuario Demo',
      email: '12345678',
      role: 'admin'
    }).pipe(delay(500));
  }
}
