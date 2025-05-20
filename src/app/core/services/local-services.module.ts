import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  LocalTipoViviendaService,
  LocalTasaService,
  LocalAportanteService,
  LocalPeriodoService,
  LocalTiempoService,
  LocalSectorEconomicoService,
  LocalActividadEconomicaService,
  LocalDenominacionService,
  LocalClienteService,
  LocalAvalService,
  LocalConyugeService,
  LocalCreditoAnteriorService,
  LocalFamiliaMiembrosService,
  LocalGastoFinancieroService,
  LocalGastosOperativosService,
  LocalIngresoAdicionalService,
  LocalIngresoDependienteService,
  LocalNegocioService,
  LocalReferenciaFamiliarService,
  LocalRegistroVentasService,
  LocalSolicitudService
} from './local-data-container.service';

import { LocalAuthService } from '../../auth/local-auth.service';
import { LocalLoadPersonService } from '../../shared/utils/local-load-person.service';
import { LocalLoadingService } from '../../shared/utils/local-loading.service';
import { LocalMessageToastService } from '../../shared/utils/local-message-toast.service';
import { LocalValidationService } from './local-validation.service';
import { LocalFichaService } from './local-ficha.service';

import {
  TipoViviendaService,
  TasaService,
  AportanteService,
  PeriodoService,
  TiempoService,
  SectorEconomicoService,
  ActividadEconomicaService,
  DenominacionService,
  ClienteService,
  AvalService,
  ConyugeService,
  CreditoAnteriorService,
  FamiliaMiembrosService,
  GastoFinancieroService,
  GastosOperativosService,
  IngresoAdicionalService,
  IngresoDependienteService,
  NegocioService,
  ReferenciaFamiliarService,
  RegistroVentasService,
  SolicitudService
} from './data-container.service';

import { AuthService } from '../../auth/auth.service';
import { LoadPersonService } from '../../shared/utils/load-person.service';
import { LoadingService } from '../../shared/utils/loading.service';
import { MessageToastService } from '../../shared/utils/message-toast.service';
import { ValidationService } from './validation.service';
import { FichaService } from './ficha.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    // Proporcionar los servicios locales en lugar de los originales
    { provide: TipoViviendaService, useClass: LocalTipoViviendaService },
    { provide: TasaService, useClass: LocalTasaService },
    { provide: AportanteService, useClass: LocalAportanteService },
    { provide: PeriodoService, useClass: LocalPeriodoService },
    { provide: TiempoService, useClass: LocalTiempoService },
    { provide: SectorEconomicoService, useClass: LocalSectorEconomicoService },
    { provide: ActividadEconomicaService, useClass: LocalActividadEconomicaService },
    { provide: DenominacionService, useClass: LocalDenominacionService },
    { provide: ClienteService, useClass: LocalClienteService },
    { provide: AvalService, useClass: LocalAvalService },
    { provide: ConyugeService, useClass: LocalConyugeService },
    { provide: CreditoAnteriorService, useClass: LocalCreditoAnteriorService },
    { provide: FamiliaMiembrosService, useClass: LocalFamiliaMiembrosService },
    { provide: GastoFinancieroService, useClass: LocalGastoFinancieroService },
    { provide: GastosOperativosService, useClass: LocalGastosOperativosService },
    { provide: IngresoAdicionalService, useClass: LocalIngresoAdicionalService },
    { provide: IngresoDependienteService, useClass: LocalIngresoDependienteService },
    { provide: NegocioService, useClass: LocalNegocioService },
    { provide: ReferenciaFamiliarService, useClass: LocalReferenciaFamiliarService },
    { provide: RegistroVentasService, useClass: LocalRegistroVentasService },
    { provide: SolicitudService, useClass: LocalSolicitudService },

    // Proporcionar el servicio de autenticación local
    { provide: AuthService, useClass: LocalAuthService },

    // Proporcionar el servicio de consulta de DNI local
    { provide: LoadPersonService, useClass: LocalLoadPersonService },

    // Proporcionar el servicio de loading local
    { provide: LoadingService, useClass: LocalLoadingService },

    // Proporcionar el servicio de mensajes toast local
    { provide: MessageToastService, useClass: LocalMessageToastService },

    // Proporcionar el servicio de validación local
    { provide: ValidationService, useClass: LocalValidationService },

    // Proporcionar el servicio de ficha de trabajo local
    { provide: FichaService, useClass: LocalFichaService }
  ]
})
export class LocalServicesModule { }
