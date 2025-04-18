const { body, param, validationResult } = require('express-validator');
const Permission = require('../modelos/Permission');

const validatePermissionExistence = async (id) => {
  const permission = await Permission.findByPk(id);
  if (!permission) {
    return Promise.reject('El permiso no existe');
  }
};

const validateUniquePermissionName = async (name) => {
  const permission = await Permission.findOne({ where: { name } });
  if (permission) {
    return Promise.reject('El permiso ya existe');
  }
};

const createPermissionValidation = [
  body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres').custom(validateUniquePermissionName)
];

const updatePermissionValidation = [
  param('id').isInt().withMessage('El id debe ser un número entero').custom(validatePermissionExistence),
  body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres').custom(validateUniquePermissionName)
];

const deletePermissionValidation = [
  param('id').isInt().withMessage('El id debe ser un número entero').custom(validatePermissionExistence)
];

const getPermissionByIdValidation = [
  param('id').isInt().withMessage('El id debe ser un número entero').custom(validatePermissionExistence)
];

module.exports = {
  createPermissionValidation,
  updatePermissionValidation,
  deletePermissionValidation,
  getPermissionByIdValidation
};