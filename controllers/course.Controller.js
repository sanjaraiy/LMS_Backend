const Course = require("../models/course.Model");
const AppError = require("../utils/errorApi");
const fs = require('fs/promises');

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

const createCourseHandler = async (req, res, next) => {
      const {title, description, category, createdBy} = req.body;

      if(!title || !description || !category || !createdBy){
        return next(new AppError('All fields are required', 400));
      }

      const course = await Course.create({
        title,
        description,
        category,
        createdBy,
      });

      if(!course){
         return next(new AppError('Course could not created, please try again', 500));
      }

      if(req.file){
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms'
        });
        if(result){
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
        }

        fs.rm(`upload/${req.file.filename}`);
      }

      await course.save();
      res.status.json({
        success: true,
        message: 'Course created successfully',
        course,
      });
}

const updateCourseHandler = async (req, res, next) => {

}

const removeCourseHandler = async (req, res, next) => {
     
}

module.exports = {
    getAllCoursesgHandler,
    getLectureByCourseIdHandler,
    createCourseHandler,
    updateCourseHandler,
    removeCourseHandler,
}