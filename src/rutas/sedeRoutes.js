const { Router } = require('express');
const validateSede = require('../middlewares/sedevalidation');  
const sedeController = require('../controladores/sedeController.js');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = Router();

router.get('/', authenticate, authorize('acceso_sedes'), sedeController.getSedes);
router.get('/:id', authenticate, authorize('acceso_sedes'), sedeController.getSedeById);
router.post('/', authenticate, authorize('crearSedes'), validateSede.createSedeValidation, sedeController.addSede);
router.put('/:id', authenticate, authorize('actualizarSedes'), sedeController.updateSede);
router.delete('/:id', authenticate, authorize('eliminarSedes'), sedeController.deleteSede);
module.exports = router; 