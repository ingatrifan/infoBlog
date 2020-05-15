const httpStatusCodes = require("http-status-codes");
const { escapeRegexSearch } = require('../utils');
const cloudinary = require('cloudinary');

exports.getBlogs = async(req,res) =>{
    try {
        if(req.query.search){
            const regex = escapeRegexSearch(req.query.search)
            let blogs = await req.db.Blog.find({$or : [{title:regex},{body:regex}]});
            if (blogs.length <1 ){
                req.flash('error',"No blogs were found");
                return res.status(httpStatusCodes.NOT_FOUND).redirect('/');;
            } else {
                return res.status(httpStatusCodes.OK).render("blog/index",{blogs});
            }      
        }else{
            let blogs = await req.db.Blog.find({});
            return res.status(httpStatusCodes.OK).render("blog/index",{blogs});    
        }
    } catch (error) {
        console.log(error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('/');
    }
}

exports.postBlogs = async(req,res) => {
    try {
        let result = await cloudinary.v2.uploader.upload(req.file.path)
        req.body.image = result.secure_url;
        req.body.imageId = result.public_id;
        req.body.author={
            id : req.user._id,
            username : req.user.username
        }
        req.body.body=req.sanitize(req.body.body);
        let blog = await req.db.Blog.create(req.body)
        req.flash('success',"Your blog was successfully created!")
        return res.status(httpStatusCodes.OK).redirect('/')
    } catch (error) {
        console.log(error);
        req.flash('error',"Something went wrong...")
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('/');
    }
}
exports.getNewBlog = async(req,res) => {
    try {
        res.render('blog/new');
    } catch (error) {
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            succes: false,
            message: "Somthing bad happend!"
        });
    }
}
exports.getBlog = async(req,res) =>{
    try {
        let blog = await req.db.Blog.findById(req.params.id).populate("comments").populate("tags").exec();
        return res.status(httpStatusCodes.OK).render('blog/show',{blog}); 
    } catch (error) {
        console.log(error);
        req.flash('error',"Something went wrong...")
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('/');
    }
}
exports.putEditBlog = async (req,res) => {
    try {
        let blog = await req.db.Blog.findById(req.params.id);
        if (req.file){
            await cloudinary.v2.uploader.destroy(blog.imageId)
            let result =await cloudinary.v2.uploader.upload(req.file.path);
            blog.image = result.secure_url;
            blog.imageId = result.public_id;          
        }
        blog.title = req.body.title;
        blog.body = req.sanitize(req.body.body);
        blog.save();
        req.flash('success',"Blog was successfully edited!")
        return res.status(httpStatusCodes.OK).redirect('/blogs/'+blog._id);
    } catch (error) {
        req.flash('error',error.message);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('back');
    }
}
exports.getEditBlog = async(req,res) =>{
    try {
        let blog = await req.db.Blog.findById(req.params.id)
        return res.status(httpStatusCodes.OK).render('blog/edit',{blog});
    } catch (error) {
        req.flash('error',error.message);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('back');
    }
}
exports.deleteBlog = async(req,res) =>{
    try {
        let blog = await req.db.Blog.findById(req.params.id)
        await cloudinary.v2.uploader.destroy(blog.imageId);
        blog.remove();
        req.flash('success',"Blog was successfully deleted!")
        return res.status(httpStatusCodes.OK).redirect('/');
    } catch (error) {
        req.flash('error',error.message);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).redirect('back');
    }
}