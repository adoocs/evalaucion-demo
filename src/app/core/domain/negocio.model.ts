import { ActividadEconomica } from "./actividad-economica.model";
import { GastosOperativos } from "./gastos-operativos.model";
import { IngresoDependiente } from "./ingreso-dependiente.model";
import { RegistroVentas } from "./registro-ventas.model";
import { Tiempo } from "./tiempo.model";

export interface Negocio {
    id: number,
    tiempo_valor: number,
    direccion: string,
    tiempo?: Tiempo,
    actividad_economica?: ActividadEconomica
    registro_ventas?: RegistroVentas
    gastos_operativos?: GastosOperativos[]
}