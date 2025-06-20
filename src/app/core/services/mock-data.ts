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
  { id: 1, descripcion: 'Diario' },
  { id: 2, descripcion: 'Semanal' },
  { id: 3, descripcion: 'Quincenal' },
  { id: 4, descripcion: 'Mensual' },
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
    estado_civil: 'casado',
    edad: 38,
    genero: 'M',
    direccion: 'Av. Principal 123',
    celular: 987654321,
    n_referencial: 123456,
    grado_instruccion: 'universitaria',
    email: 'juan@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[0],
  },
  {
    id: 2,
    apellidos: 'Gómez Rodríguez',
    nombres: 'María Elena',
    dni: '87654321',
    fecha_born: '1990-10-20',
    estado_civil: 'soltero',
    edad: 33,
    genero: 'F',
    direccion: 'Jr. Secundaria 456',
    celular: 912345678,
    n_referencial: 654321,
    grado_instruccion: 'tecnica',
    email: 'maria@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[1],
  },
  {
    id: 3,
    apellidos: 'Ramírez Soto',
    nombres: 'Luis Alberto',
    dni: '11223344',
    fecha_born: '1978-07-02',
    estado_civil: 'viudo',
    edad: 46,
    genero: 'M',
    direccion: 'Calle Lima 789',
    celular: 999888777,
    n_referencial: 112233,
    grado_instruccion: 'secundaria',
    email: 'luis@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[2],
  },
  {
    id: 4,
    apellidos: 'Torres Ruiz',
    nombres: 'Ana Lucía',
    dni: '55667788',
    fecha_born: '1995-12-05',
    estado_civil: 'conviviente',
    edad: 29,
    genero: 'F',
    direccion: 'Av. Arequipa 1234',
    celular: 987321654,
    n_referencial: 445566,
    grado_instruccion: 'universitaria',
    email: 'ana@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[1],
  },
  {
    id: 5,
    apellidos: 'Mendoza Quispe',
    nombres: 'Carlos Daniel',
    dni: '33445566',
    fecha_born: '1982-03-22',
    estado_civil: 'casado',
    edad: 43,
    genero: 'M',
    direccion: 'Psje. El Sol 234',
    celular: 911223344,
    n_referencial: 778899,
    grado_instruccion: 'primaria',
    email: 'carlos@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[0],
  },
  {
    id: 6,
    apellidos: 'Salas Fernández',
    nombres: 'Patricia Mercedes',
    dni: '99887766',
    fecha_born: '1988-08-18',
    estado_civil: 'divorciado',
    edad: 36,
    genero: 'F',
    direccion: 'Jr. La Paz 678',
    celular: 923456789,
    n_referencial: 334455,
    grado_instruccion: 'tecnica',
    email: 'patricia@example.com',
    tipo_vivienda: TIPO_VIVIENDAS[2],
  },
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
  },
  {
    id: 2,
    institucion: 'Banco XYZ',
    monto_credito: 2000,
    n_pagadas: 8,
    n_total: 12,
    monto_cuota: 180,
    saldo_credito: 720,
    tarjeta: 'Mastercard',
    comentario: 'Préstamo personal',
    periodo: PERIODOS[1]
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
    frecuencia: 'mensual', // Usar código que coincida con el componente
    importe: 2500,
    tiempo_valor: 3,
    actividad: 'Empleado público',
    tiempo: TIEMPOS[1] // Usar años en lugar de meses
  },
  {
    id: 2,
    frecuencia: 'quincenal',
    importe: 1200,
    tiempo_valor: 2,
    actividad: 'Empleado privado - Administrativo',
    tiempo: TIEMPOS[1] // Años
  },
  {
    id: 3,
    frecuencia: 'mensual',
    importe: 3000,
    tiempo_valor: 5,
    actividad: 'Docente universitario',
    tiempo: TIEMPOS[1] // Años
  }
];

