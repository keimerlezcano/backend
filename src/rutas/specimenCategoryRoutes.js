// src/rutas/specimenCategoryRoutes.js
const express = require('express');
const router = express.Router();
const specimenCategoryController = require('../controladores/specimenCategoryController');
const { createSpecimenCategoryValidation, updateSpecimenCategoryValidation, deleteSpecimenCategoryValidation, getSpecimenCategoryByIdValidation } = require('../middlewares/specimenCategoryValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
router.post('/',
    authenticate,
    authorize('crearCategorias'), // Ya estaba bien (string)
    createSpecimenCategoryValidation,
    specimenCategoryController.createSpecimenCategory
);

router.get('/',
    authenticate,
    authorize('acceso_categorias'), // <--- CORREGIDO (ahora es un string)
    specimenCategoryController.getAllSpecimenCategories
);

router.get('/:id',
    authenticate,
    authorize('acceso_categorias'), // <--- CORREGIDO (ahora es un string)
    getSpecimenCategoryByIdValidation,
    specimenCategoryController.getSpecimenCategoryById
);

router.put('/:id',
    authenticate,
    authorize('actualizarCategorias'), // Ya estaba bien (string)
    updateSpecimenCategoryValidation,
    specimenCategoryController.updateSpecimenCategory
);

router.delete('/:id',
    authenticate,
    authorize('eliminarCategorias'), // Ya estaba bien (string)
    deleteSpecimenCategoryValidation,
    specimenCategoryController.deleteSpecimenCategory
);

module.exports = router;