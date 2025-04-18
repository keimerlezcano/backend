const express = require('express');
const router = express.Router();
const specimenController = require('../controladores/specimenController');
const { createSpecimenValidation, updateSpecimenValidation, deleteSpecimenValidation, getSpecimenByIdValidation, moveSpecimenValidation } = require('../middlewares/specimenValidations');
const { authenticate } = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
router.post('/', authenticate, authorize('crearEjemplares'), createSpecimenValidation, specimenController.createSpecimen);
router.get('/', authenticate, authorize('acceso_ejemplares'), specimenController.getAllSpecimens);
router.get('/:id', authenticate, authorize('acceso_ejemplares'), getSpecimenByIdValidation, specimenController.getSpecimenById);
router.put('/:id', authenticate, authorize('actualizarEjemplares'), updateSpecimenValidation, specimenController.updateSpecimen);
router.delete('/:id', authenticate, authorize('eliminarEjemplares'), deleteSpecimenValidation, specimenController.deleteSpecimen);
router.patch('/:id/move', authenticate, authorize('moverEjemplares'), moveSpecimenValidation, specimenController.moveSpecimen);

module.exports = router;