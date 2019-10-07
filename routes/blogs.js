var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middleware = require("../middleware");
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

//INDEX ROUTE
router.get('/',function(req,res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Blog.find({$or : [{title:regex},{body:regex}]},function(err,foundBlogs){
            if (err){
                console.log(err);
                res.redirect('/');
            } else {
                if (foundBlogs.length <1 ){
                    req.flash('error',"No blogs were found");
                    res.redirect('/');
                } else {
                    res.render("blog/index",{blogs:foundBlogs});
                }
            }
        })
    }else {
        Blog.find({},function(err,foundBlogs){
            if (err){
                res.redirect('/');
            } else {
                res.render("blog/index",{blogs:foundBlogs});
            }
        })
    }
    
})
//CREATE BLOG LOGIC ROUTE
router.post("/blogs",middleware.isLoggedIn,upload.single('blog[image]'),function(req,res){
    cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.blog.image = result.secure_url;
        req.body.blog.imageId = result.public_id;
        req.body.blog.author={
            id : req.user._id,
            username : req.user.username
        }
        req.body.blog.body=req.sanitize(req.body.blog.body);
        Blog.create(req.body.blog,function(err){
            if (err){
                console.log(err);
                req.flash('error',"Something went wrong...")
                res.redirect('/');
            } else {
                req.flash('success',"Your blog was successfully created!")
                res.redirect('/');
            }
        })
    })
})
//NEW BLOG ROUTE
router.get("/blogs/new",middleware.isLoggedIn,function(req,res){
    res.render('blog/new');
})
//SHOW BLOG ROUTE
router.get('/blogs/:id',function(req,res){
    Blog.findById(req.params.id).populate("comments").populate("tags").exec(function(err,foundBlog){
        if(err){
            console.log(err);
            req.flash('error',"Something went wrong...")
            res.redirect('/');
        } else {
            res.render('blog/show',{blog:foundBlog});
        }
    })
})
//EDIT BLOG ROUTE
router.get('/blogs/:id/edit',middleware.CheckBlogOwner,function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        res.render('blog/edit',{blog:foundBlog});
    })
})
//UPDATE BLOG ROUTE
router.put('/blogs/:id',middleware.CheckBlogOwner,upload.single('image'),function(req,res){
    Blog.findById(req.params.id,async function(err,foundBlog){
        if (req.file){
            try{
                await cloudinary.v2.uploader.destroy(foundBlog.imageId)
                var result =await cloudinary.v2.uploader.upload(req.file.path);
                foundBlog.image = result.secure_url;
                foundBlog.imageId = result.public_id;
            }
            catch(err){
                req.flash('error',err.message);
                return res.redirect('back');
            }            
        }
        foundBlog.title = req.body.title;
        foundBlog.body = req.sanitize(req.body.body);
        foundBlog.save();
        req.flash('success',"Blog was successfully edited!")
        res.redirect('/blogs/'+foundBlog._id);
    })
});
//DELETE BLOG ROUTE
router.delete('/blogs/:id',middleware.CheckBlogOwner,function(req,res){
    Blog.findById(req.params.id,async function(err,blog){
        try{
            await cloudinary.v2.uploader.destroy(blog.imageId);
            blog.remove();
        }catch(err){
            req.flash('error',err.message);
                return res.redirect('back');
        }
        req.flash('success',"Blog was successfully deleted!")
        res.redirect('/');
    })
})
//REGEX SEARCH FUNCTION
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;