import { TipoVivienda } from "../domain/tipo-vivienda.model";
import { Tasa } from "../domain/tasa.model";
import { Periodo } from "../domain/periodo.model";
import { Tiempo } from "../domain/tiempo.model";
import { SectorEconomico } from "../domain/sector-economico.model";
import { ActividadEconomica } from "../domain/actividad-economica.model";
import { Denominacion } from "../domain/denominacion.model";
import { Cliente } from "../domain/cliente.model";
import { Aval } from "../domain/aval.model";
import { Conyuge } from "../domain/conyuge.model";
import { CreditoAnterior } from "../domain/credito-anterior.model";
import { GastoFinanciero } from "../domain/gasto-financiero.model";
import { GastosOperativos } from "../domain/gastos-operativos.model";
import { IngresoAdicional } from "../domain/ingreso-adicional.model";
import { IngresoDependiente } from "../domain/ingreso-dependiente.model";
import { Negocio } from "../domain/negocio.model";
import { ReferenciaFamiliar } from "../domain/referencia-familiar.model";
import { RegistroVentas } from "../domain/registro-ventas.model";
import { Solicitud } from "../domain/solicitud.model";
import { Aportante } from "../domain/aportante.model";
import { Usuario } from "../domain/usuario.model";
import { FamiliaMiembros } from "../domain/familia-miembros.model";

// Datos de ejemplo para TipoVivienda
export const TIPO_VIVIENDAS: TipoVivienda[] = [
  { id: 1, descripcion: 'Propia' },
  { id: 2, descripcion: 'Alquilada' },
  { id: 3, descripcion: 'Familiar' }
];

// Datos de ejemplo para Tasa
export const TASAS: Tasa[] = [
  { id: 1, porcentaje: 5.5 },
  { id: 2, porcentaje: 7.2 },
  { id: 3, porcentaje: 8.5 }
];

// Datos de ejemplo para Periodo
export const PERIODOS: Periodo[] = [
  { id: 1, descripcion: 'Mensual' },
  { id: 2, descripcion: 'Quincenal' },
  { id: 3, descripcion: 'Semanal' }
];

// Datos de ejemplo para Tiempo
export const TIEMPOS: Tiempo[] = [
  { id: 1, descripcion: 'Mes', valor: 1 },
  { id: 2, descripcion: 'Año', valor: 12 }
];

// Datos de ejemplo para SectorEconomico
export const SECTORES_ECONOMICOS: SectorEconomico[] = [
  { id: 1, descripcion: 'Comercio' },
  { id: 2, descripcion: 'Producción' },
  { id: 3, descripcion: 'Servicios' },
  { id: 4, descripcion: 'Transporte' }
];

