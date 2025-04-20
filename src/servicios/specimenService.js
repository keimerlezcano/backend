// src/servicios/specimenService.js
const { Op } = require('sequelize');
// Asegúrate de que la ruta a associations sea correcta
const { Specimen, Sede, SpecimenCategory, Client, Contract } = require('../modelos/associations');

/**
 * Crea un nuevo ejemplar.
 * @param {object} specimenData - Datos del ejemplar (incluyendo name, specimenCategoryId, sedeId, etc.).
 * @returns {Promise<Specimen>} El ejemplar creado.
 * @throws {Error} Si la sede no existe o si hay un error de base de datos.
 */
const createSpecimen = async (specimenData) => {
    const { sedeId, specimenCategoryId, clientId, contractId, ...restData } = specimenData;

    // --- Validación de Existencia de Claves Foráneas ---
    // Aunque el middleware ya valida, una verificación extra aquí es buena práctica.
    if (!sedeId) {
        throw new Error('El ID de la sede es obligatorio para crear un ejemplar.');
    }
    const sedeExists = await Sede.findByPk(sedeId);
    if (!sedeExists) {
        throw new Error(`La sede con ID ${sedeId} no existe.`);
    }

    if (!specimenCategoryId) {
        throw new Error('El ID de la categoría es obligatorio.');
    }
    const categoryExists = await SpecimenCategory.findByPk(specimenCategoryId);
    if (!categoryExists) {
        throw new Error(`La categoría con ID ${specimenCategoryId} no existe.`);
    }

    if (clientId) {
        const clientExists = await Client.findByPk(clientId);
        if (!clientExists) {
            throw new Error(`El cliente con ID ${clientId} no existe.`);
        }
    }
     if (contractId) {
        const contractExists = await Contract.findByPk(contractId);
        if (!contractExists) {
            throw new Error(`El contrato con ID ${contractId} no existe.`);
        }
    }
    // -----------------------------------------------------

    try {
        // Crear el ejemplar con todos los datos validados
        const newSpecimen = await Specimen.create({
            sedeId,
            specimenCategoryId,
            clientId: clientId || null, // Asegura null si no se proporciona
            contractId: contractId || null, // Asegura null si no se proporciona
            ...restData
        });
        // Opcional: Recargar el ejemplar creado con sus relaciones para devolverlo completo
        return getSpecimenById(newSpecimen.id);
    } catch (error) {
        // Capturar errores de validación de Sequelize u otros errores de DB
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Error de validación: ${messages}`);
        }
        // Capturar error de identificador único si la DB lo detecta (aunque ya validamos)
        if (error.name === 'SequelizeUniqueConstraintError') {
             throw new Error('Error: El identificador único (UUID) ya está en uso.');
        }
        console.error("Error en specimenService.createSpecimen:", error);
        throw new Error('Error interno al crear el ejemplar.'); // Error genérico
    }
};

/**
 * Obtiene todos los ejemplares, incluyendo información básica de su sede y categoría.
 * @returns {Promise<Array<Specimen>>} Lista de ejemplares.
 */
const getAllSpecimens = async () => {
    try {
        const specimens = await Specimen.findAll({
            include: [
                {
                    model: Sede,
                    as: 'sede', // Alias de la asociación Specimen.belongsTo(Sede)
                    attributes: ['id', 'NombreSede'] // Solo traer campos necesarios
                },
                {
                    model: SpecimenCategory,
                    as: 'category', // Alias de Specimen.belongsTo(SpecimenCategory)
                    attributes: ['id', 'name'] // Asumiendo que la categoría tiene 'name'
                },
{
    model: Client,
    as: 'propietario', // Alias de Specimen.belongsTo(Client)
    attributes: ['id', 'nombre'] // Cambiado 'name' a 'nombre' para coincidir con el modelo Client
},
                 {
                    model: Contract,
                    as: 'contract', // Alias de Specimen.belongsTo(Contract)
                    attributes: ['id', 'contractNumber'] // Asumiendo que el contrato tiene 'contractNumber'
                }
            ],
            order: [
                ['name', 'ASC'] // Ordenar alfabéticamente por nombre, por ejemplo
            ]
        });
        return specimens;
    } catch (error) {
        console.error("Error en specimenService.getAllSpecimens:", error);
        throw new Error('Error al obtener la lista de ejemplares.');
    }
};

/**
 * Obtiene un ejemplar por su ID, incluyendo detalles de sede, categoría, cliente y contrato.
 * @param {number} id - ID del ejemplar.
 * @returns {Promise<Specimen>} El ejemplar encontrado.
 * @throws {Error} Si el ejemplar no se encuentra.
 */
const getSpecimenById = async (id) => {
    try {
        const specimen = await Specimen.findByPk(id, {
            include: [
                { model: Sede, as: 'sede' },
                { model: SpecimenCategory, as: 'category' },
                { model: Client, as: 'propietario' },
                { model: Contract, as: 'contract' }
            ]
        });

        if (!specimen) {
            // Lanzar un error específico para que el controlador devuelva 404
            const error = new Error('Ejemplar no encontrado');
            error.status = 404;
            throw error;
        }
        return specimen;
    } catch (error) {
         // Si ya tiene status (como el 404), relanzarlo
        if (error.status) throw error;
        // Si no, loguear y lanzar error genérico
        console.error(`Error en specimenService.getSpecimenById (ID: ${id}):`, error);
        throw new Error('Error al obtener el ejemplar.');
    }
};

/**
 * Actualiza un ejemplar existente.
 * @param {number} id - ID del ejemplar a actualizar.
 * @param {object} updateData - Datos a actualizar.
 * @returns {Promise<Specimen>} El ejemplar actualizado.
 * @throws {Error} Si el ejemplar no se encuentra o hay un error de validación/DB.
 */
const updateSpecimen = async (id, updateData) => {
    // Buscar primero para asegurar que existe (aunque el middleware ya valida)
    const specimen = await getSpecimenById(id); // Reutiliza la función getById

    // Validar existencia de claves foráneas si se están actualizando
    if (updateData.sedeId) {
         const sedeExists = await Sede.findByPk(updateData.sedeId);
         if (!sedeExists) throw new Error(`La sede con ID ${updateData.sedeId} no existe.`);
    }
     if (updateData.specimenCategoryId) {
         const categoryExists = await SpecimenCategory.findByPk(updateData.specimenCategoryId);
         if (!categoryExists) throw new Error(`La categoría con ID ${updateData.specimenCategoryId} no existe.`);
     }
    if (updateData.clientId) {
         const clientExists = await Client.findByPk(updateData.clientId);
         if (!clientExists) throw new Error(`El cliente con ID ${updateData.clientId} no existe.`);
     }
      if (updateData.contractId) {
         const contractExists = await Contract.findByPk(updateData.contractId);
         if (!contractExists) throw new Error(`El contrato con ID ${updateData.contractId} no existe.`);
     }

    try {
        // Actualizar el ejemplar encontrado
        await specimen.update(updateData);
        // Recargar con las asociaciones actualizadas
        return getSpecimenById(id);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Error de validación: ${messages}`);
        }
         if (error.name === 'SequelizeUniqueConstraintError') {
             throw new Error('Error: El identificador único (UUID) ya está en uso por otro ejemplar.');
        }
        console.error(`Error en specimenService.updateSpecimen (ID: ${id}):`, error);
        throw new Error('Error interno al actualizar el ejemplar.');
    }
};

