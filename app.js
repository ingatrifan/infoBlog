const express       = require("express");
const bodyParser    = require("body-parser");
const mongoose      = require('mongoose');
const passportLocal = require('passport-local');
const flash         = require('connect-flash');
const methodOverride= require('method-override');
const exprSanitizer = require('express-sanitizer');
const app           = express();
const passport      = require('passport');
const dotenv        = require('dotenv')
 
const db = require('./models');

const cloudinary = require('cloudinary');
dotenv.config();
cloudinary.config({ 
  cloud_name: 'infoblog', 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

const router = require('./routes');


mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("connected successfully to db"));

app.use((req, res, next) => {
  req.db = db
  next()
})
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(exprSanitizer());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.moment = require('moment');
    next();
})
app.use('/',router);

app.listen(process.env.PORT || 8000,function(){
    console.log("listening...");
})