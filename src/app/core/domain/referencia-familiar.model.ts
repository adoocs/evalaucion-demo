import { FamiliaMiembros } from "./familia-miembros.model";

export interface ReferenciaFamiliar {
    id: number,
    referencia_domicilio: string,
    direccion?: string,
    latitud?: number,
    longitud?: number,
    familia_miembros?: FamiliaMiembros[]
}
