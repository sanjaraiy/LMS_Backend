const Course = require("../models/course.Model");
const AppError = require("../utils/errorApi");


const getAllCoursesgHandler = async (req, res, next) => {
    try {
         const courses = await Course.find({}).select('-lectures'); 
         
         res.status(200).json({
            success: true,
            message: 'All courses',
            courses,
         })
    } catch (error) {
         return next(new AppError(error.message, 500))
    }
}

const getLectureByCourseIdHandler = async (req, res, next) => {
    try {
        const {id} = req.params;

        const course = await Course.findById(id);
         
        if(!course){
            return next(new AppError('Invalid course id', 400));
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures
        })
        
        res.status(200).json({
           success: true,
           message: 'All courses',
           courses,
        })
   } catch (error) {
        return next(new AppError(error.message, 500))
   }
}

module.exports = {
    getAllCoursesgHandler,
    getLectureByCourseIdHandler,
}