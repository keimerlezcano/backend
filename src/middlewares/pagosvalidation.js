const { body, param } = require('express-validator');
const Pago = require('../modelos/pagos');
const Contract = require('../modelos/Contract');
const { Op } = require('sequelize');

const validateContractExists = async (contractId) => {
    const id = parseInt(contractId, 10); if (isNaN(id)) throw new Error('ID de contrato inválido.');
    const contract = await Contract.findByPk(id);
    if (!contract) throw new Error('El contrato especificado no existe.');
};

const pagoBaseValidation = [
    body('valor').notEmpty().withMessage('Valor obligatorio').isDecimal().withMessage('Valor debe ser decimal'),
    body('metodoPago').notEmpty().withMessage('Método obligatorio').isIn(['efectivo', 'transferencia']).withMessage('Método inválido'),
    body('mesPago').notEmpty().withMessage('Mes obligatorio').isInt({ min: 1, max: 12 }).withMessage('Mes debe ser entre 1 y 12'),
    body('contractId').notEmpty().withMessage('Contrato obligatorio').isInt().withMessage('ID Contrato debe ser número').custom(validateContractExists)
    // Puedes añadir validación para fechaPago si es necesario (ej. .isDate().optional())
];

const createPagoValidation = [
    ...pagoBaseValidation,
    body('contractId').custom(async (contractId, { req }) => {
        const { mesPago } = req.body;
        // Asegura que mesPago sea número para la consulta
        const month = parseInt(mesPago, 10);
        if (isNaN(month)) return; // La validación de isInt ya debería cubrir esto

        const existingPago = await Pago.findOne({
            where: {
                contractId: parseInt(contractId, 10), // Asegurar que contractId también sea número
                mesPago: month
            }
        });
        if (existingPago) throw new Error('Ya existe un pago para este contrato y mes.');
    })
];

const updatePagoValidation = [
    param('id').isInt({ gt: 0 }).withMessage('ID de pago inválido en la ruta.'),
    // Validaciones base opcionales para permitir actualización parcial
    body('valor').optional().isDecimal().withMessage('Valor debe ser decimal'),
    body('metodoPago').optional().isIn(['efectivo', 'transferencia']).withMessage('Método inválido'),
    body('mesPago').optional().isInt({ min: 1, max: 12 }).withMessage('Mes debe ser entre 1 y 12'),
    // Generalmente no permites cambiar el contractId de un pago existente
    body('contractId').not().exists().withMessage('No se puede cambiar el contrato de un pago existente.')
];

const getPagoByIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('ID de pago inválido.')
];


module.exports = {
    createPagoValidation,
    updatePagoValidation,
    getPagoByIdValidation
};