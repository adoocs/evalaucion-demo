import { SectorEconomico } from "./sector-economico.model";

export interface Denominacion {
    id: number,
    descripcion: string,
    sector_economico: SectorEconomico
}