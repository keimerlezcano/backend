// src/middlewares/VacunacionValidation.js
const { body, param } = require('express-validator');

// Validación para crear un registro de vacunación
const createVacunacionValidation = [
  body('nombreVacuna')
    .trim()
    .notEmpty().withMessage('El nombre de la vacuna es requerido.'),
  body('fechaAdministracion')
    .notEmpty().withMessage('La fecha de administración es requerida.')
    // Valida si es una fecha válida (YYYY-MM-DD o formato ISO8601)
    // isISO8601() es más flexible y permite fecha+hora si usaste DATE en el modelo
    .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('La fecha debe tener el formato YYYY-MM-DD.')
    // .isISO8601().toDate().withMessage('La fecha de administración no es válida.'), // Alternativa si usas DATE
    .toDate(), // Intenta convertir a objeto Date
  body('specimenId')
    .notEmpty().withMessage('El ID del espécimen es requerido.')
    .isInt({ gt: 0 }).withMessage('El ID del espécimen debe ser un entero positivo.')
    .toInt()
];

// Validación para actualizar un registro (campos opcionales)
const updateVacunacionValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID en la URL debe ser un entero positivo.')
    .toInt(),
  body('nombreVacuna')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre de la vacuna no puede estar vacío si se envía.'),
  body('fechaAdministracion')
    .optional()
    .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('La fecha debe tener el formato YYYY-MM-DD.')
    // .isISO8601().toDate().withMessage('La fecha de administración no es válida.'), // Alternativa
    .toDate(),
  body('specimenId')
    .optional()
    .isInt({ gt: 0 }).withMessage('El ID del espécimen debe ser un entero positivo.')
    .toInt()
];

// Validación solo para el ID en la URL
const vacunacionIdValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo.')
    .toInt()
];

module.exports = {
  createVacunacionValidation,
  updateVacunacionValidation,
  vacunacionIdValidation
};