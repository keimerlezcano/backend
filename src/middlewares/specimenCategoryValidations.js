// src/middlewares/specimenCategoryValidations.js

const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize'); // Importar Op
const SpecimenCategory = require('../modelos/SpecimenCategory');
const Specimen = require('../modelos/Specimen'); // <<< IMPORTAR MODELO SPECIMEN >>>

// Helper para verificar si la categoría existe por ID
const validateSpecimenCategoryExistence = async (id) => {
    const categoryId = parseInt(id, 10); // Asegurarse que sea número
    if (isNaN(categoryId)) {
        return Promise.reject('El ID debe ser un número entero válido.');
    }
    const specimenCategory = await SpecimenCategory.findByPk(categoryId);
    if (!specimenCategory) {
        return Promise.reject('La categoría de ejemplar no existe');
    }
};

// Helper para validar nombre único
const validateUniqueSpecimenCategoryName = async (name, { req }) => {
    const whereCondition = { name: name };
    const categoryIdToExclude = req.params?.id ? parseInt(req.params.id, 10) : null;
    if (categoryIdToExclude && !isNaN(categoryIdToExclude)) {
        whereCondition.id = { [Op.not]: categoryIdToExclude };
    } else if (req.params?.id) {
         // Si el ID en params no es válido, no podemos excluirlo correctamente, podría dar falso positivo
         console.warn('[Validation] ID de parámetro inválido al validar nombre único:', req.params.id);
         // Considerar rechazar si el ID es inválido
         // return Promise.reject('ID de categoría inválido en la ruta.');
    }
    const existingCategory = await SpecimenCategory.findOne({ where: whereCondition });
    if (existingCategory) {
        return Promise.reject('El nombre de la categoría de ejemplar ya está en uso');
    }
};

// <<< NUEVA FUNCIÓN DE VALIDACIÓN >>>
// Helper para verificar si una categoría tiene ejemplares asociados
const checkIfCategoryHasSpecimens = async (id) => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
        // Si el ID no es válido, no podemos verificar, asumimos que no se puede borrar
        return Promise.reject('ID de categoría inválido para verificar ejemplares.');
    }
    const count = await Specimen.count({ where: { specimenCategoryId: categoryId } });
    if (count > 0) {
        return Promise.reject(`No se puede eliminar la categoría porque tiene ${count} ejemplar(es) asociado(s).`);
    }
};

// --- Reglas de Validación Exportadas ---

const createSpecimenCategoryValidation = [
    body('name')
        .trim().notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .custom(validateUniqueSpecimenCategoryName),
    body('estado')
        .optional().isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
];

const updateSpecimenCategoryValidation = [
    param('id').isInt({ gt: 0 }).withMessage('ID inválido').custom(validateSpecimenCategoryExistence),
    body('name')
        .optional().trim().isLength({ min: 3 }).withMessage('Nombre muy corto')
        .custom(validateUniqueSpecimenCategoryName),
    body('estado')
        .optional().isIn(['activo', 'inactivo']).withMessage('Estado inválido'),
];

const deleteSpecimenCategoryValidation = [
    param('id')
        .isInt({ gt: 0 }).withMessage('ID inválido')
        .custom(validateSpecimenCategoryExistence) // Primero verifica si existe
        .custom(checkIfCategoryHasSpecimens), // <<< LUEGO VERIFICA SI TIENE EJEMPLARES >>>
];

const getSpecimenCategoryByIdValidation = [
    param('id').isInt({ gt: 0 }).withMessage('ID inválido').custom(validateSpecimenCategoryExistence),
];

module.exports = {
    createSpecimenCategoryValidation,
    updateSpecimenCategoryValidation,
    deleteSpecimenCategoryValidation,
    getSpecimenCategoryByIdValidation,
};