import './style.css'
import { App } from './app'


document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.inicializar(); // Espera que la app se inicialice
    
    const stats = app.obtenerEstadisticas();
    console.log('Estadísticas:', stats);
});
