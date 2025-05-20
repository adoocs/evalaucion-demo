import { SectorEconomico } from "./sector-economico.model";

export interface ActividadEconomica {
    id: number,
    descripcion: string,
    sector_economico: SectorEconomico
}