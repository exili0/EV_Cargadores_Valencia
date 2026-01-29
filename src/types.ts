/* Definición de tipos e interfaces para la aplicación de cargadores de vehículos eléctricos
   Estos tipos se corresponden con la estructura de datos proporcionada por la API de Open Data Valencia. */

/* Representa las coordenadas geográficas de un punto (longitud y latitud) !!!!!!!!!!!!*/
export interface GeoPoint {
    lon: number;
    lat: number;
}

/* Representa la forma geográfica completa con su geometría y propiedades
   Utiliza el formato GeoJSON estándar */
export interface GeoShape {
    type: string;
    geometry: {
        coordinates: [number, number];
        type: string;
    };
    properties: Record<string, unknown>;
}

/* Contiene todos los campos de información de un cargador individual e incluye 
   ubicación, características técnicas y datos de precio */
export interface CargadorFields {
    objectid: number;
    no: number;
    distrito: number;
    emplazamie: string;
    toma: number;
    precio_iv: string;
    potenc_ia: string;
    observacio: string;
    conector: string;
    tipo_carga: string;
    geo_shape: GeoShape;
    geo_point_2d: GeoPoint;
}
/* Representa un registro completo de cargador tal como lo devuelve la API, 
   incluye metadatos como ID, timestamp y tamaño además de los campos de datos */
export interface CargadorRecord {
    id: string;
    timestamp: string;
    size: number;
    fields: CargadorFields;
}

/* Estructura de la respuesta completa de la API
   Contiene el total de registros y un aray de cargadore */
export interface ApiResponse {
    total_count: number;
    records: {
        record: CargadorRecord;
    }[];
}

/* Define los filtros disponibles para la búsqueda de cargadores
   Todos los campos son opcionales para permitir combinaciones flexibles */
export interface Filtros {
    distrito?: number;
    conector?: string;
    busqueda?: string;
}

/* Estructura de las estadísticas generales d la aplicación*/
export interface Estadisticas {
    totalCargadores: number;
    totalTomas: number;
    distritos: number;
    conectores: string[];
}