// Datos de ejemplo para RegistroVentas
export const REGISTROS_VENTAS: RegistroVentas[] = [
  {
    id: 1,
    ventas_normales: 5000,
    ventas_bajas: 3500,
    ventas_altas: 7000,
    frecuencia: 'semanal' // Usar código que coincida con el componente
  },
  {
    id: 2,
    ventas_normales: 3000,
    ventas_bajas: 2000,
    ventas_altas: 4500,
    frecuencia: 'semanal'
  },
  {
    id: 3,
    ventas_normales: 8000,
    ventas_bajas: 6000,
    ventas_altas: 12000,
    frecuencia: 'semanal'
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
  },
  {
    id: 2,
    tiempo_valor: 3,
    direccion: 'Jr. Los Olivos 123',
    tiempo: TIEMPOS[0],
    actividad_economica: ACTIVIDADES_ECONOMICAS[0], // Bodega / Bazar
    registro_ventas: REGISTROS_VENTAS[1],
    gastos_operativos: [GASTOS_OPERATIVOS[1]]
  },
  {
    id: 3,
    tiempo_valor: 7,
    direccion: 'Calle Las Flores 456',
    tiempo: TIEMPOS[1], // Años
    actividad_economica: ACTIVIDADES_ECONOMICAS[21], // Venta de pan, Panaderías
    registro_ventas: REGISTROS_VENTAS[2],
    gastos_operativos: [GASTOS_OPERATIVOS[0], GASTOS_OPERATIVOS[2]]
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
    referencia_domicilio: 'Av. Los Pinos 123, San Juan',
    familia_miembros: FAMILIA_MIEMBROS,
  },
  {
    id: 2,
    referencia_domicilio: 'Jr. Las Rosas 456, Miraflores',
    familia_miembros: FAMILIA_MIEMBROS,
  },
  {
    id: 3,
    referencia_domicilio: 'Calle Los Olivos 789, San Isidro',
    familia_miembros: FAMILIA_MIEMBROS,
  }
];

