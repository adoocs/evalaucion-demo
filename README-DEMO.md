# Evaluación App - Versión Demo

Esta es una versión demo de la aplicación Evaluación App que utiliza datos locales en lugar de conectarse a una base de datos. Esta versión es útil para pruebas y demostraciones sin necesidad de configurar un backend.

## Características de la versión demo

- Utiliza datos en memoria en lugar de conectarse a una API
- Simula todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
- Incluye datos de ejemplo para todas las entidades
- Simula retrasos de red para una experiencia más realista
- Implementa la autenticación local

## Credenciales de acceso

Para iniciar sesión en la aplicación demo, utiliza cualquiera de las siguientes credenciales:

- **DNI**: 12345678, **Contraseña**: password
- **DNI**: 87654321, **Contraseña**: password
- **DNI**: 23456789, **Contraseña**: password
- **DNI**: admin, **Contraseña**: admin

## Datos de ejemplo

La aplicación incluye los siguientes datos de ejemplo:

### Personas (para consulta de DNI)

| DNI | Nombres | Apellidos |
|-----|---------|-----------|
| 12345678 | Juan Carlos | Pérez López |
| 87654321 | María Elena | Gómez Rodríguez |
| 23456789 | Roberto | Martínez Sánchez |
| 34567890 | Ana María | Torres Vega |

### Tipos de Vivienda

- Casa propia
- Alquilada
- Familiar
- Otro

### Sectores Económicos

- Comercio
- Servicios
- Industria
- Agricultura

### Actividades Económicas

- Venta de ropa (Comercio)
- Restaurante (Servicios)
- Taller mecánico (Industria)
- Cultivo de maíz (Agricultura)

### Solicitudes

La aplicación incluye 2 solicitudes de ejemplo para demostrar la funcionalidad.

## Cómo ejecutar la aplicación

1. Asegúrate de tener Node.js y npm instalados
2. Clona el repositorio
3. Instala las dependencias con `npm install`
4. Ejecuta la aplicación con `npm start`
5. Abre tu navegador en `http://localhost:4200`

## Funcionalidades disponibles en la versión demo

### Consulta de DNI
Para probar la consulta de DNI, puedes usar cualquiera de los siguientes DNIs:
- 12345678 (Juan Carlos Pérez López)
- 87654321 (María Elena Gómez Rodríguez)
- 23456789 (Roberto Martínez Sánchez)
- 34567890 (Ana María Torres Vega)

### Validación de DNI
- Los DNI que comienzan con "1" se consideran ya existentes en la base de datos
- Los demás DNI se consideran nuevos

### Creación de solicitudes
Puedes crear nuevas solicitudes y todos los datos se almacenarán en memoria durante la sesión.

### Edición de solicitudes
Puedes editar las solicitudes existentes y los cambios se reflejarán inmediatamente.

## Diferencias con la versión de producción

- La versión demo utiliza datos en memoria, mientras que la versión de producción se conecta a una API real
- Los datos en la versión demo se pierden al refrescar la página
- Algunas validaciones complejas pueden estar simplificadas

## Notas técnicas

- La versión demo está configurada en `environment.ts` con la opción `useLocalData: true`
- Los servicios locales se encuentran en `src/app/core/services/local-*.ts`
- Los datos de ejemplo se definen en `src/app/core/services/mock-data.ts`
- La inyección de dependencias se configura en `src/app/core/services/local-services.module.ts`
