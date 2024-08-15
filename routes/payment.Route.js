const express = require('express');
const { getRazorpayApiKeyHandler, buySubscriptionHandler, verifySubscriptionHandler, cancelSubscriptionHandler, allPaymentsHandler } = require('../controllers/payment.Controller');
const { isLoggedIn, authorizedRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router
    .route('/razorpay-key').get(isLoggedIn, getRazorpayApiKeyHandler)

router
    .route('/subscribe').post(isLoggedIn, buySubscriptionHandler)

router
    .route('/verify').post(isLoggedIn, verifySubscriptionHandler)

router
    .route('/unsubscribe').post(isLoggedIn, cancelSubscriptionHandler)

router 
    .route('/').get(isLoggedIn, authorizedRoles('ADMIN'), allPaymentsHandler)




module.exports = router;