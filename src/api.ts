/*
Servicio para gestionar las peticiones a la API de cargadores 
Implementa el patrón Singleton para garantizar una única instancia del servicio
*/

import { ApiResponse, CargadorRecord } from './types';

const API_URL = 'https://valencia.opendatasoft.com/api/v2/catalog/datasets/carregadors-vehicles-electrics-cargadores-vehiculos-electricos/records/';

export class CargadoresAPI {
    private static instance: CargadoresAPI;

    private constructor() { }

    // Obtenemos  la instancia única del servicio API
    static getInstance(): CargadoresAPI {
        if (!CargadoresAPI.instance) {
            CargadoresAPI.instance = new CargadoresAPI();
        }
        return CargadoresAPI.instance; //Instancia singleton de CargadoresAPI
    }


    
    /////// Obtenemos todos los cargadores disponibles desde la API
    
    async obtenerTodosCargadores(): Promise<CargadorRecord[]> {
        try {
            const response = await fetch(`${API_URL}?limit=100`); // Limitamos a 100 para evitar sobrecargar la respuesta
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data: ApiResponse = await response.json();
            const registrosValidos = data.records
                .filter(item => this.validarCargador(item.record));
            return registrosValidos.map(item => item.record);
        } catch (error) {
            console.error('Error al obtener cargadores:', error);
            throw error; // Re-lanzar el error para que app.ts lo capture!!!!!!!
        }
    }

    async buscarPorDistrito(distrito: number): Promise<CargadorRecord[]> {
        try {
            const response = await fetch(`${API_URL}?where=distrito=${distrito}&limit=100`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data: ApiResponse = await response.json();
            return data.records.map(item => item.record);
        } catch (error) {
            console.error('Error al buscar por distrito:', error);
            throw error;
        }
    }

    async buscarPorConector(conector: string): Promise<CargadorRecord[]> {
        try {
            const response = await fetch(`${API_URL}?where=conector="${conector}"&limit=100`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data: ApiResponse = await response.json();
            return data.records.map(item => item.record);
        } catch (error) {
            console.error('Error al buscar por conector:', error);
            throw error;
        }
    }

    /* Añadir validación más robusta de los datos de la API */
    private validarCargador(record: any): boolean {
        return record?.fields?.geo_point_2d?.lat !== undefined &&
               record?.fields?.geo_point_2d?.lon !== undefined &&
               record?.fields?.emplazamie !== undefined;
    }
}
