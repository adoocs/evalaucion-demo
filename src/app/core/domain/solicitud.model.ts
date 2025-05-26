import { CreditoAnterior } from "./credito-anterior.model"
import { GastoFinanciero } from "./gasto-financiero.model"
import { IngresoAdicional } from "./ingreso-adicional.model"
import { Negocio } from "./negocio.model"
import { Periodo } from "./periodo.model"
import { ReferenciaFamiliar } from "./referencia-familiar.model"

export interface Solicitud {
    id: number,
    n_credito: number,
    fecha: string,
    monto: number,
    plazo: string,
    v_gerencia: string, // Cambiar de boolean a string para soportar: 'aprobado', 'observado', 'denegado'
    puntaje_sentinel: number,
    cliente?: string,
    aval?: string,
    conyugue?: string,
    periodo?: Periodo,
    gasto_financiero?: GastoFinanciero
    credito_anterior?: CreditoAnterior,
    referencia_familiar?: ReferenciaFamiliar,
    ingreso_adicional?: IngresoAdicional,
    negocio?: Negocio
}