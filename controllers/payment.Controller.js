const razorpay = require('../app')
const Payment = require('../models/payment.Model');
const User = require('../models/user.Model');
const AppError = require('../utils/errorApi');

const getRazorpayApiKeyHandler = async (req, res, next) => {
   try {
    res.status(200).json({
      success: true,
      message: 'Razarpay API key',
      key: process.env.RAZORPAY_KEY_ID
    })
   } catch (error) {
      return next(new AppError(error.message, 500));
   }
}

const buySubscriptionHandler = async (req, res, next) => {
    try {
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
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const verifySubscriptionHandler = async (req, res, next) => {
  try {
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
     
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
}

const cancelSubscriptionHandler = async (req, res, next) => {
      try {
        const {id} = req.user;
  
        const user = await User.findById(id);
  
        if(!user){
          return next(new AppError('Unauthorized, please login', 400));
       }
  
       if(user.role === 'ADMIN'){
            return next(new AppError('Admin cannot cancel a subscription', 400));
       }
  
       const subscriptionId = user.subscription.id;
  
       const subscription = await razorpay.subscriptions.cancel(
          subscriptionId,
       )
  
       user.subscription.status = subscription.status;
  
       await user.save();
      } catch (error) {
          return next(new AppError(error.message, 500));
      }
     
}

const allPaymentsHandler = async (req, res, next) => {
    try {
         const {count} = req.query;
    
         const subscriptions = await razorpay.subscriptions.all({
            count: count || 10,
    
         });
    
         res.status(200).json({
            success: true,
            message: 'All payments',
            subscriptions
         })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

module.exports = {
    getRazorpayApiKeyHandler,
    buySubscriptionHandler,
    verifySubscriptionHandler,
    cancelSubscriptionHandler,
    allPaymentsHandler
}
