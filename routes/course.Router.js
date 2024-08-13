const express = require('express');
const { createCourseHandler, updateCourseHandler, removeCourseHandler, getLectureByCourseIdHandler, getAllCoursesgHandler } = require('../controllers/course.Controller');
const upload = require('../middlewares/multer.middleware');
const {isLoggedIn, authorizedRoles} = require('../middlewares/auth.middleware');

//====== Isolated route for courses ==========
const router = express.Router();

router.route('/')
    .get(getAllCoursesgHandler)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('thumbnail'), createCourseHandler)
    


router.route('/:id')
    .get(isLoggedIn, getLectureByCourseIdHandler)
    .put(isLoggedIn ,authorizedRoles('ADMIN'), updateCourseHandler)
    .delete(isLoggedIn ,authorizedRoles('ADMIN'), removeCourseHandler)
    .post(isLoggedIn ,authorizedRoles('ADMIN'), addLectureToCourseByIdHandler)




module.exports = router;