/**
 * Elimina un ejemplar por su ID.
 * @param {number} id - ID del ejemplar a eliminar.
 * @returns {Promise<number>} El número de filas eliminadas (debería ser 1).
 * @throws {Error} Si el ejemplar no se encuentra.
 */
const deleteSpecimen = async (id) => {
    // Verificar existencia primero (middleware ya lo hace, pero es seguro aquí también)
    await getSpecimenById(id);

    try {
        const deletedRows = await Specimen.destroy({
            where: { id: id }
        });
        // deletedRows será 1 si se eliminó correctamente
        return deletedRows;
    } catch (error) {
        console.error(`Error en specimenService.deleteSpecimen (ID: ${id}):`, error);
        // Podría haber errores si hay restricciones de clave foránea que impiden borrar
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             throw new Error('No se puede eliminar el ejemplar porque tiene registros asociados (medicinas, vacunaciones, etc.).');
        }
        throw new Error('Error interno al eliminar el ejemplar.');
    }
};

/**
 * Mueve un ejemplar a una nueva sede y/o categoría.
 * @param {number} id - ID del ejemplar a mover.
 * @param {number} [newSedeId] - Nuevo ID de sede (opcional).
 * @param {number} [newCategoryId] - Nuevo ID de categoría (opcional).
 * @returns {Promise<Specimen>} El ejemplar actualizado.
 * @throws {Error} Si el ejemplar, la nueva sede o la nueva categoría no existen, o si ya está en la ubicación de destino.
 */
const moveSpecimen = async (id, newSedeId, newCategoryId) => {
    // Middleware ya valida existencia y que no sea el mismo destino
    const specimen = await getSpecimenById(id); // Obtener el ejemplar

    const updatePayload = {};
    if (newSedeId !== undefined && newSedeId !== null) {
        updatePayload.sedeId = newSedeId;
    }
    if (newCategoryId !== undefined && newCategoryId !== null) {
        updatePayload.specimenCategoryId = newCategoryId;
    }

    if (Object.keys(updatePayload).length === 0) {
        throw new Error('No se especificó una nueva sede o categoría para mover.');
    }

    try {
        await specimen.update(updatePayload);
        return getSpecimenById(id); // Devolver el ejemplar actualizado
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Error de validación al mover: ${messages}`);
        }
        console.error(`Error en specimenService.moveSpecimen (ID: ${id}):`, error);
        throw new Error('Error interno al mover el ejemplar.');
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