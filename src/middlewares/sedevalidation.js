const { body, param } = require('express-validator');
const { sedeExists, sedeExistsById } = require('../repositorios/sedeRepository'); // Importamos las funciones del repositorio

// Validación base para la creación y actualización de sedes
const sedeBaseValidation = [
    body('NombreSede')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres')
        .matches(/^[^0-9]+$/) // Asegura que no haya números en el nombre
        .withMessage('El nombre de la sede no puede contener números')
        .custom(async (NombreSede, { req }) => {
            const sedeExistsWithSameName = await sedeExists(NombreSede);
            if (sedeExistsWithSameName) {
              if (req && req.params && req.params.id) {
                 const sedeFromDB = await sedeExists(NombreSede);
                  if(sedeFromDB.id == req.params.id){
                    return true; 
                  }
              }
                return Promise.reject('Ya existe una sede con este nombre.');
            }
        })
];

// Validación para crear una sede
const createSedeValidation = [
    ...sedeBaseValidation
];

// Validación para actualizar una sede
const updateSedeValidation = [
    ...sedeBaseValidation,
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(async (id) => {
        const exists = await sedeExistsById(id);
        if (!exists) {
            return Promise.reject('La sede no existe');
        }
    })
    // Ya no necesitamos la validación de nombre aquí, está en sedeBaseValidation
];

// Validación para eliminar una sede
const deleteSedeValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(async (id) => {
        const exists = await sedeExistsById(id);
        if (!exists) {
            return Promise.reject('La sede no existe');
        }
    })
];

// Validación para obtener una sede por ID
const getSedeByIdValidation = [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    param('id').custom(async (id) => {
        const exists = await sedeExistsById(id);
        if (!exists) {
            return Promise.reject('La sede no existe');
        }
    })
];

module.exports = {
    createSedeValidation,
    updateSedeValidation,
    deleteSedeValidation,
    getSedeByIdValidation
};