import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from './auth.service';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FloatLabel } from 'primeng/floatlabel';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        CardModule,
        DividerModule,
        ToastModule,
        ReactiveFormsModule,
        FloatLabel,
        PanelModule
    ],
    template: `
        <p-toast/>
        <div class="flex flex-col gap-4">
        
        <!-- Panel de Perfil -->
        <p-panel header="Perfil de Usuario">
            <div class="card flex flex-col gap-4">
                <form class="flex flex-wrap gap-6">
                    <div class="flex flex-col grow basis-0 gap-2">
                        <p-floatlabel variant="on">
                            <input pInputText id="name" [(ngModel)]="user.name" name="name" readonly/>
                            <label for="name">DNI</label>
                        </p-floatlabel>
                    </div>
                    <div class="flex flex-col grow basis-0 gap-2">
                        <p-floatlabel variant="on">
                            <input pInputText id="email" [(ngModel)]="user.email" name="email" readonly/>
                            <label for="email">Email</label>
                        </p-floatlabel>
                    </div>
                    <div class="flex flex-col grow basis-0 gap-2">
                        <p-floatlabel variant="on">
                            <input pInputText id="role" [(ngModel)]="user.role" name="role" readonly/>
                            <label for="role">Rol</label>
                        </p-floatlabel>
                    </div>
                </form>
            </div>
        </p-panel>

        <!-- Panel de Cambio de Contraseña -->
        <p-panel header="Cambiar Contraseña">
    <div class="card flex flex-col gap-4">
        <form [formGroup]="passwordForm" class="flex flex-wrap gap-6">
            <div class="flex flex-col grow basis-0 gap-2">
                <p-floatlabel variant="on">
                    <p-password id="currentPassword" formControlName="currentPassword"
                        [toggleMask]="true" [feedback]="false" />
                    <label for="currentPassword">Contraseña Actual</label>
                    <small class="text-red-500" 
                        *ngIf="passwordForm.controls['currentPassword'].invalid && (passwordForm.controls['currentPassword'].dirty || passwordForm.controls['currentPassword'].touched)">
                        Campo requerido.
                    </small>
                </p-floatlabel>
            </div>
            <div class="flex flex-col grow basis-0 gap-2">
                <p-floatlabel variant="on">
                    <p-password id="newPassword" formControlName="newPassword"
                        [toggleMask]="true" [feedback]="false" />
                    <label for="newPassword">Nueva Contraseña</label>
                    <small class="text-red-500" 
                        *ngIf="passwordForm.controls['newPassword'].invalid && (passwordForm.controls['newPassword'].dirty || passwordForm.controls['newPassword'].touched)">
                        Mínimo 6 caracteres.
                    </small>
                </p-floatlabel>
            </div>
            <div class="flex flex-col grow basis-0 gap-2">
                <p-floatlabel variant="on">
                    <p-password id="confirmPassword" formControlName="confirmPassword"
                        [toggleMask]="true" [feedback]="false" />
                    <label for="confirmPassword">Confirmar Nueva Contraseña</label>
                    <small class="text-red-500" 
                        *ngIf="passwordForm.controls['confirmPassword'].invalid && (passwordForm.controls['confirmPassword'].dirty || passwordForm.controls['confirmPassword'].touched)">
                        Campo requerido.
                    </small>
                    <small class="text-red-500"
                        *ngIf="passwordForm.getError('mismatch') && (passwordForm.controls['confirmPassword'].dirty || passwordForm.controls['confirmPassword'].touched)">
                        Las contraseñas no coinciden.
                    </small>
                </p-floatlabel>
            </div>
        </form>
    </div>

    <ng-template #footer>
        <p-button label="Guardar" icon="pi pi-check" [disabled]="passwordForm.invalid" (click)="changePassword()"/>
    </ng-template>
</p-panel>


    </div>
    `,
    providers: [MessageService]
})
export class Profile implements OnInit {

    user = { name: '', email: '', role: '' };
    passwordForm!: FormGroup;

    constructor(
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadUserProfile();
        this.initPasswordForm();
    }

    loadUserProfile() {
        this.authService.getProfile().subscribe(userData => {
            this.user = userData;
        });
    }

    initPasswordForm() {
        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validator: this.passwordsMatch });
    }

    passwordsMatch(group: FormGroup) {
        return group.get('newPassword')?.value === group.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    changePassword() {
        if (this.passwordForm.invalid) return;

        const formValues = this.passwordForm.value;
        const payload = {
            current_password: formValues.currentPassword,
            new_password: formValues.newPassword,
            new_password_confirmation: formValues.confirmPassword
        };

        this.authService.changePassword(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada' });
                this.passwordForm.reset();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
            }
        });
    }
}
