// crearHash.js
const bcrypt = require('bcrypt');
const saltRounds = 10; // O el número de rondas que uses en tu app (10-12 es común)
const miPassword = 'keimer123'; // La contraseña que queremos hashear

console.log(`Generando hash para la contraseña: "${miPassword}"`);

bcrypt.hash(miPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error al generar el hash:', err);
        return;
    }
    console.log('\n¡Hash generado con éxito!');
    console.log('--- COPIA LA SIGUIENTE LÍNEA COMPLETA ---');
    console.log(hash); // <--- Este es el hash que necesitas para el SQL
    console.log('--- FIN DE LA LÍNEA PARA COPIAR ---');
});