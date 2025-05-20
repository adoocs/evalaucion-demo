import { Injectable } from '@angular/core';
import { CachedDataService } from './cache-data.service';
import { environment } from '../../../environments/environment';
import { Aportante } from '../domain/aportante.model';
import { Tasa } from '../domain/tasa.model';
import { TipoVivienda } from '../domain/tipo-vivienda.model';
import { ActividadEconomica } from '../domain/actividad-economica.model';
import { Denominacion } from '../domain/denominacion.model';
import { Periodo } from '../domain/periodo.model';
import { SectorEconomico } from '../domain/sector-economico.model';
import { Tiempo } from '../domain/tiempo.model';
import { Aval } from '../domain/aval.model';
import { Cliente } from '../domain/cliente.model';
import { Conyuge } from '../domain/conyuge.model';
import { CreditoAnterior } from '../domain/credito-anterior.model';
import { FamiliaMiembros } from '../domain/familia-miembros.model';
import { GastoFinanciero } from '../domain/gasto-financiero.model';
import { GastosOperativos } from '../domain/gastos-operativos.model';
import { IngresoAdicional } from '../domain/ingreso-adicional.model';
import { IngresoDependiente } from '../domain/ingreso-dependiente.model';
import { Negocio } from '../domain/negocio.model';
import { ReferenciaFamiliar } from '../domain/referencia-familiar.model';
import { RegistroVentas } from '../domain/registro-ventas.model';
import { Solicitud } from '../domain/solicitud.model';

@Injectable({ providedIn: 'root' })
export class TipoViviendaService extends CachedDataService<TipoVivienda> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}tipo-viviendas`;
  }
}

@Injectable({ providedIn: 'root' })
export class TasaService extends CachedDataService<Tasa> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}tasas`;
  }
}

@Injectable({ providedIn: 'root' })
export class AportanteService extends CachedDataService<Aportante> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}aportantes`;
  }
}

@Injectable({ providedIn: 'root' })
export class PeriodoService extends CachedDataService<Periodo> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}periodos`;
  }
}

@Injectable({ providedIn: 'root' })
export class TiempoService extends CachedDataService<Tiempo> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}tiempos`;
  }
}

@Injectable({ providedIn: 'root' })
export class SectorEconomicoService extends CachedDataService<SectorEconomico> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}sector-economicos`;
  }
}

@Injectable({ providedIn: 'root' })
export class ActividadEconomicaService extends CachedDataService<ActividadEconomica> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}actividad-economicas`;
  }
}

@Injectable({ providedIn: 'root' })
export class DenominacionService extends CachedDataService<Denominacion> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}denominaciones`;
  }
}

@Injectable({ providedIn: 'root' })
export class ClienteService extends CachedDataService<Cliente> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}clientes`;
  }
}

@Injectable({ providedIn: 'root' })
export class AvalService extends CachedDataService<Aval> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}avals`;
  }
}

@Injectable({ providedIn: 'root' })
export class ConyugeService extends CachedDataService<Conyuge> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}conyuges`;
  }
}

@Injectable({ providedIn: 'root' })
export class CreditoAnteriorService extends CachedDataService<CreditoAnterior> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}credito-anteriores`;
  }
}

@Injectable({ providedIn: 'root' })
export class FamiliaMiembrosService extends CachedDataService<FamiliaMiembros> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}familia-miembros`;
  }
}

@Injectable({ providedIn: 'root' })
export class GastoFinancieroService extends CachedDataService<GastoFinanciero> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}gasto-financieros`;
  }
}

@Injectable({ providedIn: 'root' })
export class GastosOperativosService extends CachedDataService<GastosOperativos> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}gasto-operativos`;
  }
}

@Injectable({ providedIn: 'root' })
export class IngresoAdicionalService extends CachedDataService<IngresoAdicional> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}ingreso-adicionales`;
  }
}

@Injectable({ providedIn: 'root' })
export class IngresoDependienteService extends CachedDataService<IngresoDependiente> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}ingreso-dependientes`;
  }
}

@Injectable({ providedIn: 'root' })
export class NegocioService extends CachedDataService<Negocio> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}negocios`;
  }
}

@Injectable({ providedIn: 'root' })
export class ReferenciaFamiliarService extends CachedDataService<ReferenciaFamiliar> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}referencia-familiares`;
  }
}

@Injectable({ providedIn: 'root' })
export class RegistroVentasService extends CachedDataService<RegistroVentas> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}registro-ventas`;
  }
}

@Injectable({ providedIn: 'root' })
export class SolicitudService extends CachedDataService<Solicitud> {
  protected override getEndpoint(): string {
    return `${environment.apiUrl}solicitudes`;
  }
}
