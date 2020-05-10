const router = require('express').Router();
const middleware = require("../middleware");
const { blogController } = require('../controllers')
const { upload } = require('../utils')

router.get('/',blogController.getBlogs)
router.post("/blogs",middleware.isLoggedIn,upload.single('blog[image]'),blogController.postBlogs)
router.get("/blogs/new",middleware.isLoggedIn,blogController.getNewBlog)
router.get('/blogs/:id',blogController.getBlog)
router.get('/blogs/:id/edit',middleware.CheckBlogOwner,blogController.getEditBlog)
router.put('/blogs/:id',middleware.CheckBlogOwner,upload.single('image'),blogController.putEditBlog);
router.delete('/blogs/:id',middleware.CheckBlogOwner,blogController.deleteBlog)

module.exports = router;