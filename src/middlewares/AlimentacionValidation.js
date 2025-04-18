// src/middlewares/AlimentacionValidation.js
const { body, param } = require('express-validator');

// Validación para crear un registro de alimentación
const createAlimentacionValidation = [
  body('nombreAlimento')
    .trim() // Quita espacios al inicio/final
    .notEmpty().withMessage('El nombre del alimento es requerido.'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida.')
    // Ajusta isInt() a isFloat() o isDecimal() si permites decimales
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo.'),
    // Podrías añadir .toFloat() o .toInt() después si necesitas convertir el tipo
  body('specimenId')
    .notEmpty().withMessage('El ID del espécimen es requerido.')
    .isInt({ gt: 0 }).withMessage('El ID del espécimen debe ser un entero positivo.')
    .toInt() // Convierte a entero
];

// Validación para actualizar un registro (campos opcionales)
const updateAlimentacionValidation = [
  // Primero valida que el ID en la URL sea un entero
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID en la URL debe ser un entero positivo.')
    .toInt(),
  // Luego valida los campos del body (opcionales en PUT/PATCH)
  body('nombreAlimento')
    .optional() // Hace que este campo sea opcional en la actualización
    .trim()
    .notEmpty().withMessage('El nombre del alimento no puede estar vacío si se envía.'),
  body('cantidad')
    .optional()
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo.'),
  body('specimenId')
    .optional()
    .isInt({ gt: 0 }).withMessage('El ID del espécimen debe ser un entero positivo.')
    .toInt()
];

// Validación solo para el ID en la URL (para GET por ID y DELETE)
const alimentacionIdValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo.')
    .toInt()
];

module.exports = {
  createAlimentacionValidation,
  updateAlimentacionValidation,
  alimentacionIdValidation
};