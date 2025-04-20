// src/middlewares/specimenValidations.js
const { body, param } = require('express-validator');
const { Op } = require('sequelize'); // Importar Op
// Asegúrate de que la ruta a associations sea correcta
const { Specimen, SpecimenCategory, Sede, Client } = require('../modelos/associations');

// --- Funciones de Validación Auxiliares ---

// Verifica si un ejemplar existe por ID
const validateSpecimenExistence = async (id) => {
  const specimen = await Specimen.findByPk(id);
  if (!specimen) {
    return Promise.reject('El ejemplar no existe');
  }
};

// Verifica si una categoría existe por ID
const validateSpecimenCategoryId = async (specimenCategoryId) => {
  // Permitir que sea opcional en algunos casos (como update), pero si se provee, debe existir
  if (specimenCategoryId !== undefined && specimenCategoryId !== null) {
    const category = await SpecimenCategory.findByPk(specimenCategoryId);
    if (!category) {
      return Promise.reject('La categoría de ejemplar no existe');
    }
  }
  return true; // Es válido si no se proporciona (opcional) o si existe
};

// Verifica si una sede existe por ID
const validateSedeId = async (sedeId) => {
   // Permitir que sea opcional en algunos casos (como update), pero si se provee, debe existir
  if (sedeId !== undefined && sedeId !== null) {
    const sede = await Sede.findByPk(sedeId);
    if (!sede) {
      return Promise.reject('La sede seleccionada no existe');
    }
  }
   return true; // Es válido si no se proporciona (opcional) o si existe
};

// Verifica si un cliente existe por ID
const validateClientId = async (clientId) => {
  // Permitir que sea opcional, pero si se provee, debe existir
  if (clientId !== undefined && clientId !== null) {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return Promise.reject('El cliente no existe');
    }
  }
  return true; // Es válido si no se proporciona (opcional) o si existe
};

// Verifica unicidad del identificador (UUID) - Para creación
const validateUniqueIdentifierOnCreate = async (identifier) => {
  if (identifier) { // El UUID se genera por defecto, esta validación es por si se envía manualmente
    const existingSpecimen = await Specimen.findOne({ where: { identifier } });
    if (existingSpecimen) {
      return Promise.reject('Ya existe un ejemplar con este identificador único.');
    }
  }
};

// Verifica unicidad del identificador (UUID) - Para actualización (excluyendo el propio ejemplar)
const validateUniqueIdentifierOnUpdate = async (identifier, { req }) => {
  if (identifier && req.params.id) {
    const existingSpecimen = await Specimen.findOne({
      where: {
        identifier: identifier,
        id: { [Op.ne]: req.params.id } // Op.ne significa "not equal" (no igual a)
      }
    });
    if (existingSpecimen) {
      return Promise.reject('Ya existe OTRO ejemplar con este identificador único.');
    }
  }
  return true; // Válido si no se proporciona o no existe otro con ese ID
};

// Verifica que el ejemplar no esté ya en la misma categoría (para mover)
const validateDifferentCategory = async (specimenCategoryId, { req }) => {
    if (!req.params.id || specimenCategoryId === undefined || specimenCategoryId === null) {
        return true; // No se puede validar o no se está intentando mover categoría
    }
    const specimen = await Specimen.findByPk(req.params.id);
    if (!specimen) {
      // La validación de existencia ya debería haber fallado, pero por si acaso
      return Promise.reject('El ejemplar no existe.');
    }
    if (specimen.specimenCategoryId === parseInt(specimenCategoryId, 10)) {
      return Promise.reject('El ejemplar ya se encuentra en esta categoría.');
    }
    return true;
};

// Verifica que el ejemplar no esté ya en la misma sede (para mover)
const validateDifferentSede = async (sedeId, { req }) => {
    if (!req.params.id || sedeId === undefined || sedeId === null) {
        return true; // No se puede validar o no se está intentando mover sede
    }
    const specimen = await Specimen.findByPk(req.params.id);
    if (!specimen) {
      return Promise.reject('El ejemplar no existe.');
    }
    // Compara permitiendo que la sede actual sea null (si se permite)
    if (specimen.sedeId === parseInt(sedeId, 10)) {
      return Promise.reject('El ejemplar ya se encuentra en esta sede.');
    }
    return true;
};

// --- Validaciones por Ruta ---

const createSpecimenValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),
  body('breed')
    .optional({ checkFalsy: true }) // Permite string vacío ''
    .isString().withMessage('La raza debe ser una cadena de texto.'),
  body('color')
    .optional({ checkFalsy: true })
    .isString().withMessage('El color debe ser una cadena de texto.'),
  body('birthDate')
    .optional({ checkFalsy: true })
    .isISO8601().toDate().withMessage('La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD).'),
  body('clientId')
    .optional({ nullable: true }) // Permite null o no enviarlo
    .isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un número entero positivo.')
    .custom(validateClientId), // Verifica si el cliente existe
  body('specimenCategoryId')
    .notEmpty().withMessage('La categoría del ejemplar es obligatoria.')
    .isInt({ gt: 0 }).withMessage('El ID de la categoría debe ser un número entero positivo.')
    .custom(validateSpecimenCategoryId), // Verifica si la categoría existe
  body('identifier')
    .optional() // El UUID se genera por defecto
    .isUUID(4).withMessage('El identificador debe ser un UUID v4 válido.')
    .custom(validateUniqueIdentifierOnCreate), // Verifica unicidad si se envía

  // --- ¡VALIDACIÓN CLAVE AÑADIDA! ---
  body('sedeId')
    .notEmpty().withMessage('La sede es obligatoria.')
    .isInt({ gt: 0 }).withMessage('El ID de la sede debe ser un número entero positivo.')
    .custom(validateSedeId), // Verifica si la sede existe
  // ------------------------------------

  body('contractId')
    .optional({ nullable: true })
    .isInt({ gt: 0 }).withMessage('El ID del contrato debe ser un número entero positivo.')
  // Aquí podrías añadir una validación custom para verificar si el contrato existe si lo necesitas
  // .custom(async (contractId) => { /* ... verificar si Contract.findByPk(contractId) existe ... */ })
];

const updateSpecimenValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del ejemplar en la URL debe ser un número entero positivo.')
    .custom(validateSpecimenExistence), // Verifica que el ejemplar a actualizar exista
  body('name')
    .optional() // En update, los campos suelen ser opcionales
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío si se envía.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),
  body('breed')
    .optional({ nullable: true })
    .isString().withMessage('La raza debe ser una cadena de texto.'),
  body('color')
    .optional({ nullable: true })
    .isString().withMessage('El color debe ser una cadena de texto.'),
  body('birthDate')
    .optional({ nullable: true })
    .isISO8601().toDate().withMessage('La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD).'),
  body('clientId')
    .optional({ nullable: true })
    .isInt({ gt: 0 }).withMessage('El ID del cliente debe ser un número entero positivo.')
    .custom(validateClientId),
  body('specimenCategoryId')
    .optional() // Permitir no cambiar la categoría
    .isInt({ gt: 0 }).withMessage('El ID de la categoría debe ser un número entero positivo.')
    .custom(validateSpecimenCategoryId),
  body('identifier')
    .optional()
    .isUUID(4).withMessage('El identificador debe ser un UUID v4 válido.')
    .custom(validateUniqueIdentifierOnUpdate), // Verifica unicidad excluyendo el propio ejemplar

  // --- Validación de Sede en Update (Opcional) ---
  body('sedeId')
    .optional() // Permitir no cambiar la sede
    .isInt({ gt: 0 }).withMessage('El ID de la sede debe ser un número entero positivo.')
    .custom(validateSedeId), // Verifica si la sede existe
  // -------------------------------------------

  body('contractId')
    .optional({ nullable: true })
    .isInt({ gt: 0 }).withMessage('El ID del contrato debe ser un número entero positivo.')
   // .custom(async (contractId) => { /* ... verificar si Contract.findByPk(contractId) existe ... */ })
];

const deleteSpecimenValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del ejemplar en la URL debe ser un número entero positivo.')
    .custom(validateSpecimenExistence) // Verifica que exista antes de borrar
];

const getSpecimenByIdValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del ejemplar en la URL debe ser un número entero positivo.')
    .custom(validateSpecimenExistence) // Verifica que exista antes de obtener
];

const moveSpecimenValidation = [
  param('id')
    .isInt({ gt: 0 }).withMessage('El ID del ejemplar debe ser un número entero positivo.')
    .custom(validateSpecimenExistence), // El ejemplar a mover debe existir
  body('specimenCategoryId')
    .optional() // Es opcional mover de categoría
    .isInt({ gt: 0 }).withMessage('El ID de la categoría de destino debe ser un número entero positivo.')
    .custom(validateSpecimenCategoryId) // La categoría de destino debe existir
    .custom(validateDifferentCategory), // No debe ser la misma categoría actual
  body('sedeId')
    .optional() // Es opcional mover de sede
    .isInt({ gt: 0 }).withMessage('El ID de la sede de destino debe ser un número entero positivo.')
    .custom(validateSedeId) // La sede de destino debe existir
    .custom(validateDifferentSede) // No debe ser la misma sede actual
];

module.exports = {
  createSpecimenValidation,
  updateSpecimenValidation,
  deleteSpecimenValidation,
  getSpecimenByIdValidation,
  moveSpecimenValidation
};