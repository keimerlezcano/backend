// src/middlewares/userValidations.js
const { body } = require('express-validator');

const createUserValidation = [
    // --- NUEVAS VALIDACIONES ---
    body('nombreCompleto').notEmpty().withMessage('El nombre completo es requerido').trim().escape(),
    body('documento').notEmpty().withMessage('El documento es requerido').trim().escape(),
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido').normalizeEmail(),
    body('celular').optional({ checkFalsy: true }).isMobilePhone('any', { strictMode: false }).withMessage('Debe ser un número de celular válido (opcional)').trim().escape(), // Opcional, ajusta locale si es necesario
    // --- FIN NUEVAS VALIDACIONES ---

    body('username').isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres').trim().escape(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('roleId').isInt({ gt: 0 }).withMessage('Debe seleccionar un rol válido') // Asegurar que sea mayor que 0
];

const loginUserValidation = [
    body('username').notEmpty().withMessage('El nombre de usuario es requerido').trim().escape(),
    body('password').notEmpty().withMessage('La contraseña es requerida')
];

// --- NUEVAS VALIDACIONES PARA ACTUALIZAR ---
// Similar a crear, pero la contraseña es opcional y validamos campos existentes
const updateUserValidation = [
    body('nombreCompleto').optional().notEmpty().withMessage('El nombre completo no puede estar vacío').trim().escape(),
    body('documento').optional().notEmpty().withMessage('El documento no puede estar vacío').trim().escape(),
    body('email').optional().isEmail().withMessage('Debe ser un correo electrónico válido').normalizeEmail(),
    body('celular').optional({ checkFalsy: true }).isMobilePhone('any', { strictMode: false }).withMessage('Debe ser un número de celular válido').trim().escape(),
    body('username').optional().isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres').trim().escape(),
    body('password').optional().isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'), // Solo valida si se envía
    body('roleId').optional().isInt({ gt: 0 }).withMessage('Debe seleccionar un rol válido')
];
// --- FIN NUEVAS VALIDACIONES PARA ACTUALIZAR ---

module.exports = {
    createUserValidation,
    loginUserValidation,
    updateUserValidation // Exportar nueva validación
};