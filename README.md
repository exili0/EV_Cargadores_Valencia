# Cargadores de Vehículos Eléctricos - Valencia

Aplicación web desarrollada con TypeScript y Vite para consultar los cargadores de vehículos eléctricos disponibles en Valencia utilizando datos abiertos.

## Características

- Consumo de la API de Open Data Valencia
- Búsqueda por ubicación/emplazamiento
- Filtrado por distrito
- Filtrado por tipo de conector
- Ordenamiento por diferentes criterios (distrito, precio, tomas)
- Vista interactiva de mapa con Leaflet
- Marcadores personalizados con estado de disponibilidad simulado
- Enlace directo a Google Maps para cada cargador
- Diseño responsive y accesible
- Interfaz rápida y moderna

## Tecnologías

- **TypeScript** - Lenguaje tipado para mayor robustez
- **Vite** - Build tool y servidor de desarrollo de alto rendimiento
- **Leaflet** - Biblioteca de mapas interactivos
- **CSS3** - Estilos modernos con variables CSS y Flexbox/Grid
- **Fetch API** - Consumo de datos asíncrono

## Estructura del Proyecto

```
src/
├── types.ts       # Interfaces y tipos TypeScript
├── api.ts         # Servicio para consumir la API externa
├── mapa.ts        # Componente de mapa interactivo con Leaflet
├── app.ts         # Lógica principal de la aplicación
├── main.ts        # Punto de entrada de la aplicación
└── style.css      # Estilos CSS globales
```

## Instalación y Uso

### Requisitos previos
- Node.js (versión 18 o superior)
- npm o yarn

### Instalar dependencias
```bash
npm install
```

**Nota**: Font Awesome ya está incluido en las dependencias, se instalará automáticamente.

### Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Compilar para producción
```bash
npm run build
```
Los archivos compilados se generarán en la carpeta `dist/`

### Vista previa de la build de producción
```bash
npm run preview
```

## API Utilizada

La aplicación consume datos de la API de Open Data Valencia:
```
https://valencia.opendatasoft.com/api/v2/catalog/datasets/carregadors-vehicles-electrics-cargadores-vehiculos-electricos/records/
```

## Funcionalidades Principales

### Filtros
- **Búsqueda por texto**: Permite buscar cargadores por nombre de emplazamiento
- **Filtro por distrito**: Filtra cargadores por el distrito de Valencia (1-15)
- **Filtro por conector**: Filtra por tipo de conector (TIPO 2, SCHUKO)
- **Ordenamiento**: Ordena por distrito, precio o número de tomas

### Vistas
- **Vista de Lista**: Muestra los cargadores en formato de tarjetas con toda la información
- **Vista de Mapa**: Visualización interactiva en mapa con marcadores personalizados

### Mapa Interactivo
- Marcadores con colores según disponibilidad (simulada)
- Popups informativos con detalles de cada cargador
- Zoom automático para mostrar todos los resultados
- Integración con Google Maps

## Arquitectura del Código

### Patrón Singleton
El servicio de API utiliza el patrón Singleton para garantizar una única instancia y optimizar las peticiones.

### Separación de Responsabilidades
- `api.ts`: Maneja toda la comunicación con la API externa
- `mapa.ts`: Gestiona la lógica del mapa y los marcadores
- `app.ts`: Coordina la lógica de negocio y la interacción usuario-sistema
- `types.ts`: Define las interfaces para type-safety

## Mejoras Futuras

- Integración con API de disponibilidad en tiempo real
- Persistencia de filtros en localStorage
- Modo oscuro/claro
- Exportación de resultados a PDF/CSV
- Comparador de cargadores
- Rutas optimizadas entre cargadores

## Autor

Desarrollado por Nicolás Cortez Gómez

## Licencia

Este proyecto está desarrollado con fines educativos.
