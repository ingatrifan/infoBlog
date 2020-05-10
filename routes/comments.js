const router = require('express').Router({mergeParams: true});
const middleware = require("../middleware");

const {commentController } = require('../controllers')

router.post('/',middleware.isLoggedIn,commentController.postComments)
router.get('/:comment_id/edit',middleware.CheckCommentOwner,commentController.getEditComment)
router.put('/:comment_id',middleware.CheckCommentOwner,commentController.putEditComment);
router.delete('/:comment_id',middleware.CheckCommentOwner,commentController.deleteComment);

module.exports = router;