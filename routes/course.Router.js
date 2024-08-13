const express = require('express');
const { createCourseHandler, updateCourseHandler, removeCourseHandler, getLectureByCourseIdHandler } = require('../controllers/course.Controller');
const {upload} = require('../middlewares/multer.middleware');

//====== Isolated route for courses ==========
const router = express.Router();

router.route('/')
    .get(getAllCoursesgHandler)
    .post(upload.single('thumbnail'), createCourseHandler)
    


router.route('/:id')
    .get(isLoggedIn, getLectureByCourseIdHandler)
    .put(updateCourseHandler)
    .delete(removeCourseHandler)




module.exports = router;