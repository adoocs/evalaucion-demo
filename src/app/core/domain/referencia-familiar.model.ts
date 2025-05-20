import { FamiliaMiembros } from "./familia-miembros.model";

export interface ReferenciaFamiliar {
    id: number,
    referencia_domicilio: string,
    familia_miembros?: FamiliaMiembros[]
}