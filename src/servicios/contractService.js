// src/servicios/contractService.js

// Asegúrate que la ruta a tu archivo central de asociaciones sea correcta
const { Contract, Client, Specimen, Service, ContractService, sequelize } = require('../modelos/associations');

/**
 * Obtiene todos los contratos con información básica de cliente, especímenes y servicios.
 */
const getAllContracts = async () => {
    console.log('[ContractSvc] Obteniendo todos los contratos con datos relacionados...');
    try {
        if (!Contract || !Client || !Specimen || !Service || !sequelize) {
            console.error("[ContractSvc] Error: Modelos esenciales o Sequelize no importados/cargados.");
            throw new Error("Dependencias del servicio no cargadas correctamente.");
        }

        const contracts = await Contract.findAll({
            include: [
                {
                    model: Client,
                    as: 'client',
                    // --- CORRECTO: Solo pedir ID y nombre del cliente ---
                    attributes: ['id', 'nombre', 'documento', 'correo', 'celular'],
                    required: false
                },
                {
                    model: Specimen,
                    as: 'contractSpecimens',
                     // --- CORRECTO: Solo pedir ID y name del ejemplar ---
                     // --- (Asegúrate que el modelo Specimen usa 'name') ---
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Service,
                    as: 'servicios',
                    // --- CORRECTO: Solo pedir ID y nombre del servicio ---
                    // --- (Asegúrate que el modelo Service usa 'nombre') ---
                    attributes: ['id', 'nombre'], // <--- Campo 'nombre'
                    through: { attributes: [] },
                    required: false
                }
            ],
            order: [['id', 'DESC']]
        });
        console.log(`[ContractSvc] Consulta findAll exitosa, encontrados ${contracts.length} contratos.`);
        return contracts;
    } catch (error) {
        console.error('[ContractSvc] Error detallado en findAll:', error.message, error.stack, error.original ? JSON.stringify(error.original) : '');
        throw new Error(`Error al consultar la base de datos para obtener contratos: ${error.message}`);
    }
};

/**
 * Obtiene un contrato específico por ID con sus relaciones.
 */
const getContractById = async (id) => {
    console.log(`[ContractSvc] Obteniendo contrato ID: ${id}`);
    const contractId = parseInt(id, 10);
    if (isNaN(contractId)) {
        throw new Error('ID de contrato inválido.');
    }
    try {
        if (!Contract || !Client || !Specimen || !Service) {
            throw new Error("Modelos esenciales no cargados.");
        }
        const contract = await Contract.findByPk(contractId, {
             include: [
                {
                    model: Client,
                    as: 'client',
                    // --- CORRECTO: Solo pedir ID y nombre del cliente ---
                    attributes: ['id', 'nombre', 'documento', 'correo', 'celular'],
                    required: false
                },
                {
                    model: Specimen,
                    as: 'contractSpecimens',
                     // --- CORRECTO: Solo pedir ID y name del ejemplar ---
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Service,
                    as: 'servicios',
                    // --- CORRECTO: Solo pedir ID y nombre del servicio ---
                    attributes: ['id', 'nombre'], // <--- Campo 'nombre'
                    through: { attributes: [] },
                    required: false
                }
            ]
        });
        if (!contract) {
            const error = new Error('Contrato no encontrado.');
            error.statusCode = 404;
            throw error;
        }
        console.log(`[ContractSvc] Contrato ID ${contractId} encontrado.`);
        return contract;
    } catch (error) {
         console.error(`[ContractSvc] Error detallado en findByPk para ID ${contractId}:`, error.message, error.stack, error.original ? JSON.stringify(error.original) : '');
         if (error.statusCode === 404 || error.message === 'ID de contrato inválido.') throw error;
         throw new Error(`Error al consultar la base de datos para obtener el contrato: ${error.message}`);
    }
};


// --- createContract, updateContract, deleteContract (sin cambios relevantes aquí para estos puntos) ---
// Asegúrate de que createContract usa 'specimenIdToAssociate' (o como lo llames)
// y que updateContract/deleteContract usan los alias correctos ('servicios', 'contractSpecimens')

