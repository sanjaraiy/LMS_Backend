const razorpay = require("../utils/razorpay");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const AppError = require("../utils/errorApi");
const crypto = require("crypto");

const getRazorpayApiKeyHandler = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Razarpay API key",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const buySubscriptionHandler = async (req, res, next) => {
  try {
    const { id } = req.user;

    // Fetch user from DB
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized, please login", 401));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin cannot purchase a subscription", 403));
    }

    // Ensure the plan ID exists in env
    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      return next(
        new AppError(
          "Subscription plan ID not found in environment variables.",
          500
        )
      );
    }

    console.log("Using Razorpay Plan ID:", planId);

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
    });

    if (!subscription || !subscription.id) {
      return next(
        new AppError("Failed to create subscription with Razorpay.", 500)
      );
    }

    // Save subscription info to user
    user.subscription = {
      id: subscription.id,
      status: subscription.status,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Subscribed Successfully",
      subscription_id: subscription.id,
    });
  } catch (error) {
    console.error("Subscription Error:", error);
    return next(new AppError(error.message || "Something went wrong!", 500));
  }
};

// const verifySubscriptionHandler = async (req, res, next) => {
//    try {
//      const { id } = req.user;
//      const {
//        razorpay_payment_id,
//        razorpay_signature,
//        razorpay_subscription_id
//      } = req.body;

//      console.log(razorpay_payment_id, razorpay_signature, razorpay_subscription_id);

//      const user = await User.findById(id);

//      if (!user) {
//        return next(new AppError('Unauthorized, please login', 400));
//      }

//      const subscriptionId = user.subscription.id;

//      // Correct way: HMAC with secret key
//      const generatedSignature = crypto
//        .createHmac('sha256', process.env.RAZORPAY_SECRET)
//        .update(`${razorpay_payment_id}|${subscriptionId}`)
//        .digest('hex');

//        console.log('Generated Signature:', generatedSignature);
//        console.log('Received Signature:', razorpay_signature);

//      if (generatedSignature !== razorpay_signature) {
//        return next(new AppError('Payment not verified, please try again', 400));
//      }

//      await Payment.create({
//        razorpay_payment_id,
//        razorpay_signature,
//        razorpay_subscription_id,
//      });

//      user.subscription.status = 'active';
//      await user.save();

//      res.status(200).json({
//        success: true,
//        message: 'Payment verified successfully!',
//      });

//    } catch (error) {
//      return next(new AppError(error.message, 500));
//    }
//  };

const verifySubscriptionHandler = async (req, res, next) => {
  try {
    const { id } = req.user;
    const {
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = req.body;

  

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized, please login", 400));
    }

   

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    

    if (generatedSignature !== razorpay_signature) {
      return next(new AppError("Payment not verified, please try again", 500));
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const cancelSubscriptionHandler = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Unauthorized, please login", 400));
    }

    if (user.role === "ADMIN") {
      return next(new AppError("Admin cannot cancel a subscription", 400));
    }

    const subscriptionId = user.subscription.id;

    const subscription = await razorpay.subscriptions.cancel(subscriptionId);

    user.subscription.status = subscription.status;

    await user.save();
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const allPaymentsHandler = async (req, res, next) => {
  try {
    const { count } = req.query;

    const subscriptions = await razorpay.subscriptions.all({
      count: count || 10,
    });

    res.status(200).json({
      success: true,
      message: "All payments",
      subscriptions,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

module.exports = {
  getRazorpayApiKeyHandler,
  buySubscriptionHandler,
  verifySubscriptionHandler,
  cancelSubscriptionHandler,
  allPaymentsHandler,
};
