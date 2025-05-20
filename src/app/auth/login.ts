import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../layout/component/app.floatingconfigurator';
import { AuthService } from './auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, ToastModule, CheckboxModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, RippleModule, AppFloatingConfigurator, DividerModule],
    styleUrls: ['./login.scss'],
    template: `
        <p-toast />
<app-floating-configurator />

<div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden p-4">
  <div class="w-full max-w-md">
    <div class="card-gradient rounded-3xl p-1.5">
      <div class="bg-surface-0 dark:bg-surface-900 rounded-[20px] py-8 px-6 sm:px-12 w-full">
        <div class="flex flex-col items-center justify-center text-center mb-6">
          <img src="logo.png" alt="Logo de la aplicación" class="w-20 h-20 mb-4" role="img">
          <h1 class="text-surface-900 dark:text-surface-0 text-2xl font-bold mb-2">Bienvenido a Grupo Progresando</h1>
          <p class="text-muted-color text-sm">Inicie sesión para continuar</p>
        </div>

        <p-divider class="my-4"></p-divider>

        <form [formGroup]="authForm" class="mt-4" (ngSubmit)="submit()">
          <div class="field mb-5">
            <label for="email" class="block text-surface-900 dark:text-surface-0 text-sm font-medium mb-2">DNI</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-user"></i>
              <input pInputText id="email" type="text" placeholder="Ingrese su DNI"
                     class="w-full" formControlName="email" autocomplete="username"
                     aria-label="Ingrese su DNI" aria-required="true">
            </span>
            @if(email.invalid && email.touched) {
                <small class="p-error block mt-1">El DNI es requerido</small>
            }
          </div>

          <div class="field mb-5">
            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-sm mb-2">Contraseña</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock"></i>
              <p-password id="password" formControlName="password" placeholder="Ingrese su contraseña"
                          [toggleMask]="true" styleClass="w-full" [feedback]="false"
                          autocomplete="current-password" aria-label="Ingrese su contraseña">
              </p-password>
            </span>
            @if(password.invalid && password.touched) {
                <small class="p-error block mt-1">La contraseña es requerida</small>
            }
          </div>

          <div class="flex justify-end mb-4">
            <a routerLink="/recuperar-contrasena" class="text-primary-500 hover:text-primary-600 text-sm cursor-pointer no-underline">
              ¿Olvidó su contraseña?
            </a>
          </div>

          <p-button type="submit" label="Iniciar Sesión" styleClass="w-full"
                   [loading]="loading" [disabled]="loading || authForm.invalid">
          </p-button>
        </form>
      </div>
    </div>
  </div>
</div>
    `,
    providers: [MessageService]
})
export class Login {

    checked: boolean = false;
    authForm!: FormGroup;
    loading: boolean = false;

    constructor(
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService
    ) {
        this.initForm();

        // Mostrar mensaje de bienvenida a la versión demo
        setTimeout(() => {
            this.messageService.add({
                severity: 'info',
                summary: 'Versión Demo',
                detail: 'Usa DNI: 12345678, Contraseña: password para iniciar sesión',
                life: 10000
            });
        }, 1000);
    }


    initForm() {
        this.authForm = this.fb.group({
            email: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }


    submit() {
        if (this.authForm.invalid) {
            return;
        }

        this.loading = true;

        const credentials = {
            email: this.email.value,
            password: this.password.value
        }

        // Mostrar información de depuración en la consola
        console.log('Intentando iniciar sesión con:', credentials);

        this.authService.login(credentials).subscribe({
            next: (response) => {
              console.log('Login exitoso:', response);
              this.router.navigateByUrl('/solicitudes');
              this.loading = false;
            },
            error: (error) => {
                console.error('Error en login:', error);
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Bad credentials', detail: 'Credenciales incorrectas' });
            }
        })
    }

    get email() {
        return this.authForm.controls['email'];
    }

    get password() {
        return this.authForm.controls['password'];
    }
}
