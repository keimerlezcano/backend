const { body, param, Sequelize } = require('express-validator');
const Specimen = require('../modelos/Specimen');
const SpecimenCategory = require('../modelos/SpecimenCategory');
const Sede = require('../modelos/sede');
const Client = require('../modelos/client');

const validateSpecimenExistence = async (id) => {
  const specimen = await Specimen.findByPk(id);
  if (!specimen) {
    return Promise.reject('El ejemplar no existe');
  }
};

const validateSpecimenCategoryId = async (specimenCategoryId) => {
  if (specimenCategoryId) {
    const specimenCategory = await SpecimenCategory.findByPk(specimenCategoryId);
    if (!specimenCategory) {
      return Promise.reject('La categoría de ejemplar no existe');
    }
  }
};

const validateUniqueIdentifier = async (value) => {
  if (value) {
    const existingSpecimen = await Specimen.findOne({ where: { identifier: value } });
    if (existingSpecimen) {
      return Promise.reject('Ya existe un ejemplar con este identificador.');
    }
  }
};

const validateClientId = async (clientId) => {
    if (clientId) {
        const client = await Client.findByPk(clientId);
        if (!client) {
            return Promise.reject('El cliente no existe');
        }
    }
};

const createSpecimenValidation = [
  body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  body('breed').optional().isString().withMessage('La raza debe ser una cadena de texto'),
  body('color').optional().isString().withMessage('La color debe ser una cadena de texto'),
  body('birthDate').optional().isISO8601().toDate().withMessage('La fecha de nacimiento debe ser una fecha válida'),
  body('clientId')
        .optional()
        .isInt()
        .withMessage('El ID del cliente debe ser un número entero')
        .custom(validateClientId),
  body('specimenCategoryId').isInt().withMessage('El ID de la categoría de ejemplar debe ser un número entero').custom(validateSpecimenCategoryId),
  body('identifier')
    .optional()
    .custom(validateUniqueIdentifier)
];

const updateSpecimenValidation = [
  param('id').isInt().withMessage('El id debe ser un número entero').custom(validateSpecimenExistence),
  body('name').isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  body('breed').optional().isString().withMessage('La raza debe ser una cadena de texto'),
  body('color').optional().isString().withMessage('La color debe ser una cadena de texto'),
  body('birthDate').optional().isISO8601().toDate().withMessage('La fecha de nacimiento debe ser una fecha válida'),
  body('clientId')
        .optional()
        .isInt()
        .withMessage('El ID del cliente debe ser un número entero')
        .custom(validateClientId),
  body('specimenCategoryId').isInt().withMessage('El ID de la categoría de ejemplar debe ser un número entero').custom(validateSpecimenCategoryId),
  body('identifier')
    .optional()
    .custom((value, { req }) => {
      if (value) {
        return Specimen.findOne({
          where: {
            identifier: value,
            id: { [Sequelize.Op.not]: req.params.id }
          }
        }).then(existingSpecimen => {
          if (existingSpecimen) {
            return Promise.reject('Ya existe un ejemplar con este identificador.');
          }
        });
      }
      return true;
    })
];

const deleteSpecimenValidation = [
  param('id').isInt().withMessage('El id debe ser un número entero').custom(validateSpecimenExistence)
];

const getSpecimenByIdValidation = [
  param('id').isInt().withMessage('El id debe ser un número entero').custom(validateSpecimenExistence)
];

const validateDifferentCategory = async (specimenCategoryId, { req }) => {
  const specimenId = req.params.id;
  const specimen = await Specimen.findByPk(specimenId);

  if (!specimen) {
    return Promise.reject('El ejemplar no existe.');
  }

  if (specimen.specimenCategoryId === parseInt(specimenCategoryId)) {
    return Promise.reject('El ejemplar ya está en esta categoría.');
  }

  return true;
};

const validateSedeId = async (sedeId) => {
  if (sedeId) {
    const sede = await Sede.findByPk(sedeId);
    if (!sede) {
      return Promise.reject('La sede no existe');
    }
  }
};

const validateDifferentSede = async (sedeId, { req }) => {
  const specimenId = req.params.id;
  const specimen = await Specimen.findByPk(specimenId);

  if (!specimen) {
    return Promise.reject('El ejemplar no existe.');
  }

  if (specimen.sedeId === parseInt(sedeId)) {
    return Promise.reject('El ejemplar ya está en esta sede.');
  }

  return true;
};

const moveSpecimenValidation = [
  param('id').isInt().withMessage('El ID del ejemplar debe ser un número entero').custom(validateSpecimenExistence),
  body('specimenCategoryId')
    .optional()
    .isInt().withMessage('El ID de la categoría de ejemplar debe ser un número entero')
    .custom(validateSpecimenCategoryId)
    .custom(validateDifferentCategory),
  body('sedeId')
    .optional()
    .isInt().withMessage('El ID de la sede debe ser un número entero')
    .custom(validateSedeId)
    .custom(validateDifferentSede)
];

module.exports = {
  createSpecimenValidation,
  updateSpecimenValidation,
  deleteSpecimenValidation,
  getSpecimenByIdValidation,
  moveSpecimenValidation
};