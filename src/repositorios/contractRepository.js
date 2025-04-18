// src/repositorios/contractRepository.js
const { Contract, Client, Specimen, Service, Pago, ContractService, sequelize } = require('../modelos/associations'); // Usa tu archivo central
const { Op } = require('sequelize');

console.log('[ContractRepo] Módulo cargado.');

const getContractById = async (id) => {
    const contractId = parseInt(id, 10);
    console.log(`[ContractRepo] getContractById: Buscando ID ${contractId}`);
    if (isNaN(contractId)) throw new Error('ID de contrato inválido.');
    try {
        return await Contract.findByPk(contractId, {
            include: [
                { model: Client, as: 'client', attributes: ['id', 'nombre', 'documento', 'correo', 'celular'] },
                {
                    model: Specimen,
                    // --- Usa el alias correcto de la asociación Contract -> Specimen ---
                    // Si es Contract.hasOne -> as: 'specimen' (probablemente)
                    // Si es Contract.hasMany -> as: 'specimens'
                    as: 'specimens', // <<< ¡¡VERIFICA ESTE ALIAS!! >>>
                    required: false,
                    attributes: ['id', 'name', 'breed', 'color', 'birthDate', 'identifier'], // Atributos de Specimen
                    include: [{ model: Client, as: 'propietario', attributes: ['id', 'nombre'], required: false }]
                },
                { model: Service, as: 'servicios', attributes: ['id', 'name', 'price'], through: { attributes: [] }, required: false },
                { model: Pago, as: 'pagos', attributes: ['id_pago', 'fechaPago', 'valor', 'mesPago'], required: false, limit: 10, order: [['fechaPago', 'DESC']] }
            ],
            // --- Atributos de Contract (sin ejemplarId) ---
            attributes: ['id', 'fechaInicio', /*'fechaFin',*/ 'precioMensual', 'clientId', 'estado', /*'condiciones' quitado*/ 'createdAt', 'updatedAt']
        });
    } catch (error) { console.error(`[ContractRepo] Error getContractById ID ${id}:`, error); throw new Error('Error al obtener contrato por ID'); }
};

const getAllContracts = async () => {
    console.log('[ContractRepo] getAllContracts: Buscando todos...');
    try {
        return await Contract.findAll({
            include: [
                { model: Client, as: 'client', attributes: ['id', 'nombre'] },
                // Opcional: Incluir nombre del primer ejemplar si es relevante en la lista
                 { model: Specimen, as: 'specimens', attributes: ['id', 'name'], limit: 1, required: false }, // <<< VERIFICA ALIAS
                { model: Service, as: 'servicios', attributes: ['id', 'name'], through: { attributes: [] }, required: false },
            ],
            // --- Atributos de Contract (sin ejemplarId) ---
            attributes: ['id', 'fechaInicio', /*'fechaFin',*/ 'precioMensual', 'clientId', 'estado'],
            order: [['fechaInicio', 'DESC'], ['id', 'DESC']]
        });
    } catch (error) { console.error('[ContractRepo] Error en getAllContracts:', error); throw new Error('Error al obtener contratos'); }
};

// --- createContract ---
// QUITAR ejemplarId de contractData, AÑADIR clientId
// La asociación Contract -> Specimen se maneja desde Specimen (Specimen.update({ contractId: newContract.id }))
// O si la FK está en Contract, se pasa en contractData. ¡PERO PARECE QUE ESTÁ EN SPECIMEN!
// NECESITAMOS CLARIFICAR CÓMO SE ASIGNA UN CONTRATO A UN EJEMPLAR AL CREAR.
// Asumiremos por ahora que el ID del ejemplar viene en contractData y lo usamos para actualizar el Specimen.
const createContract = async (contractData, serviceIds = []) => {
    console.log('[ContractRepo] createContract:', { contractData, serviceIds });
    const transaction = await sequelize.transaction();
    try {
        // Separar el ID del ejemplar si viene en contractData
        const { specimenIdToAssociate, ...newContractData } = contractData; // Asume que el ID viene como 'specimenIdToAssociate'

        if (!newContractData.clientId) throw new Error("El ID del cliente es obligatorio para crear el contrato.");
        // Podrías añadir una validación aquí para asegurar que specimenIdToAssociate exista si es mandatorio

        const newContract = await Contract.create(newContractData, { transaction });

        // Asocia los servicios
        if (serviceIds && serviceIds.length > 0) {
            const validServiceIds = serviceIds.filter(id => !isNaN(parseInt(id, 10)));
            if (validServiceIds.length > 0) await newContract.setServicios(validServiceIds, { transaction });
        }

        // ASOCIA EL EJEMPLAR AL CONTRATO CREADO (si se proporcionó el ID)
        if (specimenIdToAssociate && !isNaN(parseInt(specimenIdToAssociate, 10))) {
             console.log(`[ContractRepo] Asociando contrato ${newContract.id} al ejemplar ${specimenIdToAssociate}`);
             const specimen = await Specimen.findByPk(specimenIdToAssociate, { transaction });
             if (!specimen) throw new Error(`Ejemplar con ID ${specimenIdToAssociate} no encontrado para asociar.`);
             // Actualiza la FK en el ejemplar
             await specimen.update({ contractId: newContract.id }, { transaction });
         } else {
             console.warn("[ContractRepo] No se asoció ningún ejemplar al crear el contrato (ID no proporcionado o inválido).");
         }


        await transaction.commit();
        return getContractById(newContract.id); // Devuelve con includes

    } catch (error) {
        await transaction.rollback();
        console.error('[ContractRepo] Error en createContract:', error);
        throw new Error(`Error al crear contrato: ${error.message}`);
    }
};

