import { ActividadEconomica } from "./actividad-economica.model"
import { Solicitud } from "./solicitud.model"

export interface TipoZona {
    id: number
    descripcion: string
}

export interface Segmento {
    id: number
    descripcion: string
    tipo_zona: TipoZona
}

export interface ZonaGeografica {
    id: number
    descripcion: string
}

export interface CostoPromedio {
    porcentaje: number
    zona_geografica: ZonaGeografica
    actividad_economica: ActividadEconomica
}

export interface ZonaReferencial {
    id: number
    descripcion: string
    zona_geografica: ZonaGeografica
}

export interface TipoVehiculo {
    id: number
    descripcion: string
}

export interface ZonaVehiculo {
    id: number
    monto: number
    tipo_vehiculo: TipoVehiculo
    zona_referencial: ZonaReferencial
}

export interface Destino {
    id: number
    descripcion: string
}

export interface Prestamo {
    id: number
    cuota_ref: number
    cuota_red: number
    producto: string
    destino: Destino
}

export interface SistemaFinanciero {
    id: number
    esGf: boolean
    destino: Destino
}

export interface ResumenIngDependiente {
    id: number
    ingreso_conyuge: number
    ingreso_codeudor: number
    ingreso_tereceros: number
}

export interface GastoFamiliar{
    id: number
    tipo_educacion: string
    gasto_basico: number
    gasto_educacion: number
    alquiler_domicilio: number
    otros_gastos: number
    total: number
}

export interface HojaEvaluacion {
    id: number
    fecha: string
    segmento: Segmento
    zona_geografica: ZonaGeografica
    prestamo: Prestamo
    sistema_financiero: SistemaFinanciero
    resumen_ingreso_dependiente: ResumenIngDependiente
    gasto_familiar: GastoFamiliar
}

export interface TipoCredito {
    id: number
    descripcion: string
}

export interface Motivador {
    id: number
    descripcion: string
    tipo_credito: TipoCredito
}

export interface Validador {
    id: number
    descripcion: string
    valor_minimo_aceptable: number
    motivador: Motivador
}

export interface CalificacionValidador {
    id: number
    descripcion: string
    valor: number
    validador: Validador
}

export interface MatrizValidador {
    calificacion: number
    validador: Validador
}

export interface MatrizMotivadoresPago {
    id: number
    calificacion_motivadores_pago: number
    matriz_motivadores: MatrizValidador[]
}

export interface Factor {
    id: number
    descripcion: string
    tipo_credito: TipoCredito
}

export interface CalificacionFactor {
    id: number
    descripcion: string
    valor: number
    factor: Factor
}

export interface MatrizFactor {
    puntajeFactor: number
    calificacion_factor: CalificacionFactor
}

export interface MatrizFactorInfo {
    id: number
    calificacion_factor_info: number
    matriz_factores: MatrizFactor[]
}

export interface Cualitativo {
    id: number
    fac: number
    matriz_motivadores_pago: MatrizMotivadoresPago
    matriz_factor_info: MatrizFactorInfo
}

export interface EvaGeneral {
    id: number
    cualitativo: Cualitativo
    hoja_evaluacion: HojaEvaluacion
    solicitud: Solicitud
}

export interface TipoCliente {
    id: number
    descripcion: string
}
//duda
export interface EndeudamientoConsumo {
    id: number
    institucion: string
    remuneracion: number
    descuento_ley: number
    ingreso_neto: number
    ingreso_adicional: number
    margen_costo: number
    costo_venta: number
    total_ingreso: number
    saldo_disponible_inicial: number
    tipo_cliente: TipoCliente
    eva_general: EvaGeneral
}

export interface GastoNormal {
    id: number
    denominacion: string
    importe: number
}

export interface DeterminacionIngreso {
    id: number
    descripcion: string
    n_dias: number
    venta_dia: number
    venta_semana: number
}

export interface GastoTransporte {
    id: number
    descripcion: string
    costo_cantidad: number
    duracion_mes: number
    monto_mes: number
}

export interface EndeudamientoMicro {
    id: number
    n_dias: number
    venta_semanal: number
    venta_mensual: number
    venta_credito: number
    adicional_mensual: number
    gasto_normales: GastoNormal []
    determinacion_ingresos: DeterminacionIngreso []
    eva_general: EvaGeneral
}

export interface EvaTransporte {
    id: number
    cantidad: number
    total_go: number
    tipo_vehiculo: TipoVehiculo
    gasto_transporte: GastoTransporte []
    endeudamiento_micro: EndeudamientoMicro
}

