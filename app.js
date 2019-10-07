var express       = require("express"),
    bodyParser    = require("body-parser"),
    mongoose      = require('mongoose'),
    passport      = require('passport'),
    passportLocal = require('passport-local'),
    Blog          = require('./models/blog'),
    Comment       = require('./models/comment'),
    User          = require('./models/user'),
    flash         = require('connect-flash'),
    methodOverride= require('method-override'),
    exprSanitizer = require('express-sanitizer'),
    app           = express();
    
var blogRoutes = require('./routes/blogs'),
    commentRoutes = require('./routes/comments'),
    userRoutes    = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/infoblog' , { useNewUrlParser: true } );

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(exprSanitizer());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"I prefer dogs over cats",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.moment = require('moment');
    next();
})
//APP ROUTES
app.use(blogRoutes);
app.use(commentRoutes);
app.use(userRoutes);

app.listen(process.env.Port || 3000,function(){
    console.log("listening...");
})