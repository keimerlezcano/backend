const express = require('express');
const router = express.Router();
const ClientController = require('../controladores/clientController');
const { ValidateClient } = require('../middlewares/clientValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
router.post('/', authenticate, authorize('crearClientes'), ValidateClient, ClientController.createClient);
router.get('/', authenticate, authorize('acceso_clientes'), ClientController.getAllClients);
router.get('/:id', authenticate, authorize('acceso_clientes'), ClientController.getClientById);
router.put('/:id', authenticate, authorize('actualizarClientes'), ValidateClient, ClientController.updateClient);
router.delete('/:id', authenticate, authorize('eliminarClientes'), ClientController.deleteClient);

module.exports = router;