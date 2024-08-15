const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
 razorpay_payment_id: {
    type: String,
    required: true,
 },
 razorpay_subscription_id: {
    type: String,
    required: true,
 },
 razorpay_signature: {
    type: String,
    required: true,
 }
},{timestams:true});

const Payment = mongoose.model("payment", paymentSchema);

module.exports = Payment;