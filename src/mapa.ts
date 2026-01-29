/* Clase que gestiona la visualización interactiva del mapa con los cargadores.
   Utiliza Leaflet para renderizar el mapa y los marcadores personalizados. */
import { CargadorRecord } from './types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export class MapaInteractivo {
    private mapa: L.Map | null = null;
    private marcadores: L.Marker[] = [];
    private grupoMarcadores: L.LayerGroup;

    private iconoLibre: L.DivIcon;
    private iconoOcupado: L.DivIcon;

    private readonly NOMBRES_DISTRITOS: { [key: number]: string } = {
        1: 'Ciutat Vella',
        2: "L'Eixample (Ensanche)",
        3: 'Extramurs',
        4: 'Campanar',
        5: 'La Saïdia (Zaidía)',
        6: 'El Pla del Real',
        7: "L'Olivereta",
        8: 'Patraix',
        9: 'Jesús',
        10: 'Quatre Carreres',
        11: 'Poblats Marítims',
        12: 'Camins al Grau',
        13: 'Algirós',
        14: 'Benimaclet',
        15: 'Rascanya'
    };

    constructor() {
        this.grupoMarcadores = L.layerGroup();

        // Crear iconos personalizados usando Font Awesome
        this.iconoLibre = L.divIcon({
            html: '<i class="fas fa-charging-station" style="color: #10b981; font-size: 32px;"></i>',
            className: 'custom-marker-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        this.iconoOcupado = L.divIcon({
            html: '<i class="fas fa-charging-station" style="color: #ef4444; font-size: 32px;"></i>',
            className: 'custom-marker-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    }

    // Inicializa el mapa centrado en Valencia con la configuración base.
    inicializarMapa(contenedorId: string): void {
        // Evitar inicializar múltiples veces
        if (this.mapa) {
            return;
        }

        const centroValencia: [number, number] = [39.4700, -0.3700];

        this.mapa = L.map(contenedorId, {
            center: centroValencia,
            zoom: 13,
            zoomControl: true
        });

        /* Añadir capa base de OpenStreetMap (api)
           Super importante, ya que de no incluirlo no se veria el mapa */

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.mapa);

        this.grupoMarcadores.addTo(this.mapa);

        const container = document.getElementById(contenedorId); // Acceder al contenedor del mapa
        if (container) {
            container.setAttribute('role', 'application');
            container.setAttribute('aria-label', 'Mapa interactivo de cargadores');
        }
    }

    /* Añade marcadores al mapa para cada cargador del array proporcionado.
       Limpia los marcadores existentes antes de añadir los nuevos. */
    agregarCargadores(cargadores: CargadorRecord[]): void {
        this.limpiarMarcadores();

        cargadores.forEach(cargador => {
            const { lat, lon } = cargador.fields.geo_point_2d;

            // Determinar el estado de disponibilidad para mostrar el icono apropiado
            const estaLibre = this.simularDisponibilidad(cargador);
            const icono = estaLibre ? this.iconoLibre : this.iconoOcupado;

            const marcador = L.marker([lat, lon], { icon: icono });

            const popupContent = this.crearPopupContent(cargador, estaLibre);
            marcador.bindPopup(popupContent);

            marcador.addTo(this.grupoMarcadores);
            this.marcadores.push(marcador);
        });

    }

    private obtenerNombreDistrito(numeroDistrito: number): string {
        return this.NOMBRES_DISTRITOS[numeroDistrito] || `Distrito ${numeroDistrito}`;
    }

    // Genera el HTML para el contenido del popup de un marcador.
    private crearPopupContent(cargador: CargadorRecord, estaLibre: boolean): string {
        const estadoClass = estaLibre ? 'disponible' : 'ocupado';
        const estadoTexto = estaLibre ? 'Disponible' : 'Ocupado';
        const nombreDistrito = this.obtenerNombreDistrito(cargador.fields.distrito);

        return `
            <div class="popup-cargador">
                <h3>${cargador.fields.emplazamie}</h3>
                <div class="popup-estado ${estadoClass}">
                    ${estadoTexto}
                </div>
                <div class="popup-info">
                    <p><strong>Distrito:</strong> ${nombreDistrito}</p>
                    <p><strong>Tomas:</strong> ${cargador.fields.toma}</p>
                    <p><strong>Conector:</strong> ${cargador.fields.conector}</p>
                    <p><strong>Tipo:</strong> ${cargador.fields.tipo_carga}</p>
                    <p><strong>Potencia:</strong> ${cargador.fields.potenc_ia}</p>
                    <p><strong>Precio:</strong> <span class="precio">${cargador.fields.precio_iv}</span></p>
                </div>
                <a href="https://www.google.com/maps?q=${cargador.fields.geo_point_2d.lat},${cargador.fields.geo_point_2d.lon}" 
                   target="_blank" 
                   class="popup-link">
                    Ver en Google Maps
                </a>
            </div>
        `;
    }

    /* Simula la disponibilidad de un cargador basándose en su ID
       Genera un valor aleatorio consistente para cada cargador.
       En un entorno de producción, esto se obtendría de una API de disponibilidad en tiempo real. */

    private simularDisponibilidad(cargador: CargadorRecord): boolean {
        // Simulamos si un cargador está disponible o ocupado, 
        // siempre de forma predecible, basándonos en su ID.

        const codigo = cargador.id;
        let suma = 0;

        // Convertimos cada letra del ID en su código y sumamos.
        for (const letra of codigo) {
            suma += letra.charCodeAt(0);
        }
        const numeroSimulado = (suma % 100) / 100;

        // Queremos que haya un 60% de probabilidad de estar disponible.
        const estaDisponible = numeroSimulado < 0.6;

        return estaDisponible;
    }


    // Centra el mapa en un marcador específico y abre su popup.
    centrarEnMarcador(lat: number, lon: number): void {
        if (!this.mapa) return;

        // Centramos el mapa en la ubicación indicada con un nivel de zoom agradable.
        this.mapa.setView([lat, lon], 17);

        // Buscamos el marcador más cercano a esa posición
        // y mostramos su popup para dar más contexto al usuario.
        this.marcadores.forEach(marcador => {
            const posicion = marcador.getLatLng();
            const estaCerca =
                Math.abs(posicion.lat - lat) < 0.0001 &&
                Math.abs(posicion.lng - lon) < 0.0001;

            if (estaCerca) {
                marcador.openPopup();
            }
        });
    }


    // Elimina todos los marcadores del mapa.
    private limpiarMarcadores(): void {
        this.grupoMarcadores.clearLayers();
        this.marcadores = [];
    }

    /* Fuerza la actualización del tamaño del mapa.
       Útil cuando el contenedor cambia de dimensiones. */
    redimensionar(): void {
        if (this.mapa) {
            this.mapa.invalidateSize();
        }
    }

    // Destruye la instancia del mapa y limpia todos los recursos.
    destruir(): void {
        if (this.mapa) {
            this.mapa.remove();
            this.mapa = null;
        }
        this.marcadores = [];
    }
}