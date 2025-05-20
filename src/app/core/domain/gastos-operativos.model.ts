import { Denominacion } from "./denominacion.model";

export interface GastosOperativos {
    id: number,
    cantidad: number,
    importe: number,
    detalle: string,
    denominacion: Denominacion,
}