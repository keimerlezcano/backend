// src/middlewares/roleValidations.js
const { body, param, validationResult } = require('express-validator');
const Role = require('../modelos/Role');
const { Op } = require('sequelize'); // Importa Op para operadores (!=)

// Función para validar si un rol existe por ID
const validateRoleExistence = async (id) => {
  const roleId = parseInt(id, 10); // Asegura que sea número
  if (isNaN(roleId)) {
      // No rechaces aquí directamente, deja que isInt() lo haga
      return true; // O lanza un error si prefieres que falle aquí
  }
  const role = await Role.findByPk(roleId);
  if (!role) {
    // Rechaza la promesa si no se encuentra
    return Promise.reject('El rol con el ID especificado no existe');
  }
  // Si existe, la validación pasa (no necesitas devolver nada explícito)
};

// Función para validar si el nombre del rol es único (ignorando el ID actual al actualizar)
const validateUniqueRoleName = async (name, { req }) => {
    // Construye la condición de búsqueda inicial (busca por nombre)
    const whereCondition = {
        name: name?.trim() // Busca por el nombre (quitando espacios extra)
    };

    // Si la petición TIENE parámetros y un parámetro 'id' (estamos en una ruta PUT /:id)
    if (req.params && req.params.id) {
        const currentRoleId = parseInt(req.params.id, 10);
        // Añade condición para excluir el ID del rol actual de la búsqueda
        if (!isNaN(currentRoleId)) {
             whereCondition.id = { [Op.ne]: currentRoleId }; // [Op.ne] significa 'Not Equal' (diferente de)
        }
    }

    // Busca si OTRO rol ya tiene ese nombre
    const existingRole = await Role.findOne({ where: whereCondition });

    // Si se encontró otro rol con el mismo nombre, rechaza la promesa
    if (existingRole) {
        return Promise.reject('El nombre del rol ya está en uso');
    }
    // Si no se encontró otro, el nombre es válido
};

// --- Reglas de Validación para las Rutas ---

// Validación para CREAR un rol (POST /)
const createRoleValidation = [
  body('name')
    .trim() // Limpia espacios
    .notEmpty().withMessage('El nombre del rol es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
    .custom(validateUniqueRoleName), // Valida que el nombre sea único
  // Validación opcional para los permisos (si los envías desde el form)
  body('permissions') // Asume que envías un array de NOMBRES de permisos
    .optional() // Hace que este campo sea opcional
    .isArray().withMessage('Los permisos deben ser un array de nombres.')
    // Podrías añadir una validación custom para verificar que los nombres existen
    // .custom(async (permissionNames) => { /* ... lógica para verificar nombres ... */ })
];

// Validación para ACTUALIZAR un rol (PUT /:id)
const updateRoleValidation = [
  // Valida el ID en la URL
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del rol debe ser un número entero positivo.')
    .custom(validateRoleExistence), // Valida que el rol con ese ID exista
  // Valida el nombre en el cuerpo (es opcional actualizarlo, pero si se envía, debe ser válido)
  body('name')
    .optional() // El nombre no es obligatorio en la actualización
    .trim()
    .isLength({ min: 3 }).withMessage('Si se proporciona, el nombre debe tener al menos 3 caracteres')
    .custom(validateUniqueRoleName), // Valida unicidad (ignorando el ID actual)
  // Validación opcional para los permisos
  body('permissions')
    .optional()
    .isArray().withMessage('Los permisos deben ser un array de nombres.')
    // .custom(async (permissionNames) => { /* ... lógica ... */ })
];

// Validación para ELIMINAR un rol (DELETE /:id)
const deleteRoleValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del rol debe ser un número entero positivo.')
    .custom(validateRoleExistence) // Valida que exista antes de intentar borrar
];

// Validación para OBTENER un rol por ID (GET /:id)
const getRoleByIdValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del rol debe ser un número entero positivo.')
    .custom(validateRoleExistence) // Valida que exista
];

module.exports = {
  createRoleValidation,
  updateRoleValidation,
  deleteRoleValidation,
  getRoleByIdValidation
  // No necesitas exportar las funciones internas si no se usan fuera
};