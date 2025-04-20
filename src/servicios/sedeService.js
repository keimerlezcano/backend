// src/servicios/sedeService.js
// Asegúrate de que la ruta a associations sea correcta
const { Sede, Specimen } = require('../modelos/associations');
const { sedeExists, sedeExistsById } = require('../repositorios/sedeRepository'); // Usar repositorio para chequeos de existencia

/**
 * Obtiene todas las sedes.
 * @returns {Promise<Array<Sede>>} Lista de sedes.
 */
const listSedes = async () => {
    console.log('[SedeService] Iniciando listSedes...');
    try {
        const sedes = await Sede.findAll({
            order: [['NombreSede', 'ASC']] // Ordenar por nombre
        });
        console.log('[SedeService] Sedes encontradas:', sedes.length);
        return sedes;
    } catch (error) {
        console.error('[SedeService] Error en listSedes:', error);
        throw new Error('Error al obtener la lista de sedes desde el servicio.');
    }
};

/**
 * Añade una nueva sede.
 * @param {object} sedeData - Datos de la sede (ej: { NombreSede: 'Sede Central' }).
 * @returns {Promise<Sede>} La sede creada.
 * @throws {Error} Si ya existe una sede con ese nombre o hay error de DB.
 */
const addSede = async (sedeData) => {
    console.log('[SedeService] Iniciando addSede con datos:', sedeData);
    // Validación de nombre único ya la hace el middleware/modelo, pero podemos re-chequear
    const exists = await sedeExists(sedeData.NombreSede);
    if (exists) {
        throw new Error(`Ya existe una sede con el nombre '${sedeData.NombreSede}'.`);
    }

    try {
        const newSede = await Sede.create(sedeData);
        console.log('[SedeService] Sede creada:', newSede);
        return newSede;
    } catch (error) {
        console.error('[SedeService] Error en addSede:', error);
         if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Error de validación: ${messages}`);
        }
        throw new Error('Error interno al añadir la sede.');
    }
};

/**
 * Encuentra una sede por su ID, incluyendo sus ejemplares asociados.
 * @param {number} id - ID de la sede.
 * @returns {Promise<Sede>} La sede encontrada con sus ejemplares.
 * @throws {Error} Si la sede no se encuentra (con status 404).
 */
const findSede = async (id) => {
    console.log(`[SedeService] Buscando sede por ID: ${id}`);
    try {
        const sede = await Sede.findByPk(id, {
            include: [
                {
                    model: Specimen,
                    as: 'ejemplaresEnSede', // Alias de la asociación Sede.hasMany(Specimen)
                    attributes: ['id', 'name', 'identifier', 'breed', 'color'] // Seleccionar campos específicos de los ejemplares
                    // Podrías añadir más includes aquí si quisieras detalles de la categoría del ejemplar, etc.
                    // include: [{ model: SpecimenCategory, as: 'category', attributes: ['name']}]
                }
            ]
        });

        if (!sede) {
            console.warn(`[SedeService] Sede con ID ${id} no encontrada.`);
            // Lanzar un error específico que el controlador pueda identificar como 404
            const error = new Error('Sede no encontrada');
            error.status = 404; // Añadir status al error
            throw error;
        }

        console.log(`[SedeService] Sede encontrada (ID: ${id}):`, sede.NombreSede, `con ${sede.ejemplaresEnSede?.length || 0} ejemplares.`);
        return sede;
    } catch (error) {
        // Si ya tiene status (como el 404), relanzarlo
        if (error.status) throw error;

        // Si no, loguear y lanzar error genérico
        console.error(`[SedeService] Error en findSede (ID: ${id}):`, error);
        throw new Error('Error al buscar la sede.');
    }
};

/**
 * Modifica una sede existente.
 * @param {number} id - ID de la sede a modificar.
 * @param {object} sedeData - Nuevos datos para la sede.
 * @returns {Promise<Array<number>>} Array con el número de filas afectadas (debería ser [1]).
 * @throws {Error} Si la sede no se encuentra o si el nuevo nombre ya existe en otra sede.
 */
const modifySede = async (id, sedeData) => {
    console.log(`[SedeService] Modificando sede ID: ${id} con datos:`, sedeData);
    // Verificar que la sede a modificar existe
    const sedeExistsCheck = await sedeExistsById(id);
    if (!sedeExistsCheck) {
        throw new Error(`Sede con ID ${id} no encontrada para modificar.`);
    }

    // Verificar si el nuevo nombre ya está en uso por OTRA sede
    if (sedeData.NombreSede) {
        const existingSedeWithSameName = await Sede.findOne({
            where: {
                NombreSede: sedeData.NombreSede,
                id: { [Op.ne]: id } // [Op.ne] = Not Equal (diferente de este ID)
            }
        });
        if (existingSedeWithSameName) {
            throw new Error(`Ya existe OTRA sede con el nombre '${sedeData.NombreSede}'.`);
        }
    }

    try {
        const [affectedRows] = await Sede.update(sedeData, {
            where: { id: id }
        });

        // affectedRows será 1 si se actualizó, 0 si no se encontró (aunque ya chequeamos) o los datos eran iguales
        if (affectedRows === 0) {
             // Podría pasar si los datos enviados son idénticos a los existentes
             console.warn(`[SedeService] modifySede para ID ${id} no afectó filas (¿datos iguales o no encontrada?).`);
             // Lanzar error si se esperaba un cambio efectivo
             // throw new Error('No se pudo actualizar la sede o los datos eran idénticos.');
        }

        console.log(`[SedeService] Sede ID ${id} modificada, filas afectadas: ${affectedRows}`);
        return [affectedRows]; // Sequelize devuelve un array con las filas afectadas
    } catch (error) {
        console.error(`[SedeService] Error en modifySede (ID: ${id}):`, error);
         if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Error de validación: ${messages}`);
        }
        throw new Error('Error interno al modificar la sede.');
    }
};

