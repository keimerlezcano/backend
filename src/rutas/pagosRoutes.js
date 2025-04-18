const { Router } = require('express');
const { createPagoValidation, updatePagoValidation, getPagoByIdValidation } = require('../middlewares/pagosvalidation');
const pagosController = require('../controladores/pagosController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const router = Router();

router.get('/', authenticate, authorize('acceso_pagos'), pagosController.getPagos);
router.get('/:id', authenticate, authorize('acceso_pagos'), getPagoByIdValidation, pagosController.getPagoById);
router.get('/contract/:contractId', authenticate, authorize('acceso_pagos'), pagosController.getPagosByContractId);
router.post('/', authenticate, authorize('crearPagos'), createPagoValidation, pagosController.addPago);
router.put('/:id', authenticate, authorize('actualizarPagos'), updatePagoValidation, pagosController.updatePago);

module.exports = router;