const createContract = async (contractData) => { // Recibe el objeto completo
    console.log('[ContractSvc] Iniciando creación. Datos recibidos:', contractData);
    if (!sequelize) throw new Error("Sequelize no encontrado.");

    const transaction = await sequelize.transaction();
    try {
        if (!Contract || !Service || !Client || !Specimen) throw new Error("Modelos no cargados.");

        // *** CORRECCIÓN CLAVE: Extraer serviceIds del objeto contractData ***
        const { clientId, specimenIdToAssociate, serviceIds = [], ...newContractData } = contractData; // <-- Asegúrate que serviceIds se extrae aquí

        // 1. Validar Cliente
        if (!clientId) throw new Error("clientId es obligatorio.");
        const clientExists = await Client.findByPk(clientId, { transaction, attributes: ['id'] });
        if (!clientExists) throw new Error(`Cliente ID ${clientId} no encontrado.`);

        // 2. Crear Contrato
        // Pasamos clientId explícitamente junto con el resto de datos del contrato
        const newContract = await Contract.create({ ...newContractData, clientId }, { transaction });
        const newContractId = newContract.id;
        console.log(`[ContractSvc] Contrato base creado ID: ${newContractId}`);

        // *** 3. Asociar Servicios ***
        // Convierte los IDs recibidos (que podrían ser strings) a números
        const numericServiceIds = (Array.isArray(serviceIds) ? serviceIds : [])
                                  .map(id => parseInt(id, 10)).filter(id => !isNaN(id));

        if (numericServiceIds.length > 0) { // Solo si hay IDs de servicio válidos
            console.log(`[ContractSvc] Asociando servicios IDs: ${numericServiceIds.join(', ')}`);
            // Verifica que los servicios existan
            const services = await Service.findAll({ where: { id: numericServiceIds }, transaction, attributes: ['id'] });
            if (services.length !== numericServiceIds.length) {
                const foundIds = services.map(s => s.id);
                const missingIds = numericServiceIds.filter(id => !foundIds.includes(id));
                throw new Error(`IDs de servicio inválidos o no encontrados: ${missingIds.join(', ')}.`);
            }
            // *** USA el método add<Alias> para asociar (addServicios) ***
            await newContract.addServicios(numericServiceIds, { transaction }); // <--- ¡ESTA LÍNEA ES CRUCIAL!
            console.log(`[ContractSvc] Servicios asociados.`);
        } else {
            console.log(`[ContractSvc] No se proporcionaron IDs de servicio para asociar.`);
        }

        // 4. Asociar Ejemplar (si se proporcionó)
        const numericSpecimenId = parseInt(specimenIdToAssociate, 10);
        if (!isNaN(numericSpecimenId)) {
            console.log(`[ContractSvc] Asociando ejemplar ID: ${numericSpecimenId}`);
            const specimen = await Specimen.findByPk(numericSpecimenId, { transaction });
            if (!specimen) throw new Error(`Ejemplar ID ${numericSpecimenId} no encontrado.`);
            await specimen.update({ contractId: newContractId }, { transaction });
            console.log(`[ContractSvc] Ejemplar asociado.`);
        } else {
            console.log("[ContractSvc] No se asoció ejemplar (ID no provisto/inválido).");
        }

        await transaction.commit();
        console.log(`[ContractSvc] Contrato ${newContractId} creado exitosamente.`);
        return getContractById(newContractId); // Devolver con relaciones

    } catch (error) {
        await transaction.rollback();
        console.error('[ContractSvc] Error durante la creación:', error);
        // ... (manejo de errores específicos) ...
        throw new Error(`Error al crear el contrato: ${error.message}`);
    }
};

