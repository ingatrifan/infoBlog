const httpStatusCodes = require("http-status-codes");

exports.postComments = async(req,res) =>{
    try {   
        let blog = await req.db.Blog.findById(req.params.id)
        console.log("id " + req.params.id);
        let comment = await req.db.Comment.create(req.body)
        comment.author.avatar = req.user.avatar;
        comment.author.id= req.user._id;
        comment.author.username = req.user.username;
        await comment.save();
        await blog.comments.push(comment);
        await blog.save();
        return res.status(httpStatusCodes.OK).redirect('/blogs/'+blog._id);
    } catch (error) {
        console.log(error);
        req.flash('error',"Something went wrong...")
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect("/blogs/"+req.params.id);
    }
}

exports.putEditComment = async(req,res) =>{
    try {
        await req.db.Comment.findByIdAndUpdate(req.params.comment_id,req.body)
        req.flash('success',"Your comment was successfully edited!")
        return res.status(httpStatusCodes.OK).redirect('/blogs/'+req.params.id);
    } catch (error) {
        console.log(error);
        req.flash('error',"Something went wrong...")
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect("/blogs/"+req.params.id);
    }
}
exports.getEditComment = async(req,res) =>{
    try {
        let comment = await req.db.Comment.findById(req.params.comment_id)
        return res.status(httpStatusCodes.OK).render('comments/edit',{blog_id:req.params.id,comment});  
    } catch (error) {
        console.log(error);
        req.flash('error',"Something went wrong...")
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect("/blogs/"+req.params.id);
    }
}
exports.deleteComment = async (req,res) =>{
    try {
        await req.db.Comment.findByIdAndRemove(req.params.comment_id)
        req.flash('success',"Your comment was successfully deleted!")
        return res.status(httpStatusCodes.OK).redirect('/blogs/'+req.params.id);
    } catch (error) {
        console.log(error);
        req.flash('error',"Something went wrong...")
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect("/blogs/"+req.params.id);
    }
}