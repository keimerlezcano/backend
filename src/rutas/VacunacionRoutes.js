// src/rutas/VacunacionRoutes.js
const express = require('express');
const router = express.Router();
const vacunacionController = require('../controladores/VacunacionController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const {
    createVacunacionValidation,
    updateVacunacionValidation,
    vacunacionIdValidation
} = require('../middlewares/VacunacionValidation');

// --- Definición de Rutas para /api/vacunaciones ---

// POST /api/vacunaciones - Crear un nuevo registro
router.post(
    '/',
    authenticate,
    authorize('crearVacunacion'),      // Necesitarás este permiso
    createVacunacionValidation,
    vacunacionController.createVacunacion
);

// GET /api/vacunaciones - Obtener todos los registros
router.get(
    '/',
    authenticate,
    authorize('accesoVacunacion'),       // Necesitarás este permiso
    vacunacionController.getAllVacunaciones
);

// GET /api/vacunaciones/:id - Obtener un registro por ID
router.get(
    '/:id',
    authenticate,
    authorize('accesoVacunacion'),
    vacunacionIdValidation,             // Valida el :id
    vacunacionController.getVacunacionById
);

// PUT /api/vacunaciones/:id - Actualizar un registro por ID
router.put(
    '/:id',
    authenticate,
    authorize('actualizarVacunacion'), // Necesitarás este permiso
    updateVacunacionValidation,         // Valida :id y body
    vacunacionController.updateVacunacion
);

// DELETE /api/vacunaciones/:id - Eliminar un registro por ID
router.delete(
    '/:id',
    authenticate,
    authorize('eliminarVacunacion'), // Necesitarás este permiso
    vacunacionIdValidation,             // Valida el :id
    vacunacionController.deleteVacunacion
);

module.exports = router;