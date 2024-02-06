const express = require('express')
const authController = require('../controllers/authController')
const tourController = require('../controllers/toursController')
const router = express.Router();

//router.param('id', tourController.checkID)

router
    .route('/Tourstats')
    .get(tourController.getTourStats)

router
    .route('/')
    .get(authController.protect,tourController.getAllTours)
    .post(tourController.addOneTour)


router
    .route('/:id')
    .get(tourController.getOneTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin','lead'),
        tourController.deleteTour
        )


module.exports = router