// Datos de ejemplo para ActividadEconomica
export const ACTIVIDADES_ECONOMICAS: ActividadEconomica[] = [
  // Sector Comercio
  { id: 1, descripcion: 'Bodega / Bazar', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 2, descripcion: 'Bodega / Minimarket', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 3, descripcion: 'Bodega, venta de carnes o verduras', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 4, descripcion: 'Bodega, venta de carnes y verduras', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 5, descripcion: 'Leche, comercio', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 6, descripcion: 'Venta de abarrotes, al por mayor', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 7, descripcion: 'Venta de abarrotes, al por menor', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 8, descripcion: 'Venta de accesorios y/o repuestos para vehículos', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 9, descripcion: 'Venta de agregados para la construcción, distribución', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 10, descripcion: 'Venta de agua', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 11, descripcion: 'Venta de animales menores', sector_economico: SECTORES_ECONOMICOS[0] },

  // Sector Producción
  { id: 12, descripcion: 'Carpintería a pedido y en serie', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 13, descripcion: 'Extracción de minerales, distribución', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 14, descripcion: 'Ladrillos y agregados, fabricación y venta', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 15, descripcion: 'Maletas, fabricación y venta minorista', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 16, descripcion: 'Manualidades, adornos y decoraciones para escolares, docentes y demás trabajos', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 17, descripcion: 'Pesca artesanal', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 18, descripcion: 'Prendas de vestir (ropa), confección y venta minorista', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 19, descripcion: 'Producción de artesanias, distribución y venta', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 20, descripcion: 'Repuestos y accesorios para automóviles, fabricación', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 21, descripcion: 'Soldador, carpintería metálica a pedido y en serie', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 22, descripcion: 'Venta de pan, Panaderías', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 23, descripcion: 'Venta de tortas, postres, pan, Pastelería', sector_economico: SECTORES_ECONOMICOS[1] },

  // Sector Servicios
  { id: 24, descripcion: 'Academia, dueño o profesor', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 25, descripcion: 'Agencia de viaje', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 26, descripcion: 'Alquiler de casa', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 27, descripcion: 'Alquiler de cuartos', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 28, descripcion: 'Alquiler de equipos para construcción', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 29, descripcion: 'Alquiler de ropa y disfraces', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 30, descripcion: 'Alquiler de vehículos', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 31, descripcion: 'Animador de eventos, fiestas infantiles, presentador', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 32, descripcion: 'Decoración de eventos', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 33, descripcion: 'Discotecas / Pub', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 34, descripcion: 'Estudio fotográfico', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 35, descripcion: 'Estudio gráfico, diseño de logos, letreros, videos promocionales, etc.', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 36, descripcion: 'Funeraria', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 37, descripcion: 'Gimnasios', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 38, descripcion: 'Guarderia', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 39, descripcion: 'Hotel / Hostal', sector_economico: SECTORES_ECONOMICOS[2] },

  // Sector Transporte
  { id: 40, descripcion: 'Mototaxi, chofer', sector_economico: SECTORES_ECONOMICOS[3] },
  { id: 41, descripcion: 'Taxi, chofer', sector_economico: SECTORES_ECONOMICOS[3] },
  { id: 42, descripcion: 'Transporte de carga pesada', sector_economico: SECTORES_ECONOMICOS[3] },
  { id: 43, descripcion: 'Transporte interprovincial de pasajeros (ciudades aledañas)', sector_economico: SECTORES_ECONOMICOS[3] },
  { id: 44, descripcion: 'Transporte urbano de pasajeros, micros, custer, combis', sector_economico: SECTORES_ECONOMICOS[3] }
];

// Datos de ejemplo para Denominacion
export const DENOMINACIONES: Denominacion[] = [
  // Sector Comercio (id: 1)
  { id: 1, descripcion: 'Personal a cargo', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 2, descripcion: 'Servicios básicos', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 3, descripcion: 'Transporte', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 4, descripcion: 'Alquileres del negocio', sector_economico: SECTORES_ECONOMICOS[0] },
  { id: 5, descripcion: 'Otros', sector_economico: SECTORES_ECONOMICOS[0] },

  // Sector Producción (id: 2)
  { id: 6, descripcion: 'Personal a cargo', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 7, descripcion: 'Servicios básicos', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 8, descripcion: 'Transporte', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 9, descripcion: 'Alquileres del negocio', sector_economico: SECTORES_ECONOMICOS[1] },
  { id: 10, descripcion: 'Otros', sector_economico: SECTORES_ECONOMICOS[1] },

  // Sector Servicios (id: 3)
  { id: 11, descripcion: 'Personal a cargo', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 12, descripcion: 'Servicios básicos', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 13, descripcion: 'Transporte', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 14, descripcion: 'Alquileres del negocio', sector_economico: SECTORES_ECONOMICOS[2] },
  { id: 15, descripcion: 'Otros', sector_economico: SECTORES_ECONOMICOS[2] },

  // Sector Transporte (id: 4)
  { id: 16, descripcion: 'Cochera', sector_economico: SECTORES_ECONOMICOS[3] },
  { id: 17, descripcion: 'Alquiler de vehículo', sector_economico: SECTORES_ECONOMICOS[3] },
  { id: 18, descripcion: 'Otros', sector_economico: SECTORES_ECONOMICOS[3] },
];

// Datos de ejemplo para Cliente
export const CLIENTES: Cliente[] = [
  {
    id: 1,
    apellidos: 'Pérez López',
    nombres: 'Juan Carlos',
    dni: '12345678',
    fecha_born: '1985-05-15',
    estado_civil: 'Casado',
    edad: 38,
    genero: 'M',
    direccion: 'Av. Principal 123',
    celular: 987654321,
    n_referencial: 123456,
    grado_instruccion: 'Superior',
    email: 'juan@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[0]
  },
  {
    id: 2,
    apellidos: 'Gómez Rodríguez',
    nombres: 'María Elena',
    dni: '87654321',
    fecha_born: '1990-10-20',
    estado_civil: 'Soltera',
    edad: 33,
    genero: 'F',
    direccion: 'Jr. Secundaria 456',
    celular: 912345678,
    n_referencial: 654321,
    grado_instruccion: 'Técnico',
    email: 'maria@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[1]
  }
];

