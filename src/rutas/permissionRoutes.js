const express = require('express');
const router = express.Router();
const permissionController = require('../controladores/permissionController');
const { createPermissionValidation, updatePermissionValidation, deletePermissionValidation, getPermissionByIdValidation } = require('../middlewares/permissionValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
router.post('/', authenticate, authorize('acceso_permisos'), createPermissionValidation, permissionController.createPermission);
router.get('/', authenticate, authorize('acceso_permisos'), permissionController.getAllPermissions);
router.get('/:id', authenticate, authorize('acceso_permisos'), getPermissionByIdValidation, permissionController.getPermissionById);
router.put('/:id', authenticate, authorize('acceso_permisos'), updatePermissionValidation, permissionController.updatePermission);
router.delete('/:id', authenticate, authorize('acceso_permisos'), deletePermissionValidation, permissionController.deletePermission);

module.exports = router;