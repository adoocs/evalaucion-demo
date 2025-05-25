import { Injectable } from '@angular/core';
import { LocalDataService } from './local-data.service';
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
import { Usuario } from '../domain/usuario.model';

import {
  TIPO_VIVIENDAS,
  TASAS,
  PERIODOS,
  TIEMPOS,
  SECTORES_ECONOMICOS,
  ACTIVIDADES_ECONOMICAS,
  DENOMINACIONES,
  CLIENTES,
  AVALES,
  CONYUGES,
  CREDITOS_ANTERIORES,
  GASTOS_FINANCIEROS,
  GASTOS_OPERATIVOS,
  INGRESOS_ADICIONALES,
  INGRESOS_DEPENDIENTES,
  NEGOCIOS,
  REFERENCIAS_FAMILIARES,
  REGISTROS_VENTAS,
  SOLICITUDES,
  APORTANTES,
  FAMILIA_MIEMBROS,
  USUARIOS
} from './mock-data';

@Injectable({ providedIn: 'root' })
export class LocalTipoViviendaService extends LocalDataService<TipoVivienda> {
  protected override getInitialData(): TipoVivienda[] {
    return TIPO_VIVIENDAS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalTasaService extends LocalDataService<Tasa> {
  protected override getInitialData(): Tasa[] {
    return TASAS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalAportanteService extends LocalDataService<Aportante> {
  protected override getInitialData(): Aportante[] {
    return APORTANTES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalPeriodoService extends LocalDataService<Periodo> {
  protected override getInitialData(): Periodo[] {
    return PERIODOS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalTiempoService extends LocalDataService<Tiempo> {
  protected override getInitialData(): Tiempo[] {
    return TIEMPOS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalSectorEconomicoService extends LocalDataService<SectorEconomico> {
  protected override getInitialData(): SectorEconomico[] {
    return SECTORES_ECONOMICOS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalActividadEconomicaService extends LocalDataService<ActividadEconomica> {
  protected override getInitialData(): ActividadEconomica[] {
    return ACTIVIDADES_ECONOMICAS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalDenominacionService extends LocalDataService<Denominacion> {
  protected override getInitialData(): Denominacion[] {
    return DENOMINACIONES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalClienteService extends LocalDataService<Cliente> {
  protected override getInitialData(): Cliente[] {
    return CLIENTES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalAvalService extends LocalDataService<Aval> {
  protected override getInitialData(): Aval[] {
    return AVALES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalConyugeService extends LocalDataService<Conyuge> {
  protected override getInitialData(): Conyuge[] {
    return CONYUGES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalCreditoAnteriorService extends LocalDataService<CreditoAnterior> {
  protected override getInitialData(): CreditoAnterior[] {
    return CREDITOS_ANTERIORES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalFamiliaMiembrosService extends LocalDataService<FamiliaMiembros> {
  protected override getInitialData(): FamiliaMiembros[] {
    return FAMILIA_MIEMBROS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalGastoFinancieroService extends LocalDataService<GastoFinanciero> {
  protected override getInitialData(): GastoFinanciero[] {
    return GASTOS_FINANCIEROS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalGastosOperativosService extends LocalDataService<GastosOperativos> {
  protected override getInitialData(): GastosOperativos[] {
    return GASTOS_OPERATIVOS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalIngresoAdicionalService extends LocalDataService<IngresoAdicional> {
  protected override getInitialData(): IngresoAdicional[] {
    return INGRESOS_ADICIONALES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalIngresoDependienteService extends LocalDataService<IngresoDependiente> {
  protected override getInitialData(): IngresoDependiente[] {
    return INGRESOS_DEPENDIENTES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalNegocioService extends LocalDataService<Negocio> {
  protected override getInitialData(): Negocio[] {
    return NEGOCIOS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalReferenciaFamiliarService extends LocalDataService<ReferenciaFamiliar> {
  protected override getInitialData(): ReferenciaFamiliar[] {
    return REFERENCIAS_FAMILIARES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalRegistroVentasService extends LocalDataService<RegistroVentas> {
  protected override getInitialData(): RegistroVentas[] {
    return REGISTROS_VENTAS;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalSolicitudService extends LocalDataService<Solicitud> {
  protected override getInitialData(): Solicitud[] {
    return SOLICITUDES;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalUsuarioService extends LocalDataService<Usuario> {
  protected override getInitialData(): Usuario[] {
    return USUARIOS;
  }
}
