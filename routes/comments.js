var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//CREATE COMMENT ROUTE
router.post('/blogs/:id/comments',middleware.isLoggedIn,function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if (err){
            console.log(err);
            req.flash('error',"Something went wrong...")
            res.redirect("/blogs/"+req.params.id);
        } else {
            Comment.create(req.body.comment,function(err,newComment){
                if (err){
                    console.log(err);
                } else {
                    console.log(req.user);
                    newComment.author.avatar = req.user.avatar;
                    newComment.author.id= req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    foundBlog.comments.push(newComment);
                    foundBlog.save();
                    res.redirect('/blogs/'+foundBlog._id);
                }
            })
        }
    })
})
//EDIT COMMENT ROUTE
router.get('/blogs/:id/comments/:comment_id/edit',middleware.CheckCommentOwner,function(req,res){
    Comment.findById(req.params.comment_id,function(err,foundComment){
        res.render('comments/edit',{blog_id:req.params.id,comment:foundComment});
    })
})
//UPDATE COMMENT ROUTE
router.put('/blogs/:id/comments/:comment_id',middleware.CheckCommentOwner,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(){
        req.flash('success',"Your comment was successfully edited!")
        res.redirect('/blogs/'+req.params.id);
    })
});
//DELETE ROUTE
router.delete('/blogs/:id/comments/:comment_id',middleware.CheckCommentOwner,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(){
        req.flash('success',"Your comment was successfully deleted!")
        res.redirect('/blogs/'+req.params.id);
    })
});

module.exports = router;