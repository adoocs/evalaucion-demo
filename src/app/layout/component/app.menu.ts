import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { PanelMenu } from 'primeng/panelmenu';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>
    `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Solicitudes',
                items: [
                    { label: 'Nueva Solicitud', icon: 'pi pi-file-edit', routerLink: ['/solicitudes'] },
                ]
            },
            {
                label: 'Administrar Tablas',
                items: [
                    { label: 'Tipo de Vivienda', icon: 'pi pi-building', routerLink: ['/tipo-viviendas'] },
                    { label: 'Tasa', icon: 'pi pi-wave-pulse', routerLink: ['/tasas'] },
                    { label: 'Tiempo', icon: 'pi pi-stopwatch', routerLink: ['/tiempos'] },
                    { label: 'Periodo', icon: 'pi pi-calendar', routerLink: ['/periodos'] },
                    {
                        label: 'Economía',
                        icon: 'pi pi-shop',
                        items: [
                            { label: 'Actividad Económica', icon: 'pi pi-tag', routerLink: ['/actividades-economicas'] },
                            { label: 'Sector Económico', icon: 'pi pi-briefcase', routerLink: ['/sectores-economicos'] }
                        ]
                    }
                ]
            },
            
        ];
    }
}
