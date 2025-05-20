import { Aportante } from "./aportante.model";

export interface IngresoAdicional {
    id: number,
    frecuencia: string,
    importe_act: number,
    sustentable: boolean,
    detalle: string,
    firma_aval: boolean,
    firma_conyuge: boolean,
    actividad: string,
    motivo: string,
    aportante: Aportante
    importe_tercero: number,
}