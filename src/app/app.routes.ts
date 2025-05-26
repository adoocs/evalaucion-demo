import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { TipoViviendaListComponent } from './core/interfaces/pages/tipo-vivienda/tipo-vivienda-list/tipo-vivienda-list.component';
import { PeriodoListComponent } from './core/interfaces/pages/periodo/periodo-list/periodo-list.component';
import { TiempoListComponent } from './core/interfaces/pages/tiempo/tiempo-list/tiempo-list.component';
import { TasaListComponent } from './core/interfaces/pages/tasa/tasa-list/tasa-list.component';
import { DenominacionListComponent } from './core/interfaces/pages/denomicacion/denominacion-list/denominacion-list.component';
import { SectorEconomicoListComponent } from './core/interfaces/pages/sector-economico/sector-economico-list/sector-economico-list.component';
import { ActividadEconomicaListComponent } from './core/interfaces/pages/actividad-economica/actividad-economica-list/actividad-economica-list.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { SolicitudContainerComponent } from './core/interfaces/pages/solicitud/solicitud-container/solicitud-container.component';
import { SolicitudCrearComponent } from './core/interfaces/pages/solicitud/solicitud-crear/solicitud-crear.component';
import { SolicitudEditarComponent } from './core/interfaces/pages/solicitud/solicitud-editar/solicitud-editar.component';
import { SolicitudVerComponent } from './core/interfaces/pages/solicitud/solicitud-ver/solicitud-ver.component';
import { UsuarioContainerComponent } from './core/interfaces/pages/usuario/usuario-container/usuario-container.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppLayout,
    // canActivate: [authGuard],
    children: [
      { path: 'tipo-viviendas', component: TipoViviendaListComponent },
      { path: 'actividades-economicas', component: ActividadEconomicaListComponent },
      { path: 'sectores-economicos', component: SectorEconomicoListComponent },
      { path: 'denominaciones', component: DenominacionListComponent },
      { path: 'tasas', component: TasaListComponent },
      { path: 'tiempos', component: TiempoListComponent },
      { path: 'periodos', component: PeriodoListComponent },
      { path: 'solicitudes', component: SolicitudContainerComponent },
      { path: 'solicitudes/crear', component: SolicitudCrearComponent },
      { path: 'solicitudes/editar/:id', component: SolicitudEditarComponent },
      { path: 'solicitudes/ver/:id', component: SolicitudVerComponent },
      { path: 'usuarios', component: UsuarioContainerComponent },
      { path: 'account', loadChildren: () => import('./auth/account/account.routes') } ,
    ]
  },
  {
    path: 'notfound', component: NotFoundComponent
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.routes') },
  { path: '**', redirectTo: '/notfound' }
];