// Datos de ejemplo para Aval
export const AVALES: Aval[] = [
  {
    id: 1,
    apellidos: 'Martínez Sánchez',
    nombres: 'Roberto',
    dni: '23456789',
    direccion: 'Calle Los Pinos 789',
    celular: '945678123',
    n_referencial: 789123,
    actividad: 'Comerciante',
    parentesco: 'Hermano',
    tipo_vivienda: TIPO_VIVIENDAS[0],
    omitido: false
  }
];

// Datos de ejemplo para Conyuge
export const CONYUGES: Conyuge[] = [
  {
    id: 1,
    apellidos: 'Torres Vega',
    nombres: 'Ana María',
    dni: '34567890',
    celular: '956781234',
    actividad: 'Docente',
    omitido: false
  }
];

// Datos de ejemplo para CreditoAnterior
export const CREDITOS_ANTERIORES: CreditoAnterior[] = [
  {
    id: 1,

    monto: 130,
    saldo: 190,
    estado: 'vigente',
    tasa: TASAS[0],
    periodo: PERIODOS[0],
    cuotas_pagadas: 4,
    cuotas_totales: 12,
  }
];

// Datos de ejemplo para GastoFinanciero
export const GASTOS_FINANCIEROS: GastoFinanciero[] = [
  {
    id: 1,
    institucion: 'Banco ABC',
    monto_credito: 1000,
    n_pagadas: 5,
    n_total: 10,
    monto_cuota: 100,
    saldo_credito: 500,
    tarjeta: 'Visa',
    comentario: 'Préstamo para remodelación',
    periodo: PERIODOS[0]
  }
];

// Datos de ejemplo para GastosOperativos
export const GASTOS_OPERATIVOS: GastosOperativos[] = [
  {
    id: 1,
    cantidad: 1,
    importe: 800,
    detalle: 'Alquiler de local',
    denominacion: DENOMINACIONES[3] // Alquileres del negocio (Comercio)
  },
  {
    id: 2,
    cantidad: 1,
    importe: 200,
    detalle: 'Servicios de agua y luz',
    denominacion: DENOMINACIONES[1] // Servicios básicos (Comercio)
  },
  {
    id: 3,
    cantidad: 1,
    importe: 500,
    detalle: 'Pago a empleados',
    denominacion: DENOMINACIONES[0] // Personal a cargo (Comercio)
  }
];

// Datos de ejemplo para Aportante
export const APORTANTES: Aportante[] = [
  {
    id: 1,
    descripcion: 'Madre',
  },
  {
    id: 2,
    descripcion: 'Padre',
  },
  {
    id: 3,
    descripcion: 'Cónyuge',
  },
  {
    id: 4,
    descripcion: 'Conviviente',
  },
  {
    id: 5,
    descripcion: 'Expareja',
  },
  {
    id: 6,
    descripcion: 'Pareja',
  },
  {
    id: 7,
    descripcion: 'Hijo(a)',
  },
  {
    id: 8,
    descripcion: 'Hermano(a)',
  },
  {
    id: 9,
    descripcion: 'Primo(a)',
  },
  {
    id: 10,
    descripcion: 'Sobrino(a)',
  },
  {
    id: 11,
    descripcion: 'Tío(a)',
  },
  {
    id: 12,
    descripcion: 'Otro',
  },
];


// Datos de ejemplo para IngresoAdicional
export const INGRESOS_ADICIONALES: IngresoAdicional[] = [
  {
    id: 1,
    frecuencia: 'Mensual',
    importe_act: 1500,
    sustentable: true,
    detalle: 'Alquiler de departamento',
    firma_aval: true,
    firma_conyuge: false,
    actividad: 'Inmobiliaria',
    motivo: '',
    aportante: APORTANTES[0],
    importe_tercero: 0
  }
];

// Datos de ejemplo para IngresoDependiente
export const INGRESOS_DEPENDIENTES: IngresoDependiente[] = [
  {
    id: 1,
    frecuencia: 'Mensual',
    importe: 2500,
    tiempo_valor: 3,
    actividad: 'Contador',
    tiempo: TIEMPOS[0]
  }
];

