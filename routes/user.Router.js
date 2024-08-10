const express = require('express');
const { registerHandler, loginHandler, logoutHandler, getProfileHandler } = require('../controllers/user.Controller');

//======= Isolated router for user =============
const router = express.Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/logout', logoutHandler);
router.get('/me', getProfileHandler);



module.exports = router;