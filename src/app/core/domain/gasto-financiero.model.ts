import { Periodo } from "./periodo.model";

export interface GastoFinanciero {
    id: number,
    institucion: string,
    monto_credito: number,
    n_pagadas: number,
    n_total: number,
    monto_cuota: number,
    saldo_credito: number,
    tarjeta: string,
    comentario: string,
    periodo: Periodo
}