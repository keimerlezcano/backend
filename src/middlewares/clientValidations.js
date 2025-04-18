const { body } = require('express-validator');
const clientService = require('../servicios/clientService');

const ValidateClient = [
    body('documento')
        .isLength({ min: 10 })
        .withMessage('El documento debe tener al menos 10 dígitos')
        .isNumeric()
        .withMessage('El documento debe ser numérico')
        .custom(async (documento, { req }) => {
            const existingClient = await clientService.findOne(documento);
            if (existingClient) {
                if (req.params.id && existingClient.id !== parseInt(req.params.id)) {
                    throw new Error('Ya existe un cliente con este documento');
                }
                if (!req.params.id) {
                    throw new Error('Ya existe un cliente con este documento');
                }
            }
        }),

    body('celular')
        .isLength({ min: 10 })
        .withMessage('El celular debe tener al menos 10 dígitos')
        .isNumeric()
        .withMessage('El celular debe ser numérico'),

    body('correo')
        .isEmail()
        .withMessage('Correo electrónico inválido')
];

module.exports = {
    ValidateClient
};