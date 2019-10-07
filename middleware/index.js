var Blog = require("../models/blog");
var Comment = require("../models/comment");
var User = require("../models/user");
var middlewareObj = {};

middlewareObj.CheckBlogOwner = function(req,res,next){
    if (req.isAuthenticated()){
        Blog.findById(req.params.id,function(err,foundBlog){
            if (err){
                console.log(err);
                req.flash('error',"Something went wrong...")
                res.redirect('back');
            } else {
                if (foundBlog.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error","You have not permission to do that!")
                    res.redirect('back');
                }
            }
        })
    }else {
        req.flash("error","Please,log in first!")
        res.redirect("back")
    }
}
middlewareObj.CheckCommentOwner = function(req,res,next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if (err){
                console.log(err)
                req.flash('error','Something went wrong');
                res.redirect('back');
            } else {
                if (foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error","You have not permission to do that!")
                    res.redirect('back');
                }
            }
        })
    }else {
        req.flash("error","Please,log in first!")
        res.redirect("back")
    }
}
middlewareObj.checkUser = function(req,res,next){
    if(req.isAuthenticated()){
        User.findById(req.params.id,function(err,foundUser){
            if (err){
                console.log(err);
                req.flash("error", "An undefiend error occur , please try again later!");
                res.redirect("back");
            } else {
                if (foundUser._id.equals(req.user._id)){
                    next();
                }else {
                    req.flash("error","You have not permision to do that!")
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error","Please, log in first!")
        res.redirect("back")
    }
}

middlewareObj.isLoggedIn = function(req,res,next){
    if (req.isAuthenticated()){
        return next();
    } else {
        req.flash('error','You must login first !')
        res.redirect('back');
    }
}

module.exports = middlewareObj;