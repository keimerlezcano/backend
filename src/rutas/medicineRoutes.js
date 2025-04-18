const express = require('express');
const router = express.Router();
const medicineController = require('../controladores/medicineController');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { medicineCreateValidation, medicineUpdateValidation, medicineIdValidation } = require('../middlewares/medicineValidation');

router.post('/', authenticate, authorize('crearMedicina'), medicineCreateValidation, medicineController.createMedicine);
router.get('/', authenticate, authorize('acceso_medicina'), medicineController.getAllMedicines);
router.get('/:id', authenticate, authorize('acceso_medicina'), medicineIdValidation, medicineController.getMedicineById);
router.put('/:id', authenticate, authorize('actualizarMedicina'), medicineUpdateValidation, medicineController.updateMedicine);
router.delete('/:id', authenticate, authorize('eliminarMedicina'), medicineIdValidation, medicineController.deleteMedicine);

module.exports = router;