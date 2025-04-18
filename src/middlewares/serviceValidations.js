// src/middlewares/serviceValidations.js
const { param, validationResult } = require('express-validator');
const Service = require('../modelos/Service'); // Ajusta la ruta si es necesario

// --- Función Helper para Validar Existencia (Usada por otras validaciones) ---
const validateServiceExistence = async (id) => {
  const serviceId = parseInt(id, 10);
  if (isNaN(serviceId)) return true; // isInt se encarga de esto en la regla principal
  const service = await Service.findByPk(serviceId);
  if (!service) {
    return Promise.reject('El servicio no existe');
  }
};


// --- Reglas de Validación Exportadas ---

// Validación para CREAR (POST /) - Se hace principalmente en el controlador ahora
// Dejamos un array vacío o con validaciones muy básicas si las hubiera (ej. sanitize)
// ya que las validaciones principales de body se hacen en el controller post-Multer.
const createServiceValidation = [
    // Ejemplo: Podrías sanitizar campos aquí si quieres, pero no validar con body()
    // body('nombre').trim().escape(),
    // body('descripcion').trim().escape()
];

// Validación para ACTUALIZAR (PUT /:id) - Solo valida el ID aquí
const updateServiceValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del servicio debe ser un número entero positivo.')
    .custom(validateServiceExistence)
  // La validación del body se hace en el controlador post-Multer
];

// Validación para ELIMINAR (DELETE /:id) - Valida el ID
const deleteServiceValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del servicio debe ser un número entero positivo.')
    .custom(validateServiceExistence)
];

// Validación para OBTENER POR ID (GET /:id) - Valida el ID
const getServiceByIdValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del servicio debe ser un número entero positivo.')
    .custom(validateServiceExistence)
];

module.exports = {
  createServiceValidation,    // Exporta (aunque esté vacío o solo sanitize)
  updateServiceValidation,
  deleteServiceValidation,
  getServiceByIdValidation
};