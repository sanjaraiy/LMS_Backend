const User = require("../models/user.Model");
const AppError =  require( "../utils/errorApi");


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

     //TODO: file Upload

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

module.exports = {
    registerHandler,
    loginHandler,
    logoutHandler,
    getProfileHandler,
}