// Datos de ejemplo para RegistroVentas
export const REGISTROS_VENTAS: RegistroVentas[] = [
  {
    id: 1,
    ventas_normales: 5000,
    ventas_bajas: 3500,
    ventas_altas: 7000,
    frecuencia: 'Mensual'
  }
];

// Datos de ejemplo para Negocio
export const NEGOCIOS: Negocio[] = [
  {
    id: 1,
    tiempo_valor: 5,
    direccion: 'Av. Comercial 567',
    tiempo: TIEMPOS[0],
    actividad_economica: ACTIVIDADES_ECONOMICAS[2], // Bodega, venta de carnes o verduras
    registro_ventas: REGISTROS_VENTAS[0],
    gastos_operativos: [GASTOS_OPERATIVOS[0], GASTOS_OPERATIVOS[1], GASTOS_OPERATIVOS[2]]
  }
];

// Datos de ejemplo para FamiliaMiembros
export const FAMILIA_MIEMBROS: FamiliaMiembros[] = [
  {
    id: 1,
    descripcion: 'Infantes',
    n_hijos: 0,
    condicion: true,
  },
  {
    id: 2,
    descripcion: 'Escolares',
    n_hijos: 0,
    condicion: true,
  },
  {
    id: 3,
    descripcion: 'Universitarios',
    n_hijos: 0,
    condicion: true,
  },
  {
    id: 4,
    descripcion: 'Mayores',
    n_hijos: 0,
    condicion: true,
  }
];

// Datos de ejemplo para ReferenciaFamiliar
export const REFERENCIAS_FAMILIARES: ReferenciaFamiliar[] = [
  {
    id: 1,
    referencia_domicilio: 'calle zzzz',
    familia_miembros: FAMILIA_MIEMBROS,
  }
];

// Datos de ejemplo para Solicitud
export const SOLICITUDES: Solicitud[] = [
  {
    id: 1,
    n_credito: 10001,
    fecha: '2023-10-15',
    monto: 10000,
    plazo: '12 meses',
    v_gerencia: false,
    puntaje_sentinel: 750,
    cliente: 'Juan Carlos Pérez López',
    aval: 'Roberto Martínez Sánchez',
    conyugue: 'Ana María Torres Vega',
    periodo: PERIODOS[0],
    gasto_financiero: GASTOS_FINANCIEROS[0],
    credito_anterior: CREDITOS_ANTERIORES[0],
    referencia_familiar: REFERENCIAS_FAMILIARES[0],
    ingreso_adicional: INGRESOS_ADICIONALES[0],
    negocio: NEGOCIOS[0]
  },
  {
    id: 2,
    n_credito: 10002,
    fecha: '2023-11-20',
    monto: 5000,
    plazo: '6 meses',
    v_gerencia: true,
    puntaje_sentinel: 820,
    cliente: 'María Elena Gómez Rodríguez',
    periodo: PERIODOS[1]
  }
];

// Datos de ejemplo para Usuario
export const USUARIOS: Usuario[] = [
  {
    id: 1,
    nombre: 'Juan Carlos',
    apellidos: 'Pérez López',
    email: 'admin@empresa.com',
    username: 'admin',
    rol: 'admin',
    activo: true,
    fecha_creacion: '2023-01-15',
    ultimo_acceso: '2024-01-15',
    telefono: '987654321',
    dni: '12345678'
  },
  {
    id: 2,
    nombre: 'María Elena',
    apellidos: 'Gómez Rodríguez',
    email: 'supervisor@empresa.com',
    username: 'supervisor',
    rol: 'supervisor',
    activo: true,
    fecha_creacion: '2023-02-20',
    ultimo_acceso: '2024-01-14',
    telefono: '912345678',
    dni: '87654321'
  },
  {
    id: 3,
    nombre: 'Roberto',
    apellidos: 'Martínez Sánchez',
    email: 'usuario@empresa.com',
    username: 'usuario',
    rol: 'usuario',
    activo: true,
    fecha_creacion: '2023-03-10',
    ultimo_acceso: '2024-01-13',
    telefono: '945678123',
    dni: '23456789'
  },
  {
    id: 4,
    nombre: 'Ana María',
    apellidos: 'Torres Vega',
    email: 'ana.torres@empresa.com',
    username: 'atorres',
    rol: 'usuario',
    activo: false,
    fecha_creacion: '2023-04-05',
    ultimo_acceso: '2023-12-20',
    telefono: '956781234',
    dni: '34567890'
  }
];
