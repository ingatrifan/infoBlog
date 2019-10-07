var express = require("express"),
    passport = require("passport"),
    User = require("../models/user"),
    Blog = require("../models/blog"),
    middleware = require("../middleware"),
    async =require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto'),
    router = express.Router();

//PHOTO UPLOAD CONFIGURATION
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
  });
  var imageFilter = function (req, file, cb) {
      // accept image files only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
  };
  var upload = multer({ storage: storage, fileFilter: imageFilter})
  
  var cloudinary = require('cloudinary');
  cloudinary.config({ 
    cloud_name: 'infoblog', 
    api_key: '381596136255794', 
    api_secret: '5DgmFfOWuf1nj-6MFUe-L2ZSKxw'
  });



//REGISTER ROUTE
router.get('/register',function(req,res){
    res.render('users/register');
})
//REGISTER LOGIC ROUTE
router.post('/register',upload.single('avatar'),function(req,res){
    cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
        var newUser = new User({
            username:req.body.username,
            name:req.body.name,
            lname:req.body.lname,
            email:req.body.email,
            avatar:result.secure_url,
            avatarId:result.public_id,
            instagram:req.body.instagram,
            facebook:req.body.facebook,
            tumblr:req.body.tumblr,
            description:req.body.description
        });
        User.register(newUser,req.body.password,function(err,user){
            if (err){
                console.log(err);
                req.flash('error',err.message);
                res.redirect("/register");
            } else {   
                passport.authenticate("local")(req,res,function(){
                req.flash("success","Hello "+req.body.username+", thank you for joining our community <3")
                res.redirect('/')
            })
            }
        })
    })
})
//LOGIN ROUTE
router.get('/login',function(req,res){
    req.flash('error',"Please log in");
    res.redirect('/')
    // res.render('users/login');
})
//LOGIN LOGIC ROUTE
router.post("/login",passport.authenticate("local",{
    successFlash:("success","Nice to have you here again!"),
    successRedirect: 'back',
    failureFlash:("error","Your login or password are not correct, please try again!"),
    failureRedirect:'back'
}),function(req,res){});
//LOGOUT ROUTE
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Have a nice day!"),
    res.redirect('back');
});

//SHOW USER ROUTE
router.get('/users/:id',function(req,res){
    User.findById(req.params.id,function(err,foundUser){
        if (err){
            req.flash('error',"This user can't be found")
            res.redirect('back');
        } else {
            Blog.find().where('author.id').equals(foundUser._id).exec(function(err,foundBlogs){
                if (err){
                    req.flash('error','Something went wrong...');
                    res.redirect('back');
                } else {
                    res.render('users/show',{user:foundUser,blogs:foundBlogs});
                }
            })
        }
    })
});
//EDIT USER PROFILE ROUTE
router.get('/users/:id/edit',middleware.checkUser,function(req,res){
    User.findById(req.params.id,function(err,foundUser){
        res.render('users/edit',{user:foundUser});
    })
})
//EDIT USER PROFILE ROUTE
router.put('/users/:id',middleware.checkUser,upload.single('avatar'),function(req,res){
    User.findById(req.params.id,async function(err,foundUser){
        if (err){
            req.flash("error","Something went wrong,please try again");
            res.redirect('back')
        } else{
            if (req.file){
                try{
                    await cloudinary.v2.uploader.destroy(foundUser.avatarId)
                    var result =await cloudinary.v2.uploader.upload(req.file.path);
                    foundUser.avatar = result.secure_url;
                    foundUser.avatarId = result.public_id;
                }catch(err){
                    req.flash("error","Something went wrong,please try again");
                    return res.redirect('back')
                }
            }
            foundUser.name =req.body.name
            foundUser.lname= req.body.lname
            foundUser.email= req.body.email
            foundUser.instagram=req.body.instagram;
            foundUser.facebook=req.body.facebook;
            foundUser.tumblr=req.body.tumblr;
            foundUser.description=req.body.description;
            foundUser.save();
            req.flash("success","Successfully updated");
            res.redirect("/users/"+req.params.id)
        }
    })
})
//USER FORGOT PASSWORD ROUTE
router.get("/forgot",function(req,res){
    res.render("users/forgot");
})
//USER FORGOT PASSWORD ROUTE
router.post("/forgot",function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20,function(err,buf){
                var token = buf.toString('hex');
                done(err,token);
            });
        },
        function(token,done){
            User.findOne({email:req.body.email},function(err,user){
                if(!user){
                    req.flash('error',"No account with that email exists.");
                    res.redirect('/forgot')
                } else {
                    user.resetPasswordToken= token;
                    user.resetPasswordExpires = Date.now()+3600000;
                    user.save(function(err){
                        done(err,token,user);
                    })
                }
            })
        },
        function(token,user,done){
            var Transport = nodemailer.createTransport({
                service :'Gmail',
                auth : {
                    user : 'blog.assist1@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var MailOption = {
                to:user.email,
                from : 'blog.assist1@gmail.com',
                Subject : 'infoBlog password reset',
                text : "Please click on this link or paste it into your browser to complete the process "+
                        'http://'+req.headers.host+'/reset/'+token+'\n\n'+
                        'If you did not request this , please ignore this email'
            };
            Transport.sendMail(MailOption,function(err){
                req.flash('succes','An email was sent to '+user.email + ' with further instructions');
                done(err,'done');
            })
        }
    ],function(err){
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

//RESET PASSWORD FORM
router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        console.log(user);
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('users/reset', {token: req.params.token});
    });
  });

  //RESET LOGIC ROUTE
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  });

module.exports = router;