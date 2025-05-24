import { Periodo } from "./periodo.model";
import { Tasa } from "./tasa.model";

export interface CreditoAnterior {
    id: number,
    monto: number,
    saldo: number,
    estado: string,
    tasa: Tasa,
    periodo: Periodo,
    cuotas_pagadas?: number,
    cuotas_totales?: number
}