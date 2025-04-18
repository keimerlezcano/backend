// src/rutas/AlimentacionRoutes.js
const express = require('express');
const router = express.Router();
const alimentacionController = require('../controladores/AlimentacionController');
const { authenticate } = require('../middlewares/auth'); // Middleware de autenticación (JWT)
const authorize = require('../middlewares/authorize');
const {
    createAlimentacionValidation,
    updateAlimentacionValidation,
    alimentacionIdValidation
} = require('../middlewares/AlimentacionValidation'); // Nuestras validaciones

// --- Definición de Rutas para /api/alimentaciones ---

// POST /api/alimentaciones - Crear un nuevo registro de alimentación
router.post(
    '/',
    authenticate,                             // 1. ¿Usuario autenticado?
    authorize('crearAlimentacion'),          // 2. ¿Tiene permiso para crear? (Necesitarás crear este permiso)
    createAlimentacionValidation,             // 3. ¿Datos del body válidos?
    alimentacionController.createAlimentacion // 4. Ejecutar controlador
);

// GET /api/alimentaciones - Obtener todos los registros
router.get(
    '/',
    authenticate,
    authorize('accesoAlimentacion'),           // Permiso para leer (Necesitarás crear este permiso)
    alimentacionController.getAllAlimentaciones
);

// GET /api/alimentaciones/:id - Obtener un registro por ID
router.get(
    '/:id',
    authenticate,
    authorize('accesoAlimentacion'),
    alimentacionIdValidation,                 // Valida que el :id sea un entero válido
    alimentacionController.getAlimentacionById
);

// PUT /api/alimentaciones/:id - Actualizar un registro por ID
router.put(
    '/:id',
    authenticate,
    authorize('actualizarAlimentacion'),     // Permiso para actualizar (Necesitarás crear este permiso)
    updateAlimentacionValidation,             // Valida :id y el body
    alimentacionController.updateAlimentacion
);

// DELETE /api/alimentaciones/:id - Eliminar un registro por ID
router.delete(
    '/:id',
    authenticate,
    authorize('eliminarAlimentacion'),     // Permiso para eliminar (Necesitarás crear este permiso)
    alimentacionIdValidation,                 // Valida que el :id sea un entero válido
    alimentacionController.deleteAlimentacion
);

module.exports = router;