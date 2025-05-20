import { Tiempo } from "./tiempo.model";

export interface IngresoDependiente {
    id: number,
    frecuencia: string,
    importe: number,
    tiempo_valor: number,
    actividad: string,
    tiempo: Tiempo | undefined
}