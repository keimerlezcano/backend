const express = require('express');
const contractController = require('../controladores/contractController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { createContractValidation, updateContractValidation, deleteContractValidation, getContractByIdValidation } = require('../middlewares/contractValidations');

const router = express.Router();

router.get('/', authenticate, authorize('acceso_contratos'), contractController.getAllContracts);
router.get('/:id', authenticate, authorize('acceso_contratos'), contractController.getContractById);
router.post('/', authenticate, authorize('crearContratos'), createContractValidation, contractController.createContract);
router.put('/:id', authenticate, authorize('actualizarContratos'), updateContractValidation, contractController.updateContract);
router.delete('/:id', authenticate, authorize('eliminarContratos'), contractController.deleteContract);

module.exports = router;