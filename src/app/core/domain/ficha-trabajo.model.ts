import { Aval } from "./aval.model";
import { Cliente } from "./cliente.model";
import { Conyuge } from "./conyuge.model";
import { CreditoAnterior } from "./credito-anterior.model";
import { DetalleEconomico } from "./detalle-economico.model";
import { GastoFinanciero } from "./gasto-financiero.model";
import { IngresoAdicional } from "./ingreso-adicional.model";
import { ReferenciaFamiliar } from "./referencia-familiar.model";

export interface FichaTrabajo {
    id: number;
    cliente: Cliente | null;
    aval: Aval | null;
    conyuge: Conyuge | null;
    referencia_familiar: ReferenciaFamiliar | null;
    credito_anterior: CreditoAnterior | null;
    gasto_financieros: GastoFinanciero[] | null;
    ingreso_adicional: IngresoAdicional | null;
    puntaje_sentinel: number | null;
    detalleEconomico: DetalleEconomico | null;
}