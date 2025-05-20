import { TipoVivienda } from "./tipo-vivienda.model"

export interface Cliente {
    id: number
    apellidos: string
    nombres: string
    dni: string
    fecha_born?: string
    estado_civil?: string
    edad?:number
    genero: string
    direccion?: string
    celular?: number
    n_referencial?: number
    grado_instruccion?: string
    email?: string
    tipo_vivienda: TipoVivienda
}