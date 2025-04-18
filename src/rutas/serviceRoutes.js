// src/rutas/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controladores/serviceController');
// Solo importamos validaciones de params
const { updateServiceValidation, deleteServiceValidation, getServiceByIdValidation } = require('../middlewares/serviceValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const uploadMiddleware = require('../middlewares/upload');

router.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] Petición recibida en serviceRoutes: ${req.method} ${req.originalUrl}`);
    next();
});

// GET /api/services
router.get( '/',
    authenticate,
    authorize('acceso_servicios'), // Reemplaza con tu permiso real
    serviceController.getAllServices
);

// GET /api/services/:id
router.get( '/:id',
    authenticate,
    authorize('ver_servicio_detalle'), // Reemplaza con tu permiso real
    getServiceByIdValidation,
    serviceController.getServiceById
);

// POST /api/services (Crear) - Sin validación de body aquí
router.post( '/',
    authenticate,
    authorize('crearServicios'),     // Reemplaza con tu permiso real
    uploadMiddleware,               // Multer primero
    // Validación se hace en el controlador ahora
    serviceController.createService
);

// PUT /api/services/:id (Actualizar) - Solo validación de param aquí
router.put( '/:id',
    authenticate,
    authorize('actualizarServicios'), // Reemplaza con tu permiso real
    uploadMiddleware,               // Multer primero
    updateServiceValidation,        // Solo valida el param 'id'
    // Validación del body se hace en el controlador ahora
    serviceController.updateService
);

// DELETE /api/services/:id
router.delete( '/:id',
    authenticate,
    authorize('eliminarServicios'), // Reemplaza con tu permiso real
    deleteServiceValidation,
    serviceController.deleteService
);

module.exports = router;