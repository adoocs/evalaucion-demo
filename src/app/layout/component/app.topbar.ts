import { Component, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { ButtonModule } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { AuthService } from '../../auth/auth.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Popover, PopoverModule } from 'primeng/popover';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, ButtonModule, Menu, OverlayBadgeModule, PopoverModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
            <img src="logo.png" alt="Logo" class="w-10 h-10 mt-2 mb-2">
                <span>Progresando</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <p-button (click)="menu.toggle($event)" icon="pi pi-user"/>
                    <p-menu #menu [model]="items" [popup]="true" />
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];
    employees: any[] = [];
    count: number = 0;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
    ) {
        this.items = [
            {
                label: 'Opciones',

                items: [
                    {
                        label: 'Ver perfil',
                        icon: 'pi pi-user',
                        command: () => this.profile()
                    },
                    {
                        label: 'Cerrar sesión',
                        icon: 'pi pi-refresh',
                        command: () => this.logout()
                    },
                ]
            }
        ];

    }

    logout() {
        this.authService.logout();
    }

    profile() {
        this.router.navigateByUrl('/account');
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

}
