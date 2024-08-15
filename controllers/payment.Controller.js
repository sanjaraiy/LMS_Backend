const razorpay = require('../app')
const Payment = require('../models/payment.Model');
const User = require('../models/user.Model');
const AppError = require('../utils/errorApi');

const getRazorpayApiKeyHandler = async (req, res, next) => {
   res.status(200).json({
     success: true,
     message: 'Razarpay API key',
     key: process.env.RAZORPAY_KEY_ID
   })
}

const buySubscriptionHandler = async (req, res, next) => {
     const {id} = req.user;
     
     const user = await User.findById(id);

     if(!user){
        return next(new AppError('Unauthorized, please login', 400));
     }

     if(user.role === 'ADMIN'){
          return next(new AppError('Admin cannot purchase a subscription', 400));
     }

     const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1
     });

     user.subscription.id = subscription.id;
     user.subscription.status = subscription.status;

     await user.save();

     res.status(200).json({
        success: true,
        message: 'Subscribed Successfully',
        subscription_id: subscription.id
     });
}

const verifySubscriptionHandler = async (req, res, next) => {
   const {id} = req.user;
   const {razorpay_payment_id, razorpay_signature, razorpay_subscription_id} = req.body;

   const user = await User.findById(id);

   if(!user){
    return next(new AppError('Unauthorized, please login', 400));
   }

   const subscriptionId = user.subscription.id;
   
   const generatedSignature = crypto
                                 .createHash('sha256', process.env.RAZORPAY_SECRET)
                                 .update(`${razorpay_payment_id} | ${subscriptionId}`)
                                 .digest('hex');
    
    if(generatedSignature !== razorpay_signature){
         return next(new AppError('Payment not verified, please try again', 500));
    } 

    await Payment.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
    });

    user.subscription.status = 'active';
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Payment verified successfully!'
    })
   
}

const cancelSubscriptionHandler = async (req, res, next) => {
    
}

const allPaymentsHandler = async (req, res, next) => {

}

module.exports = {
    getRazorpayApiKeyHandler,
    buySubscriptionHandler,
    verifySubscriptionHandler,
    cancelSubscriptionHandler,
    allPaymentsHandler
}
