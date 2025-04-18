// Server.js (Archivo principal que ejecutas con node)

// --- ¡¡CARGAR DOTENV PRIMERO QUE NADA!! ---
require('dotenv').config();
// -----------------------------------------

// Ahora puedes requerir otros módulos que puedan usar process.env
const http = require('http'); // O https si usas SSL
const app = require('./app'); // Requiere tu configuración de Express desde app.js
const sequelize = require('./src/config/database');

// Verifica INMEDIATAMENTE si la variable se cargó
console.log("Verificando JWT_SECRET después de dotenv.config:", process.env.JWT_SECRET ? 'CARGADA' : 'NO CARGADA - ¡Revisa .env y ubicación de dotenv.config!');
if (!process.env.JWT_SECRET) {
    console.error("ERROR CRÍTICO: La variable de entorno JWT_SECRET no se pudo cargar. Asegúrate que .env existe y dotenv.config() se ejecuta primero.");
    process.exit(1); // Detiene la aplicación si falta el secreto
}

const PORT = process.env.PORT || 3000;

// Crea el servidor HTTP usando la app Express configurada
const server = http.createServer(app);

// Sincroniza la base de datos y luego inicia el servidor
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos sincronizada con alter:true.');
    console.log('Base de datos sincronizada.');
    server.listen(PORT, () => { // Usa server.listen en lugar de app.listen si creaste server
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar o iniciar el servidor:', err);
    process.exit(1); // Detiene la aplicación en caso de error crítico de DB/inicio
  });
