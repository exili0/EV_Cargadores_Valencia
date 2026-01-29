/* Clase principal que gestiona la lógica de la aplicación.
   Coordina la interacción entre la API, el mapa y la interfaz de usuario. */
import { CargadorRecord, Filtros, Estadisticas } from './types';
import { CargadoresAPI } from './api';
import { MapaInteractivo } from './mapa';

export class App {
    private api: CargadoresAPI;
    private cargadores: CargadorRecord[] = [];
    private cargadoresFiltrados: CargadorRecord[] = [];
    private filtrosActivos: Filtros = {};
    private mapa: MapaInteractivo;
    private vistaActual: 'lista' | 'mapa' = 'lista';

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
        this.api = CargadoresAPI.getInstance();
        this.mapa = new MapaInteractivo();
    }

    /* Inicializa la aplicación cargando datos y configurando eventos. */
    async inicializar(): Promise<void> {
        try {
            this.mostrarCargando(true);
            await this.cargarCargadores();
            this.renderizarCargadores();
            this.configurarEventos();
            this.configurarControlesVista();
            this.mostrarCargando(false);
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.mostrarError('No se pudieron cargar los cargadores. Por favor, intenta de nuevo.');
            this.mostrarCargando(false);
        }
    }

    /* Carga todos los cargadores desde la API y los almacena en memoria. */
    private async cargarCargadores(): Promise<void> {
        this.cargadores = await this.api.obtenerTodosCargadores();
        this.cargadoresFiltrados = [...this.cargadores];
    }

    /* Configura los event listeners para los botones de cambio de vista. */
    private configurarControlesVista(): void {
        const btnLista = document.getElementById('btn-vista-lista');
        const btnMapa = document.getElementById('btn-vista-mapa');

        btnLista?.addEventListener('click', () => {
            this.cambiarVista('lista');
        });

        btnMapa?.addEventListener('click', () => {
            this.cambiarVista('mapa');
        });
    }

    /* Cambia entre la vista de lista y la vista de mapa. */
    private cambiarVista(vista: 'lista' | 'mapa'): void {
        this.vistaActual = vista;

        const seccionLista = document.querySelector('.main-content') as HTMLElement;
        const seccionMapa = document.getElementById('mapa-seccion');
        const btnLista = document.getElementById('btn-vista-lista');
        const btnMapa = document.getElementById('btn-vista-mapa');

        if (vista === 'lista') {
            seccionLista.style.display = 'block';
            if (seccionMapa) seccionMapa.style.display = 'none';
            btnLista?.classList.add('activo');
            btnMapa?.classList.remove('activo');
        } else {
            seccionLista.style.display = 'none';
            if (seccionMapa) seccionMapa.style.display = 'block';
            btnLista?.classList.remove('activo');
            btnMapa?.classList.add('activo');

            // Inicializar el mapa en la primera visualización
            this.mapa.inicializarMapa('mapa');
            this.mapa.agregarCargadores(this.cargadoresFiltrados);

            // Delay para permitir que el contenedor se renderice completamente
            setTimeout(() => this.mapa.redimensionar(), 100);
        }
    }

    /* Configura todos los event listeners para filtros, búsqueda y ordenamiento. */
    private configurarEventos(): void {
        // Event listener para el campo de búsqueda por texto
        const inputBusqueda = document.getElementById('busqueda') as HTMLInputElement;
        inputBusqueda?.addEventListener('input', (e) => {
            this.filtrosActivos.busqueda = (e.target as HTMLInputElement).value;
            this.aplicarFiltros();
        });

        // Event listener para el selector de distrito
        const selectDistrito = document.getElementById('filtro-distrito') as HTMLSelectElement;
        selectDistrito?.addEventListener('change', (e) => {
            const valor = (e.target as HTMLSelectElement).value;
            this.filtrosActivos.distrito = valor ? parseInt(valor) : undefined;
            this.aplicarFiltros();
        });

        // Event listener para el selector de tipo de conector
        const selectConector = document.getElementById('filtro-conector') as HTMLSelectElement;
        selectConector?.addEventListener('change', (e) => {
            const valor = (e.target as HTMLSelectElement).value;
            this.filtrosActivos.conector = valor || undefined;
            this.aplicarFiltros();
        });

        // Event listener para el botón de limpiar filtros
        const btnLimpiar = document.getElementById('limpiar-filtros');
        btnLimpiar?.addEventListener('click', () => {
            this.limpiarFiltros();
        });

        // Event listener para el selector de ordenamiento
        const selectOrden = document.getElementById('ordenar') as HTMLSelectElement;
        selectOrden?.addEventListener('change', (e) => {
            const criterio = (e.target as HTMLSelectElement).value;
            this.ordenarCargadores(criterio);
        });
    }

    /* Aplica los filtros activos al conjunto completo de cargadores.
       Actualiza tanto la vista de lista como el mapa. */
    private aplicarFiltros(): void {
        this.cargadoresFiltrados = this.cargadores.filter(cargador => {
            const { distrito, conector, busqueda } = this.filtrosActivos;

            if (distrito && cargador.fields.distrito !== distrito) {
                return false;
            }

            if (conector && cargador.fields.conector !== conector) {
                return false;
            }

            if (busqueda) {
                const termino = busqueda.toLowerCase().trim(); // Añadir trim()
                if (!termino) return true; // Si está vacío después de trim, no filtrar

                const emplazamiento = cargador.fields.emplazamie.toLowerCase();
                if (!emplazamiento.includes(termino)) {
                    return false;
                }
            }

            return true;
        });

        this.renderizarCargadores();

        // Actualizar el mapa si está siendo visualizado
        if (this.vistaActual === 'mapa') {
            this.mapa.agregarCargadores(this.cargadoresFiltrados);
        }
    }

    /* Restablece todos los filtros a sus valores por defecto.
       Limpia los campos del formulario y muestra todos los cargadores. */
    private limpiarFiltros(): void {
        this.filtrosActivos = {};
        this.cargadoresFiltrados = [...this.cargadores];

        // Resetear valores de los campos del formulario
        (document.getElementById('busqueda') as HTMLInputElement).value = '';
        (document.getElementById('filtro-distrito') as HTMLSelectElement).value = '';
        (document.getElementById('filtro-conector') as HTMLSelectElement).value = '';
        (document.getElementById('ordenar') as HTMLSelectElement).value = '';

        this.renderizarCargadores();

        // Actualizar el mapa si está siendo visualizado
        if (this.vistaActual === 'mapa') {
            this.mapa.agregarCargadores(this.cargadoresFiltrados);
        }
    }

    /* Ordena los cargadores según el criterio especificado. */
    private ordenarCargadores(criterio: string): void {
        switch (criterio) {
            case 'distrito':
                this.cargadoresFiltrados.sort((a, b) => a.fields.distrito - b.fields.distrito);
                break;
            case 'precio':
                // Extraer el valor numérico del precio para realizar la comparación
                this.cargadoresFiltrados.sort((a, b) => {
                    const precioA = parseFloat(a.fields.precio_iv.replace(/[^\d,]/g, '').replace(',', '.'));
                    const precioB = parseFloat(b.fields.precio_iv.replace(/[^\d,]/g, '').replace(',', '.'));
                    return precioA - precioB;
                });
                break;
            case 'tomas':
                // Ordenar por número de tomas en orden descendente
                this.cargadoresFiltrados.sort((a, b) => b.fields.toma - a.fields.toma);
                break;
            default:
                // Orden por defecto: número de identificación
                this.cargadoresFiltrados.sort((a, b) => a.fields.no - b.fields.no);
        }
        this.renderizarCargadores();

        // Actualizar el mapa si está siendo visualizado
        if (this.vistaActual === 'mapa') {
            this.mapa.agregarCargadores(this.cargadoresFiltrados);
        }
    }

    /* Renderiza las tarjetas de cargadores en el DOM.
       Actualiza el contador de resultados y maneja el caso de lista vacía. */
    private renderizarCargadores(): void {
        const contenedor = document.getElementById('cargadores-lista');
        if (!contenedor) return;

        // Actualizar el contador de resultados encontrados
        const contador = document.getElementById('contador-resultados');
        if (contador) {
            contador.textContent = `${this.cargadoresFiltrados.length} cargador${this.cargadoresFiltrados.length !== 1 ? 'es' : ''}`;
        }

        contenedor.innerHTML = '';

        // Mostrar mensaje si no hay resultados
        if (this.cargadoresFiltrados.length === 0) {
            contenedor.innerHTML = `
            <div class="sin-resultados">
                <p>😕 No se encontraron cargadores con los filtros aplicados.</p>
                <button id="reset-filters" class="btn-limpiar">Limpiar filtros</button>
            </div>
        `;
            document.getElementById('reset-filters')?.addEventListener('click', () => {
                this.limpiarFiltros();
            });
            return;
        }

        // Crear y añadir cada tarjeta de cargador
        this.cargadoresFiltrados.forEach(cargador => {
            const card = this.crearTarjetaCargador(cargador);
            contenedor.appendChild(card);
        });
    }

    /* Crea el elemento HTML de una tarjeta de cargador. */
    private crearTarjetaCargador(cargador: CargadorRecord): HTMLElement {
        const card = document.createElement('div');
        card.className = 'cargador-card';

        const nombreDistrito = this.obtenerNombreDistrito(cargador.fields.distrito);

        card.innerHTML = `
      <div class="cargador-header">
        <h3>${cargador.fields.emplazamie}</h3>
        <span class="distrito-badge">${nombreDistrito}</span>
      </div>
      <div class="cargador-info">
        <div class="info-item">
          <span class="label">Tomas:</span>
          <span class="value">${cargador.fields.toma}</span>
        </div>
        <div class="info-item">
          <span class="label">Conector:</span>
          <span class="value">${cargador.fields.conector}</span>
        </div>
        <div class="info-item">
          <span class="label">Tipo de carga:</span>
          <span class="value">${cargador.fields.tipo_carga}</span>
        </div>
        <div class="info-item">
          <span class="label">Potencia:</span>
          <span class="value">${cargador.fields.potenc_ia}</span>
        </div>
        <div class="info-item">
          <span class="label">Precio:</span>
          <span class="value precio">${cargador.fields.precio_iv}</span>
        </div>
      </div>
      <div class="cargador-observaciones">
        <p><strong>Observaciones:</strong> ${cargador.fields.observacio}</p>
      </div>
      <div class="cargador-footer">
        <button class="btn-mapa" data-lat="${cargador.fields.geo_point_2d.lat}" data-lon="${cargador.fields.geo_point_2d.lon}">
          Ver en mapa
        </button>
      </div>
    `;

        // Configurar evento del botón "Ver en mapa"
        const btnMapa = card.querySelector('.btn-mapa') as HTMLButtonElement;
        btnMapa?.addEventListener('click', () => {
            const lat = parseFloat(btnMapa.dataset.lat!);
            const lon = parseFloat(btnMapa.dataset.lon!);

            // Cambiar a vista de mapa y centrar en las coordenadas del cargador
            this.cambiarVista('mapa');
            setTimeout(() => {
                this.mapa.centrarEnMarcador(lat, lon);
            }, 300);
        });

        return card;
    }

    /* Obtiene el nombre del distrito a partir de su número. */
    private obtenerNombreDistrito(numeroDistrito: number): string {
        return this.NOMBRES_DISTRITOS[numeroDistrito] || `Distrito ${numeroDistrito}`;
    }

    /* Muestra u oculta el indicador de carga. */
    private mostrarCargando(mostrar: boolean): void {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = mostrar ? 'flex' : 'none';
        }
    }

    /* Muestra un mensaje de error en el contenedor principal. */
    private mostrarError(mensaje: string): void {
        const contenedor = document.getElementById('cargadores-lista');
        if (contenedor) {
            contenedor.innerHTML = `<p class="error-mensaje">${mensaje}</p>`;
        }
    }

    /* Calcula y retorna estadísticas generales sobre los cargadores. */
    obtenerEstadisticas(): Estadisticas {
        const totalCargadores = this.cargadores.length;
        const totalTomas = this.cargadores.reduce((sum, c) => sum + c.fields.toma, 0);
        const distritos = new Set(this.cargadores.map(c => c.fields.distrito)).size;
        const conectores = new Set(this.cargadores.map(c => c.fields.conector));

        return {
            totalCargadores,
            totalTomas,
            distritos,
            conectores: Array.from(conectores)
        };
    }
}