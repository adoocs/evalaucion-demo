import { TipoVivienda } from "./tipo-vivienda.model"

export interface Aval {
    id: number
    apellidos: string
    nombres: string
    dni: string
    direccion?: string
    celular?: string
    n_referencial?: number
    actividad?: string
    parentesco?: string
    tipo_vivienda: TipoVivienda | null
    omitido?: boolean
    motivo?: string
}