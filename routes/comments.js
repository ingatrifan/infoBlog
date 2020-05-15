const router = require('express').Router({mergeParams: true});
const {middleware,payloadValidation} = require("../middleware");
const { comment } = require('../schemas')
const {commentController } = require('../controllers')

router.post('/',[middleware.isLoggedIn,payloadValidation(comment.createComment)], commentController.postComments)
router.get('/:comment_id/edit',[middleware.CheckCommentOwner,payloadValidation(comment.updateComment)], commentController.getEditComment)
router.put('/:comment_id',middleware.CheckCommentOwner,commentController.putEditComment);
router.delete('/:comment_id',middleware.CheckCommentOwner,commentController.deleteComment);

module.exports = router;