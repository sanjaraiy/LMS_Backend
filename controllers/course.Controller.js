const Course = require("../models/course.Model");
const AppError = require("../utils/errorApi");
const fs = require('fs/promises');
const cloudinary = require('cloudinary');

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

      try {
        const course = await Course.create({
          title,
          description,
          category,
          createdBy,
          thumbnail: {
             public_id: 'Dummy',
             secure_url: 'Dummy',
          },
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
        })
      } catch (error) {
         return next(new AppError(error.message, 500));
      }
}

const updateCourseHandler = async (req, res, next) => {
   try {
      const {id} = req.params;
      const course = await Course.findByIdAndUpdate(
        id,
        {
            $set: req.body
        },
        {   //It validates the incoming data as per course model(courseSchema)
            runValidators: true
        }
      );

      if(!course){
         return next(new AppError('Course with given id does not exist', 500));
      }

      res.status(200).json({
        success: true,
        message: 'Course updated successfully!',
        course
      })
   } catch (error) {
      return next(new AppError(e.message, 500));
   }
}

const removeCourseHandler = async (req, res, next) => {
     try {
        const {id} = req.params;
        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('Course with given id does not exist',500));
        }

        await Course.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        })
     } catch (error) {
        return next(new AppError(e.message, 500));
     }
}


const addLectureToCourseByIdHandler = async (req, res, next) => {
    const {title, description} = req.body;
    const {id} = req.params;
    
    if(!title || !description || !id){
        return next(new AppError('All fields are required', 400));
    }
    
    try {

    const course = await Course.findById(id);

    if(!course){
        return next(new AppError('Course does not exist', 400));
    }
   
    const lectureData = {
        title,
        description,
        lecture: {}
    };

  
    if(req.file){
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms'
        });
        if(result){
            lectureData.lecture.public_id = result.public_id;
            lectureData.lecture.secure_url = result.secure_url;
        }

        fs.rm(`upload/${req.file.filename}`);
      }

      course.lectures.push(lectureData);
      course.numbersOfLectures = course.lectures.length;
  
      await course.save();
  
      res.status(200).json({
          success: true,
          message: 'Lecture successfully added to the course',
          course,
      });

    } catch (error) {
       return next(new AppError(error.message, 500));
    }

   

}

const removeLectureFromCourseHandler = async (req, res, next) => {
    const { courseId, lectureId } = req.params;

    if (!courseId || !lectureId) {
        return next(new AppError('All fields are required', 400));
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return next(new AppError('Course does not exist', 404));
        }

        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId
        );

        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found', 404));
        }

        const lecture = course.lectures[lectureIndex];

        // Remove lecture from Cloudinary if it exists
        if (lecture.lecture && lecture.lecture.public_id) {
            await cloudinary.v2.uploader.destroy(lecture.lecture.public_id);
        }

        // Remove lecture from course
        course.lectures.splice(lectureIndex, 1);
        course.numbersOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture successfully removed from the course',
            course,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};


module.exports = {
    getAllCoursesgHandler,
    getLectureByCourseIdHandler,
    createCourseHandler,
    updateCourseHandler,
    removeCourseHandler,
    addLectureToCourseByIdHandler,
    removeLectureFromCourseHandler,
}