// Datos de ejemplo para Solicitud
export const SOLICITUDES: Solicitud[] = [
  {
    id: 1,
    n_credito: 10001,
    fecha: '15/10/2023', // Formato día/mes/año
    periodo: PERIODOS[0],
    plazo: '12 meses',
    monto: 10000,
    v_gerencia: 'aprobado', // Estado aprobado
    fichaTrabajo: {
      id: 1,
      cliente: CLIENTES[0],
      aval: AVALES[0],
      conyuge: CONYUGES[0],
      referencia_familiar: REFERENCIAS_FAMILIARES[0],
      credito_anterior: CREDITOS_ANTERIORES[0],
      gasto_financieros: [GASTOS_FINANCIEROS[0]],
      ingreso_adicional: INGRESOS_ADICIONALES[0],
      puntaje_sentinel: 750,
      detalleEconomico: {
        negocio: NEGOCIOS[0],
        ingreso_dependiente: null,
      },
    },
  },
  {
    id: 2,
    n_credito: 10002,
    fecha: '20/11/2023', // Formato día/mes/año
    periodo: PERIODOS[1],
    monto: 5000,
    plazo: '6 meses',
    v_gerencia: 'observado', // Estado observado
    fichaTrabajo: {
      id: 2,
      cliente: CLIENTES[1], // María Elena Gómez Rodríguez
      aval: null, // No tiene aval
      conyuge: null, // Soltera, no tiene cónyuge
      referencia_familiar: REFERENCIAS_FAMILIARES[1],
      credito_anterior: null, // No tiene crédito anterior
      gasto_financieros: [GASTOS_FINANCIEROS[1]],
      ingreso_adicional: null, // No tiene ingreso adicional
      puntaje_sentinel: 820,
      detalleEconomico: {
        negocio: null, // NO tiene negocio
        ingreso_dependiente: INGRESOS_DEPENDIENTES[1], // SOLO INGRESO DEPENDIENTE - Empleado privado
      },
    },
  },
  {
    id: 3,
    n_credito: 10003,
    fecha: '05/12/2023', // Formato día/mes/año
    periodo: PERIODOS[2],
    monto: 15000,
    plazo: '24 meses',
    v_gerencia: 'denegado', // Estado denegado
    fichaTrabajo: {
      id: 3,
      cliente: CLIENTES[0], // Reutilizamos un cliente existente
      aval: AVALES[0], // Roberto Martínez Sánchez como aval
      conyuge: CONYUGES[0], // Tiene cónyuge
      referencia_familiar: REFERENCIAS_FAMILIARES[2],
      credito_anterior: CREDITOS_ANTERIORES[0],
      gasto_financieros: [], // No tiene gastos financieros
      ingreso_adicional: null, // No tiene ingreso adicional
      puntaje_sentinel: 450,
      detalleEconomico: {
        negocio: NEGOCIOS[0], // SOLO NEGOCIO - Bodega / Bazar
        ingreso_dependiente: null, // NO tiene ingreso_dependiente
      },
    },
  },
  {
    id: 4,
    n_credito: 10004,
    fecha: '15/12/2023', // Formato día/mes/año
    periodo: PERIODOS[2],
    monto: 7500,
    plazo: '18 meses',
    v_gerencia: 'pendiente', // Estado pendiente
    fichaTrabajo: {
      id: 4,
      cliente: CLIENTES[2], // Ana María Torres Vega
      aval: null, // No tiene aval
      conyuge: null, // No tiene cónyuge
      referencia_familiar: REFERENCIAS_FAMILIARES[1],
      credito_anterior: null, // No tiene crédito anterior
      gasto_financieros: [], // No tiene gastos financieros
      ingreso_adicional: INGRESOS_ADICIONALES[0],
      puntaje_sentinel: 680,
      detalleEconomico: {
        negocio: null, // NO tiene negocio
        ingreso_dependiente: INGRESOS_DEPENDIENTES[2], // SOLO INGRESO DEPENDIENTE - Docente universitario
      },
    },
  },
  {
    id: 5,
    n_credito: 10005,
    fecha: '10/01/2024', // Formato día/mes/año
    periodo: PERIODOS[2],
    monto: 3000,
    plazo: '8 meses',
    v_gerencia: 'aprobado', // Estado aprobado
    fichaTrabajo: {
      id: 5,
      cliente: CLIENTES[3], // Carlos Eduardo Ramírez
      aval: null, // No tiene aval
      conyuge: null, // No tiene cónyuge
      referencia_familiar: REFERENCIAS_FAMILIARES[2],
      credito_anterior: null, // No tiene crédito anterior
      gasto_financieros: [], // No tiene gastos financieros
      ingreso_adicional: null, // No tiene ingreso adicional
      puntaje_sentinel: 720,
      detalleEconomico: {
        negocio: null, // NO tiene negocio
        ingreso_dependiente: INGRESOS_DEPENDIENTES[0], // SOLO INGRESO DEPENDIENTE - Empleado público
      },
    },
  },
  {
    id: 6,
    n_credito: 10006,
    fecha: '25/01/2024', // Formato día/mes/año
    periodo: PERIODOS[2],
    monto: 12000,
    plazo: '18 meses',
    v_gerencia: 'pendiente', // Estado pendiente
    fichaTrabajo: {
      id: 6,
      cliente: CLIENTES[4], // Luis Fernando García
      aval: AVALES[1], // Roberto Martínez Sánchez como aval
      conyuge: CONYUGES[1], // Tiene cónyuge
      referencia_familiar: REFERENCIAS_FAMILIARES[0],
      credito_anterior: null, // No tiene crédito anterior
      gasto_financieros: [GASTOS_FINANCIEROS[0]],
      ingreso_adicional: null, // No tiene ingreso adicional
      puntaje_sentinel: 690,
      detalleEconomico: {
        negocio: NEGOCIOS[2], // SOLO NEGOCIO - Panadería
        ingreso_dependiente: null, // NO tiene ingreso_dependiente
      },
    },
  },
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