const updateContract = async (id, contractData, serviceIds) => { // serviceIds viene del controlador
     const contractId = parseInt(id, 10);
     console.log(`[ContractSvc] Iniciando actualización contrato ID: ${contractId}`);
     if (isNaN(contractId)) throw new Error("ID de contrato inválido.");
     if (!sequelize) throw new Error("Instancia de Sequelize no encontrada.");

     const transaction = await sequelize.transaction();
     try {
         if (!Contract || !Service || !Client) throw new Error("Modelos esenciales no cargados.");
         const contract = await Contract.findByPk(contractId, { transaction });
         if (!contract) {
             await transaction.rollback();
             const error = new Error('Contrato no encontrado.'); error.statusCode = 404; throw error;
         }

         // Validar FK Cliente si se cambia (aunque el form lo deshabilita)
         if (contractData.clientId && contractData.clientId !== contract.clientId) {
              const clientExists = await Client.findByPk(contractData.clientId, { transaction, attributes: ['id'] });
              if (!clientExists) throw new Error(`Cliente con ID ${contractData.clientId} no encontrado.`);
         }

         // NO actualizar specimenId desde aquí
         const { specimenIdToAssociate, serviceIds: ignoredServiceIds, clientId, ...dataToUpdate } = contractData;

         // Actualizar datos propios del contrato
         await contract.update(dataToUpdate, { transaction });
         console.log(`[ContractSvc] Datos base actualizados.`);

         // Actualizar servicios (SOLO si serviceIds no es undefined)
         if (serviceIds !== undefined) {
             const numericServiceIds = (Array.isArray(serviceIds) ? serviceIds : [])
                                     .map(sid => parseInt(sid, 10)).filter(sid => !isNaN(sid));
             console.log(`[ContractSvc] Actualizando servicios asociados a: ${numericServiceIds.join(', ')}`);
              if (numericServiceIds.length > 0) {
                  const services = await Service.findAll({ where: { id: numericServiceIds }, transaction, attributes: ['id'] });
                  if (services.length !== numericServiceIds.length) {
                       const missingIds = numericServiceIds.filter(sid => !services.map(s => s.id).includes(sid));
                       throw new Error(`IDs de servicio inválidos al actualizar: ${missingIds.join(', ')}.`);
                  }
             }
             // Usa alias correcto 'servicios' para reemplazar
             await contract.setServicios(numericServiceIds, { transaction });
             console.log(`[ContractSvc] Servicios asociados actualizados.`);
         }

         await transaction.commit();
         console.log(`[ContractSvc] Transacción de actualización completada.`);
         return getContractById(contractId); // Devolver con relaciones

     } catch (error) {
         await transaction.rollback();
         console.error(`[ContractSvc] Error al actualizar contrato ID ${contractId}:`, error);
         if (error.statusCode === 404) throw error;
         if (error.name === 'SequelizeValidationError') throw new Error(`Error de validación: ${error.errors.map(e => e.message).join(', ')}`);
         if (error.name === 'SequelizeForeignKeyConstraintError') throw new Error(`Error de FK al actualizar.`);
         throw new Error(`Error al actualizar el contrato: ${error.message}`);
     }
};


const deleteContract = async (id) => {
     const contractId = parseInt(id, 10);
     console.log(`[ContractSvc] Iniciando eliminación contrato ID: ${contractId}`);
     if (isNaN(contractId)) throw new Error("ID de contrato inválido.");
     if (!sequelize) throw new Error("Instancia de Sequelize no encontrada.");
     const transaction = await sequelize.transaction();
     try {
        if (!Contract || !Specimen || !Service) throw new Error("Modelos esenciales no cargados.");
        const contract = await Contract.findByPk(contractId, { transaction });
        if (!contract) {
            await transaction.rollback(); const error = new Error('Contrato no encontrado.'); error.statusCode = 404; throw error;
        }

        // Desasociar Servicios ('servicios')
        console.log(`[ContractSvc] Desasociando servicios...`);
        await contract.setServicios([], { transaction });

        // Desasociar Ejemplares (actualizar FK en Specimen)
        console.log(`[ContractSvc] Desasociando ejemplares...`);
        const updatedSpecimensCount = await Specimen.update( { contractId: null }, { where: { contractId: contractId }, transaction });
        console.log(`[ContractSvc] ${updatedSpecimensCount} ejemplar(es) desasociado(s).`);

        // Eliminar el Contrato
        console.log(`[ContractSvc] Eliminando contrato...`);
        await contract.destroy({ transaction });

        await transaction.commit();
        console.log(`[ContractSvc] Contrato ID ${contractId} eliminado.`);
    } catch (error) {
        await transaction.rollback();
        console.error(`[ContractSvc] Error al eliminar contrato ID ${contractId}:`, error);
        if (error.statusCode === 404) throw error;
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             throw new Error('No se puede eliminar: tiene registros asociados dependientes.');
        }
        throw new Error(`Error al eliminar el contrato: ${error.message}`);
    }
};

module.exports = {
    getAllContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract
};