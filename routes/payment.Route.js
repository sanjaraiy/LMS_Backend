const express = require('express');
const { getRazorayApiKeyHandler, buySubscriptionHandler, verifySubscriptionHandler, cancelSubscriptionHandler, allPaymentsHandler } = require('../controllers/payment.Controller');

const router = express.Router();

router
    .route('/razorpay-key').get(getRazorayApiKeyHandler)

router
    .route('/subscribe').post(buySubscriptionHandler)

router
    .route('/verify').post(verifySubscriptionHandler)

router
    .route('/unsubscribe').post(cancelSubscriptionHandler)

router 
    .route('/').get(allPaymentsHandler)




module.exports = router;