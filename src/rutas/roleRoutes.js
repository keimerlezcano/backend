// src/rutas/roleRoutes.js
const express = require('express');
const router = express.Router();

// --- Controladores y Middlewares ---
const roleController = require('../controladores/roleController'); // Asegúrate que este archivo/nombre exista
const { createRoleValidation, updateRoleValidation, deleteRoleValidation, getRoleByIdValidation } = require('../middlewares/roleValidations'); // Asegúrate que existan
const { authenticate } = require('../middlewares/auth'); // Middleware de autenticación JWT
const authorize = require('../middlewares/authorize');
// --- Middleware de Logging para TODAS las rutas de este router ---
router.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] Petición recibida en roleRoutes: ${req.method} ${req.originalUrl}`);
    // console.log(`>>> Headers Recibidos (Roles):`, { /* ... opcional ... */ });
    next();
});

// --- Definición de Rutas Específicas ---

// GET /api/roles (Obtener todos)
router.get(
    '/',
    authenticate,
    authorize('acceso_roles'), // ¡Usa el nombre de permiso correcto!
    roleController.getAllRoles // Asegúrate que este controlador exista y funcione
);

// GET /api/roles/:id (Obtener uno por ID)
router.get(
    '/:id',
    authenticate,
    authorize('acceso_roles'), // ¡Usa el nombre de permiso correcto!
    getRoleByIdValidation,
    roleController.getRoleById
);

// POST /api/roles (Crear nuevo rol)
// Nota: Crear rol generalmente no implica carga de archivos como servicios
router.post(
    '/',
    authenticate,
    authorize('crearRoles'), // ¡Usa el nombre de permiso correcto!
    createRoleValidation,
    roleController.createRole
);

// PUT /api/roles/:id (Actualizar rol existente)
router.put(
    '/:id',
    authenticate,
    authorize('actualizarRoles'), // ¡Usa el nombre de permiso correcto!
    updateRoleValidation,
    roleController.updateRole
);

// DELETE /api/roles/:id (Eliminar rol)
router.delete(
    '/:id',
    authenticate,
    authorize('eliminarRoles'), // ¡Usa el nombre de permiso correcto!
    deleteRoleValidation,
    roleController.deleteRole
);

module.exports = router;