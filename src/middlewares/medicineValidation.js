// src/middlewares/medicineValidation.js
const { body, param } = require('express-validator');

const medicineCreateValidation = [
  body('nombre').notEmpty().withMessage('Name is required'),
  body('cantidad').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('dosis').notEmpty().withMessage('Dose is required'),
  body('horaAdministracion').notEmpty().withMessage('Admin Time is required'),
  body('specimenId').isInt().withMessage('Specimen ID must be an integer')
];

const medicineUpdateValidation = [
  param('id').isInt().withMessage('ID must be an integer'),
  body('nombre').optional().notEmpty().withMessage('Name is required'),
  body('cantidad').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('dosis').optional().notEmpty().withMessage('Dose is required'),
  body('horaAdministracion').optional().notEmpty().withMessage('Admin Time is required'),
  body('specimenId').optional().isInt().withMessage('Specimen ID must be an integer')
];

const medicineIdValidation = [
  param('id').isInt().withMessage('ID must be an integer')
];

module.exports = {
  medicineCreateValidation,
  medicineUpdateValidation,
  medicineIdValidation
};