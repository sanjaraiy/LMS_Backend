const User = require("../models/user.Model");
const AppError =  require( "../utils/errorApi");
const cloudinary = require('cloudinary');
const fs = require('fs/promises');
const sendEmail = require('../utils/sendEmail');

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true,
}

const registerHandler = async (req,res,next) => {
     const {fullName, email, password} = req.body;

     if(!fullName || !email || !password){
         return next(new AppError('All fields are required', 400));
     }

     const userExist = await User.findOne({email});

     if(userExist){
        return next(new AppError('Email  already exists', 400));
     }

     const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://res.cloudinary.com/'
        }
     })

     if(!user){
        return next(new AppError('User registration failed, please try again', 400));
     }

     //file Upload
     if(req.file){
         
        console.log("File Details: ", req.file);
        

        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            })

            if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                //remove file from server
                fs.rm(`uploads/${req.file.filename}`)

            }
        } catch (error) {
             return next(new AppError(error || 'File not uploaded, please try again', 400));
        }
    }

     await user.save();
    
    user.password = undefined;

    const token = await user.generateJWTToken();
    
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
     });


};

const loginHandler = async (req,res,next) => {
   try {
     const {email, password} = req.body;
 
     if(!email || !password){
          return next(new AppError('Please fields are required', 400));
     }
 
     const user = await User.findOne({
         email
     }).select('+password');
 
     if(!user || !user.comparePassword(password)){
         return next(new AppError('Email or password does not match', 400));
     }
 
     const token = await user.generateJWTToken();
     
     user.password = undefined;
     res.cookie('token', token, cookieOptions);
 
     res.status(200).json({
         success: true,
         message: 'User loggedin successfully',
         user,
     })
   } catch (error) {
     return next(new AppError(error.message, 500));
   }


}

const logoutHandler = async (req,res,next) => {
     res.cookie('token',null, {
        secure: true,
        maxAge: 0,
        httpOnly: true,
     })

     res.status(200).json({
        success: true,
        message: 'User logged out successfully'
     })
}

const getProfileHandler =async (req,res,next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        });
    } catch (error) {
         return next(new AppError('Failed to fetch profile', 500));
    }

}


const forgotPasswordHandler = async (req, res, next) =>{
      const {email} =req.body;

      if(!email){
        return next(new AppError('Email is required', 400));
      }

      const isUser = await User.findOne({email});

      if(!isUser){
        return next(new AppError('Email is not registered', 400));
      }

      const resetToken = await isUser.generatePasswordResetToken();

      await isUser.save();

      const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const subject = 'Reset Password';
      const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

      try {
         await sendEmail(email, subject, message);

         res.status(200).json({
            success: true,
            message: `Reset password token has been sent ${email} successfully`
         })
      } catch (error) {
          isUser.forgotPasswordExpiry = undefined;
          isUser.forgotPasswordToken = undefined;

          await isUser.save();
          return next(new AppError(error.message, 500));


      }
}
const resetPasswordHandler = async (req, res, next) =>{

}

module.exports = {
    registerHandler,
    loginHandler,
    logoutHandler,
    getProfileHandler,
    forgotPasswordHandler,
    resetPasswordHandler 
}