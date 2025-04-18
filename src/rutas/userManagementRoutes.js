// src/rutas/userManagementRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controladores/userController'); // Importar TODOS los controladores
const { updateUserValidation } = require('../middlewares/userValidations'); // Importar validación de update
const { authenticate } = require('../middlewares/auth'); // Importar middleware de autenticación

router.use(authenticate); 

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);

router.put('/:id', updateUserValidation, userController.updateUser); 

router.delete('/:id', userController.deleteUser);

module.exports = router;