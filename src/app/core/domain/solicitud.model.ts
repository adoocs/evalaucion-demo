import { FichaTrabajo } from "./ficha-trabajo.model"
import { Periodo } from "./periodo.model"

export interface Solicitud {
    id: number,
    n_credito: number,
    fecha: string,
    periodo: Periodo,
    plazo: string,
    monto: number,
    v_gerencia: string, // Cambiar de boolean a string para soportar: 'aprobado', 'observado', 'denegado'
    fichaTrabajo: FichaTrabajo 
}