import { IngresoDependiente } from "./ingreso-dependiente.model";
import { Negocio } from "./negocio.model";

export interface DetalleEconomico {
  negocio: Negocio | null;
  ingreso_dependiente: IngresoDependiente | null;
}