/**
 * Elimina una sede por su ID.
 * @param {number} id - ID de la sede a eliminar.
 * @returns {Promise<number>} El número de filas eliminadas (debería ser 1).
 * @throws {Error} Si la sede no se encuentra o si tiene ejemplares asociados (debido a la FK).
 */
const removeSede = async (id) => {
    console.log(`[SedeService] Intentando eliminar sede ID: ${id}`);
    // Verificar existencia (middleware ya lo hace)
    const sedeExistsCheck = await sedeExistsById(id);
    if (!sedeExistsCheck) {
        // Lanzar error 404
        const error = new Error(`Sede con ID ${id} no encontrada para eliminar.`);
        error.status = 404;
        throw error;
    }

    // Opcional: Verificar si tiene ejemplares antes de intentar borrar
    // const ejemplaresCount = await Specimen.count({ where: { sedeId: id } });
    // if (ejemplaresCount > 0) {
    //     throw new Error(`No se puede eliminar la sede ID ${id} porque tiene ${ejemplaresCount} ejemplares asociados.`);
    // }

    try {
        const deletedRows = await Sede.destroy({
            where: { id: id }
        });

        // deletedRows será 1 si se eliminó, 0 si no se encontró (aunque ya chequeamos)
        if (deletedRows === 0) {
             console.warn(`[SedeService] removeSede para ID ${id} no eliminó filas (¿no encontrada?).`);
             // Podríamos lanzar el 404 aquí también por si acaso
             const error = new Error(`Sede con ID ${id} no encontrada para eliminar.`);
             error.status = 404;
             throw error;
        }

        console.log(`[SedeService] Sede ID ${id} eliminada exitosamente.`);
        return deletedRows;
    } catch (error) {
        console.error(`[SedeService] Error en removeSede (ID: ${id}):`, error);
        // Capturar error de Foreign Key si intentas borrar una sede con ejemplares
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             throw new Error(`No se puede eliminar la sede porque tiene ejemplares asociados. Mueva o elimine los ejemplares primero.`);
        }
        // Si es el error 404 que lanzamos antes, relanzarlo
        if (error.status === 404) throw error;
        // Otro error
        throw new Error('Error interno al eliminar la sede.');
    }
};


module.exports = {
    listSedes,
    addSede,
    findSede, // Usado por getSedeById
    modifySede,
    removeSede
};