import User from "../models/user.Model";
import AppError from "../utils/errorApi";


export const registerHandler = async (req,res,next) => {
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


};

export const loginHandler = async (req,res,next) => {

}
export const logoutHandler = async (req,res,next) => {

}
export const getProfileHandler =async (req,res,next) => {

}