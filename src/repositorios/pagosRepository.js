// src/repositorios/pagosRepository.js
const { Pago, Contract, Specimen, Client, sequelize } = require('../modelos/associations');
const { Op } = require('sequelize');

console.log('[PagosRepo] Módulo cargado.');
console.log('[PagosRepo] Modelos:', { Pago: !!Pago, Contract: !!Contract, Specimen: !!Specimen, Client: !!Client });

const getAllPagos = async () => {
    console.log('[PagosRepo] getAllPagos: Buscando todos...');
    try {
        const includeOptions = [{
            model: Contract,
            as: 'contract', // Alias Pago -> Contract (Parece OK)
            attributes: ['id', 'fechaInicio', 'precioMensual'],
            required: false,
            include: [
                 {
                     model: Client, // Cliente del Contrato
                     as: 'client',  // Alias Contract -> Client (Parece OK)
                     attributes: ['id', 'nombre'],
                     required: false
                 },
                 {
                    model: Specimen, // Ejemplares del Contrato
                    // --- ¡¡CORRECCIÓN AQUÍ!! ---
                    // El alias debe coincidir con el definido en associations.js para Contract -> Specimen
                    as: 'contractSpecimens', // Corregido de 'specimens'
                    // --------------------------
                    attributes: ['id', 'name', 'breed', 'color', 'birthDate'],
                    required: false,
                    // Include anidado para el propietario del espécimen (Parece OK)
                    include: [{
                        model: Client,
                        as: 'propietario',
                        attributes: ['id', 'nombre'],
                        required: false
                    }]
                }
            ]
        }];

        const pagos = await Pago.findAll({
            include: includeOptions,
            order: [['fechaPago', 'DESC'], ['id_pago', 'DESC']]
        });
        console.log(`[PagosRepo] getAllPagos encontró ${pagos.length} pagos.`);
        return pagos;
    } catch (error) {
        console.error('[PagosRepo] Error Detallado en getAllPagos:', error);
        if (error.parent?.sql) console.error("[PagosRepo] SQL:", error.parent.sql);
        throw new Error('Error al obtener los pagos desde el repositorio');
    }
};

const getPagoById = async (id) => {
    const pagoId = parseInt(id, 10);
    console.log(`[PagosRepo] getPagoById: Buscando ID ${pagoId}...`);
    if (isNaN(pagoId)) throw new Error('ID pago inválido.');
    try {
        const includeOptions = [{
            model: Contract,
            as: 'contract', // Alias Pago -> Contract
            attributes: ['id', 'fechaInicio', 'precioMensual'],
            required: false,
            include: [
                {
                    model: Client,
                    as: 'client', // Alias Contract -> Client
                    attributes: ['id', 'nombre', 'documento', 'correo', 'celular', /* 'ejemplares' puede ser problemático aquí si no es atributo directo */],
                    required: false
                },
                {
                    model: Specimen,
                    // --- ¡¡CORRECCIÓN AQUÍ!! ---
                    as: 'contractSpecimens', // Corregido de 'specimens'
                    // --------------------------
                    attributes: ['id', 'name', 'breed', 'color', 'birthDate', 'identifier', 'specimenCategoryId', 'sedeId'],
                    required: false,
                    include: [{
                        model: Client,
                        as: 'propietario', // Alias Specimen -> Client
                        attributes: ['id', 'nombre', 'documento', 'correo', 'celular'],
                        required: false
                    }]
                 }
            ]
        }];
        const pago = await Pago.findByPk(pagoId, { include: includeOptions });
        console.log(`[PagosRepo] getPagoById encontró para ID ${pagoId}:`, !!pago);
        return pago;
    } catch (error) {
        console.error(`[PagosRepo] Error getPagoById ID ${pagoId}:`, error);
        if (error.parent?.sql) console.error("[PagosRepo] SQL:", error.parent.sql);
        throw new Error('Error al obtener el pago');
    }
};

// --- getPagosByContractId, createPago, updatePago sin cambios ---
// (Asegúrate que los includes dentro de getPagosByContractId también sean correctos si los modificas)
const getPagosByContractId = async (contractId) => {
    const contId = parseInt(contractId, 10);
    console.log(`[PagosRepo] getPagosByContractId: Contrato ID ${contId}...`);
    if (isNaN(contId)) throw new Error('ID contrato inválido.');
    try {
        const pagos = await Pago.findAll({
            where: { contractId: contId },
            include: [{
                model: Contract,
                as: 'contract',
                attributes: ['id'],
                 required: false,
                 include: [{
                     model: Client,
                     as: 'client',
                     attributes: ['id', 'nombre'],
                     required: false
                 }]
            }],
            order: [['mesPago', 'ASC'], ['fechaPago', 'ASC']]
        });
         console.log(`[PagosRepo] getPagosByContractId para ${contId} encontró ${pagos.length} pagos.`);
         return pagos;
    } catch (error) {
        console.error(`[PagosRepo] Error getPagosByContractId Contrato ID ${contractId}:`, error);
        if (error.parent?.sql) console.error("[PagosRepo] SQL:", error.parent.sql);
        throw new Error('Error al obtener pagos del contrato');
     }
};

const createPago = async (pagoData) => {
    console.log('[PagosRepo] createPago: Datos:', pagoData);
    try { return await Pago.create(pagoData); }
    catch (error) { console.error('[PagosRepo] Error en createPago:', error); throw new Error('Error al crear el pago'); }
};

const updatePago = async (id, pagoData) => {
    const pagoId = parseInt(id, 10);
    console.log(`[PagosRepo] updatePago: ID ${pagoId}, Datos:`, pagoData);
    if (isNaN(pagoId)) throw new Error('ID pago inválido.');
    try {
        // Simplificado para actualizar solo los campos proporcionados
        const [affectedRows] = await Pago.update(pagoData, { where: { id_pago: pagoId }, fields: Object.keys(pagoData) });
        if (affectedRows > 0) return getPagoById(pagoId);
        else throw new Error('Pago no encontrado o sin cambios para actualizar');
    } catch (error) { console.error(`[PagosRepo] Error en updatePago ID ${pagoId}:`, error); throw new Error(`Error al actualizar el pago: ${error.message}`); }
};


module.exports = {
    getAllPagos,
    getPagoById,
    getPagosByContractId,
    createPago,
    updatePago
};