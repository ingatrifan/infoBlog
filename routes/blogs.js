const router = require('express').Router();
const {middleware,payloadValidation} = require("../middleware");
const { blog } = require('../schemas')
const { blogController } = require('../controllers')
const { upload } = require('../utils')

router.get('/',blogController.getBlogs)
router.post("/blogs", [middleware.isLoggedIn,upload.single('image'), payloadValidation(blog.createBlog)],blogController.postBlogs)
router.get("/blogs/new",middleware.isLoggedIn,blogController.getNewBlog)
router.get('/blogs/:id',blogController.getBlog)
router.get('/blogs/:id/edit',[middleware.CheckBlogOwner, payloadValidation(blog.updateBlog)],blogController.getEditBlog)
router.put('/blogs/:id',middleware.CheckBlogOwner,upload.single('image'),blogController.putEditBlog);
router.delete('/blogs/:id',middleware.CheckBlogOwner,blogController.deleteBlog)

module.exports = router;