// --- updateContract ---
// QUITAR ejemplarId de contractData. La asociación no se cambia aquí normalmente.
// Permitir actualizar clientId si es necesario (aunque raro).
const updateContract = async (id, contractData, serviceIds) => {
    const contractId = parseInt(id, 10);
    console.log(`[ContractRepo] updateContract: ID ${contractId}, Datos:`, { contractData, serviceIds });
    if (isNaN(contractId)) throw new Error('ID inválido.');

    const transaction = await sequelize.transaction();
    try {
        const contract = await Contract.findByPk(contractId, { transaction });
        if (!contract) { await transaction.rollback(); return null; }

        // Quita campos que no deberían actualizarse directamente desde aquí
        const { ejemplarId, specimenIdToAssociate, ...dataToUpdate } = contractData;

        await contract.update(dataToUpdate, { transaction });

        if (serviceIds !== undefined) {
             const validServiceIds = Array.isArray(serviceIds) ? serviceIds.filter(id => !isNaN(parseInt(id, 10))) : [];
             await contract.setServicios(validServiceIds, { transaction });
        }

        await transaction.commit();
        return getContractById(contractId);

    } catch (error) {
        await transaction.rollback();
        console.error(`[ContractRepo] Error en updateContract (ID: ${id}):`, error);
        throw new Error(`Error al actualizar contrato: ${error.message}`);
    }
};

// --- deleteContract ---
// Asegura eliminar asociaciones en ContractService antes o confía en CASCADE
const deleteContract = async (id) => {
    const contractId = parseInt(id, 10);
    console.log(`[ContractRepo] deleteContract: ID ${contractId}`);
    if (isNaN(contractId)) throw new Error('ID inválido.');
    const transaction = await sequelize.transaction(); // Usar transacción para borrar dependencias
    try {
        const contract = await Contract.findByPk(contractId, { transaction });
        if (!contract) { await transaction.rollback(); return 0; }

        // 1. Desasociar Servicios (Tabla Intermedia)
        await contract.setServicios([], { transaction });

        // 2. Manejar Pagos (¿Borrar o desasociar?) - Asumimos que NO se borran con el contrato
        // const pagosAsociados = await contract.getPagos({ transaction }); // Usa el alias 'pagos'
        // if (pagosAsociados && pagosAsociados.length > 0) {
        //     // Decide qué hacer: lanzar error, poner contractId=null en pagos, etc.
        //     throw new Error('No se puede eliminar el contrato porque tiene pagos asociados.');
        // }

         // 3. Manejar Ejemplar(es) (¿Poner contractId=null?)
         const specimens = await contract.getSpecimens({ transaction }); // Usa alias 'specimens'
         if (specimens && specimens.length > 0) {
             console.log(`[ContractRepo] Desasociando ${specimens.length} ejemplar(es) del contrato ${contractId}`);
             await Specimen.update({ contractId: null }, { where: { contractId: contractId }, transaction });
         }

        // 4. Borrar el Contrato
        const deletedRows = await Contract.destroy({ where: { id: contractId }, transaction });

        await transaction.commit();
        console.log(`[ContractRepo] deleteContract ID ${contractId}. Filas eliminadas: ${deletedRows}`);
        return deletedRows;
    } catch (error) {
        await transaction.rollback();
        console.error(`[ContractRepo] Error en deleteContract (ID: ${id}):`, error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error('No se puede eliminar porque tiene registros asociados.');
        }
        throw new Error('Error al eliminar el contrato');
    }
};


module.exports = {
    getContractById,
    getAllContracts,
    createContract,
    updateContract,
    deleteContract
};