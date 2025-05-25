export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  username: string;
  password?: string; // Opcional para no mostrar en la tabla
  rol: 'admin' | 'usuario' | 'supervisor';
  activo: boolean;
  fecha_creacion: string;
  ultimo_acceso?: string;
  telefono?: string;
  dni?: string;
}
