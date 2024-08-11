const express = require('express');
const { registerHandler, loginHandler, logoutHandler, getProfileHandler, forgotPasswordHandler, resetPasswordHandler } = require('../controllers/user.Controller');
const isLoggedIn = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');

//======= Isolated router for user =============
const router = express.Router();

router.post('/register', upload.single("avatar"), registerHandler);
router.post('/login', loginHandler);
router.get('/logout', logoutHandler);
router.get('/me',isLoggedIn, getProfileHandler);
router.post('/reset', forgotPasswordHandler);
router.post('/reset/:resetToken', resetPasswordHandler);
router.post('/change-password', isLoggedIn, changePasswordHandler);
router.put('/update', isLoggedIn, upload.single('avatar'), updateUserHandler);


module.exports = router;