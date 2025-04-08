const express = require('express');
const { createCourseHandler, updateCourseHandler, removeCourseHandler, getLectureByCourseIdHandler, getAllCoursesgHandler, addLectureToCourseByIdHandler, removeLectureFromCourseHandler } = require('../controllers/courseController');
const upload = require('../middlewares/multerMiddleware');
const {isLoggedIn, authorizedRoles, authorizeSubscriber} = require('../middlewares/authMiddleware');

//====== Isolated route for courses ==========
const router = express.Router();

router.route('/')
    .get(getAllCoursesgHandler)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('thumbnail'), createCourseHandler)
    


router.route('/:id')
    .get(isLoggedIn, authorizeSubscriber, getLectureByCourseIdHandler)
    .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourseHandler)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeCourseHandler)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('lecture'), addLectureToCourseByIdHandler)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeLectureFromCourseHandler);



module.exports = router;