const httpStatusCodes = require("http-status-codes");
const { criptToken,sendMail }  = require('../utils')
const cloudinary = require('cloudinary');
const passport = require('passport');


exports.postRegister = async(req,res) =>{
    try {
        let password = req.body.password;
        req.body.password = undefined;
        let image = await cloudinary.v2.uploader.upload(req.file.path);

        const newUser = new req.db.User({
            avatar:image.secure_url,
            avatarId:image.public_id,
            ...req.body
        });
        await req.db.User.register(newUser,password)
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Hello "+req.body.username+", thank you for joining our community <3")
            return res.status(httpStatusCodes.OK).redirect('/')
        })
    } catch (error) {
        console.log(error);
        req.flash('error',error.message);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect("/register");
    }
}

exports.getRegister = async(req,res) =>{
    try {
        res.render('users/register');
    } catch (error) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            succes: false,
            message: "Somthing bad happend!"
        });
    }
}
exports.getLogin = async(req,res) =>{
    try {
        req.flash('error',"Please log in");
        res.redirect('/')
    } catch (error) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            succes: false,
            message: "Somthing bad happend!"
        });
    }
}

exports.getLogout = async(req,res) =>{
    try {
        req.logout();
        req.flash("success","Have a nice day!"),
        res.redirect('back');
    } catch (error) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            succes: false,
            message: "Somthing bad happend!"
        });
    }
}

exports.postForgot = async(req,res,next) =>{
    try {
        let token = criptToken();
        let user = await req.db.User.findOne({email:req.body.email})
        if(!user){
            req.flash('error',"No account with that email exists.");
            return res.status(httpStatusCodes.NOT_FOUND).redirect('/forgot')
        }
        user.resetPasswordToken= token;
        user.resetPasswordExpires = Date.now()+3600000;
        user.save()
        console.log(token);
        var mail = {
            to:user.email,
            mailType:'resetPasswordMail',
            link:'http://'+req.headers.host+'/reset/'+token+'\n\n'
        };
        sendMail(mail);
        req.flash('success','An email was sent to '+req.body.email + ' with further instructions');
        return res.status(httpStatusCodes.OK).redirect('/')
    } catch (error) {
        req.flash('error',"Something went wrong...")
        console.log(error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('/forgot');
    }
}
exports.getForgot = async(req,res) => {
    try {
        res.render("users/forgot");
    } catch (error) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            succes: false,
            message: "Somthing bad happend!"
        });
    }
}

exports.getReset = async(req,res) => {
    try {
        let user = await req.db.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.status(httpStatusCodes.NOT_FOUND).redirect('/forgot');
        }
        return res.status(httpStatusCodes.OK).render('users/reset', {token: req.params.token});
    } catch (error) {
        console.error(error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            succes: false,
            message: "Somthing bad happend!"
        });
    }
}
exports.postReset = async(req,res) => {
    try {     
        let user =await req.db.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.status(httpStatusCodes.NOT_FOUND).redirect('back');
        }
        if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, async function(err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save()
                req.logIn(user,function (err){})
            })
            return res.status(httpStatusCodes.OK).redirect('/');
        } else {
            req.flash("error", "Passwords do not match.");
            return res.status(httpStatusCodes.UNAUTHORIZED).redirect('back')
        }
    } catch (error) {   
        console.error(error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('/');
    }
}