const express = require('express');
const { registerHandler, loginHandler, logoutHandler, getProfileHandler } = require('../controllers/user.Controller');
const isLoggedIn = require('../middlewares/auth.middleware');

//======= Isolated router for user =============
const router = express.Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/logout', logoutHandler);
router.get('/me',isLoggedIn, getProfileHandler);



module.exports = router;