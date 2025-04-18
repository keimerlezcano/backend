// src/middlewares/contractValidations.js
const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Contract = require('../modelos/contract'); // Verifica nombre/ruta
const Specimen = require('../modelos/Specimen');   // Verifica nombre/ruta
const Service = require('../modelos/Service');     // Verifica nombre/ruta
const Client = require('../modelos/client');       // Verifica nombre/ruta

// Helpers (sin cambios)
const validateSpecimenExists = async (ejemplarId) => { /* ... */ };
const validateServiceIds = async (serviceIds) => { /* ... */ };
const validateContractExistence = async (id) => { /* ... */ };
const validateClientExists = async (clientId) => { // <<< NUEVO HELPER >>>
    const id = parseInt(clientId, 10); if(isNaN(id) || !Client) return;
    const client = await Client.findByPk(id);
    if (!client) throw new Error('El cliente especificado no existe');
};

const createContractValidation = [
    body('fechaInicio').trim().notEmpty().withMessage('Fecha inicio obligatoria').isISO8601().toDate().withMessage('Fecha inicio inválida'),
    body('precioMensual').trim().notEmpty().withMessage('Precio obligatorio').isDecimal({ decimal_digits: '0,2' }).toFloat().isFloat({ gt: 0 }).withMessage('Precio inválido'),
    // <<< AÑADIDA VALIDACIÓN clientId >>>
    body('clientId').trim().notEmpty().withMessage('Cliente obligatorio').isInt({ gt: 0 }).withMessage('ID Cliente inválido').custom(validateClientExists),
    // <<< VALIDACIÓN ejemplarId quitada del body (se asume que se pasa diferente o se asocia después) >>>
    // Si SIEMPRE se debe asociar un ejemplar AL CREAR el contrato y viene en el body, descomenta:
    // body('specimenIdToAssociate') // O como se llame el campo en el body
    //    .trim().notEmpty().withMessage('Ejemplar obligatorio')
    //    .isInt({ gt: 0 }).withMessage('ID Ejemplar inválido')
    //    .custom(validateSpecimenExists),
    body('serviceIds').optional().custom(validateServiceIds), // Validar servicios opcionales
    body('estado').optional().trim().isIn(['activo', 'finalizado', 'cancelado']).withMessage('Estado inválido'), // Validar estado opcional
    body('condiciones').optional().trim() // No necesita validación fuerte si es solo texto
];

const updateContractValidation = [
    param('id').isInt({ gt: 0 }).withMessage('ID inválido en ruta').custom(validateContractExistence),
    body('fechaInicio').optional().isISO8601().toDate().withMessage('Fecha inicio inválida'),
    body('precioMensual').optional().isDecimal({ decimal_digits: '0,2' }).toFloat().isFloat({ gt: 0 }).withMessage('Precio inválido'),
    // <<< VALIDACIONES clientId y ejemplarId quitadas (no se cambian en update) >>>
    // body('clientId').not().exists().withMessage('No se puede cambiar el cliente.'),
    // body('ejemplarId').not().exists().withMessage('No se puede cambiar el ejemplar.'),
    body('estado').optional().trim().isIn(['activo', 'finalizado', 'cancelado']).withMessage('Estado inválido'),
    body('condiciones').optional().trim(),
    body('serviceIds').optional().custom(validateServiceIds) // Permite actualizar servicios
];

const deleteContractValidation = [ param('id').isInt({ gt: 0 }).withMessage('ID inválido').custom(validateContractExistence) ];
const getContractByIdValidation = [ param('id').isInt({ gt: 0 }).withMessage('ID inválido').custom(validateContractExistence) ];

module.exports = {
    createContractValidation,
    updateContractValidation,
    deleteContractValidation,
    getContractByIdValidation
};