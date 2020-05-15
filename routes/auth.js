const passport = require("passport");
const router = require('express').Router();
const { authController } = require('../controllers')
const { upload } = require('../utils');
const { payloadValidation } = require('../middleware')
const { auth } = require('../schemas')

//GET routes
router.get('/register',authController.getRegister);
router.get('/login',authController.getLogin)
router.get("/logout",authController.getLogout);
router.get("/forgot",authController.getForgot)
router.get('/reset/:token', authController.getReset);

//POST ROUTES
router.post("/forgot", payloadValidation(auth.forgotPassword) , authController.postForgot);
router.post('/reset/:token',authController.postReset);
router.post("/login",payloadValidation(auth.login) ,passport.authenticate("local",{
  successFlash:("success","Nice to have you here again!"),
  successRedirect: 'back',
  failureFlash:("error","Your login or password are not correct, please try again!"),
  failureRedirect:'back'
}));
router.post('/register', [ upload.single('avatar'),payloadValidation(auth.register)],authController.postRegister)

module.exports = router;