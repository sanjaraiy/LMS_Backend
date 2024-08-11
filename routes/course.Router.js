const express = require('express');

//====== Isolated route for courses ==========
const router = express.Router();

router.route('/').get(getAllCoursesgHandler);
router.route('/:id').get(isLoggedIn, getLectureByCourseIdHandler);




module.exports = router;