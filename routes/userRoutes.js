const express = require('express')
const userContoller = require('../controllers/userController')
const authController = require('../controllers/authController')
const router = express.Router();


//Signup is a special endpoint and should be special
router
    .post('/signup', authController.signup)

router
    .post('/login' , authController.login )

router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

    router 
    .route('/')
    .get(userContoller.getAllUsers)
    .post(userContoller.CreateUser)

router
    .route('/:id') 
    .get(userContoller.getOneUser)
    .patch(userContoller.updateUser)
    .delete(userContoller.deleteUser)


module.exports = router