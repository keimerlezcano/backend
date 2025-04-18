// src/servicios/specimenService.js

const specimenRepository = require('../repositorios/specimenRepository'); // Verifica que la ruta sea correcta

// Log para verificar la carga inicial del repositorio
console.log('[SpecimenService] Contenido de specimenRepository al cargar:', typeof specimenRepository, specimenRepository ? Object.keys(specimenRepository) : 'No cargado');
if (typeof specimenRepository?.getAllSpecimens !== 'function') {
     console.error('[SpecimenService] ¡ALERTA! La función getAllSpecimens NO está disponible en specimenRepository al cargar.');
}

/**
 * Llama al repositorio para crear un ejemplar.
 * @param {object} specimenData - Datos del nuevo ejemplar.
 * @returns {Promise<Model>} La instancia del ejemplar creado.
 */
const createSpecimen = async (specimenData) => {
    console.log('[SpecimenService] Llamando a specimenRepository.createSpecimen...');
    try {
        // Aquí podrías añadir lógica de negocio antes de crear, si fuera necesario
        const newSpecimen = await specimenRepository.createSpecimen(specimenData);
        return newSpecimen;
    } catch (error) {
        console.error("[SpecimenService] Error al crear ejemplar:", error);
        // Podrías personalizar el mensaje de error aquí
        throw new Error(`Error en el servicio al crear ejemplar: ${error.message}`);
    }
};

/**
 * Llama al repositorio para obtener todos los ejemplares.
 * @returns {Promise<Array<Model>>} Un array con todos los ejemplares.
 */
const getAllSpecimens = async () => {
    console.log('[SpecimenService] Llamando a specimenRepository.getAllSpecimens...');
    try {
        // Llama directamente a la función del repositorio
        const specimens = await specimenRepository.getAllSpecimens();
        console.log(`[SpecimenService] Recibidos ${specimens?.length ?? 0} ejemplares del repositorio.`);
        return specimens;
    } catch (error) {
        console.error("[SpecimenService] Error al obtener todos los ejemplares:", error);
        throw new Error(`Error en el servicio al obtener ejemplares: ${error.message}`);
    }
};

/**
 * Llama al repositorio para obtener un ejemplar por ID.
 * @param {number|string} id - El ID del ejemplar.
 * @returns {Promise<Model|null>} La instancia del ejemplar o null.
 */
const getSpecimenById = async (id) => {
    console.log(`[SpecimenService] Llamando a specimenRepository.getSpecimenById para ID: ${id}`);
    try {
        const specimen = await specimenRepository.getSpecimenById(id);
        if (!specimen) {
            // Podrías manejar el "no encontrado" aquí o dejar que el controlador lo haga
             console.log(`[SpecimenService] Ejemplar con ID ${id} no encontrado por el repositorio.`);
             // throw new Error('Ejemplar no encontrado'); // O lanzar error
        }
        return specimen;
    } catch (error) {
        console.error(`[SpecimenService] Error al obtener ejemplar por ID ${id}:`, error);
        throw new Error(`Error en el servicio al obtener ejemplar por ID: ${error.message}`);
    }
};

/**
 * Llama al repositorio para actualizar un ejemplar.
 * @param {number|string} id - El ID del ejemplar.
 * @param {object} specimenData - Los datos a actualizar.
 * @returns {Promise<Array<number>>} Array con el número de filas afectadas.
 */
const updateSpecimen = async (id, specimenData) => {
    console.log(`[SpecimenService] Llamando a specimenRepository.updateSpecimen para ID: ${id}`);
    try {
        // Podrías añadir validaciones de datos aquí
        const result = await specimenRepository.updateSpecimen(id, specimenData);
        if (result[0] === 0) {
             console.warn(`[SpecimenService] updateSpecimen ID ${id}: Ninguna fila afectada (¿no encontrado o sin cambios?).`);
             // Podrías lanzar un error si se espera que siempre se actualice algo
             // throw new Error('Ejemplar no encontrado para actualizar o datos sin cambios.');
        }
        return result; // Devuelve [affectedRows]
    } catch (error) {
        console.error(`[SpecimenService] Error al actualizar ejemplar ID ${id}:`, error);
        throw new Error(`Error en el servicio al actualizar ejemplar: ${error.message}`);
    }
};

/**
 * Llama al repositorio para eliminar un ejemplar.
 * @param {number|string} id - El ID del ejemplar.
 * @returns {Promise<number>} El número de filas eliminadas.
 */
const deleteSpecimen = async (id) => {
    console.log(`[SpecimenService] Llamando a specimenRepository.deleteSpecimen para ID: ${id}`);
    try {
        const deletedRows = await specimenRepository.deleteSpecimen(id);
        if (deletedRows === 0) {
             console.warn(`[SpecimenService] deleteSpecimen ID ${id}: Ninguna fila eliminada (¿no encontrado?).`);
             // throw new Error('Ejemplar no encontrado para eliminar.');
        }
        return deletedRows; // Devuelve 0 o 1
    } catch (error) {
        console.error(`[SpecimenService] Error al eliminar ejemplar ID ${id}:`, error);
        throw new Error(`Error en el servicio al eliminar ejemplar: ${error.message}`);
    }
};

/**
 * Llama al repositorio para mover un ejemplar (actualizar FKs).
 * @param {number|string} id - El ID del ejemplar.
 * @param {number|null} sedeId - El nuevo ID de la sede.
 * @param {number|null} specimenCategoryId - El nuevo ID de la categoría.
 * @returns {Promise<Array<number>>} Array con el número de filas afectadas.
 */
const moveSpecimen = async (id, sedeId, specimenCategoryId) => {
     // El repositorio specimenRepository ya parsea y prepara los datos en 'moveData'
     // por lo que podemos pasar los argumentos directamente.
     // Sin embargo, la firma de la función en el servicio era diferente. La ajustamos:
     console.log(`[SpecimenService] Llamando a specimenRepository.moveSpecimen para ID: ${id}`);
     const moveData = {};
     if (sedeId !== undefined) moveData.sedeId = sedeId;
     if (specimenCategoryId !== undefined) moveData.specimenCategoryId = specimenCategoryId;

     try {
         // Nota: La función moveSpecimen en el repositorio espera un objeto 'moveData'
         // A diferencia de la firma original de esta función de servicio.
         // Ahora llamamos a la función del repositorio que espera un objeto.
         // Asegúrate que tu specimenRepository.moveSpecimen maneje este objeto { sedeId, specimenCategoryId }
         // (La última versión que te di sí lo hace)
        const result = await specimenRepository.moveSpecimen(id, moveData);
         if (result[0] === 0) {
             console.warn(`[SpecimenService] moveSpecimen ID ${id}: Ninguna fila afectada.`);
             // throw new Error('Ejemplar no encontrado para mover o sin cambios en IDs.');
         }
         return result;
     } catch (error) {
         console.error(`[SpecimenService] Error al mover ejemplar ID ${id}:`, error);
         throw new Error(`Error en el servicio al mover ejemplar: ${error.message}`);
     }
};

module.exports = {
    createSpecimen,
    getAllSpecimens,
    getSpecimenById,
    updateSpecimen,
    deleteSpecimen,
    moveSpecimen
};