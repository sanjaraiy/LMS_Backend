const Razorpay = require('razorpay');

console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

module.exports = razorpay;