const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const validators = require('../validators/validatorMiddleware');
const router = express.Router();

router.post('/login',validators.validateLogin, authController.login);
router.post('/signup', validators.validateSignup, authController.signup);
router.use(authController.protect);
router.get('/userDetails', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.use(authController.restrictTo('admin'));
router.get('/allUsers', validators.getAllUsers, userController.getAllUsers);
router.get('/topUsers',  userController.getTopLoginFrequency);
router.get('/inactive-users',validators.getInActiveUsersValidation, userController.getInactiveUsers);



module.exports = router;
