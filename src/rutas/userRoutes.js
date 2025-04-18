const express = require('express');
const router = express.Router();
const userController = require('../controladores/userController');
const { createUserValidation, loginUserValidation } = require('../middlewares/userValidations'); 

router.post('/register', createUserValidation, userController.createUser);
router.post('/login', loginUserValidation, userController.loginUser);

module.exports = router;