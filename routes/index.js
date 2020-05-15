const router = require("express").Router({mergeParams: true});

const blogs = require('./blogs');
const comments = require('./comments');
const users = require('./users');
const auth = require('./auth')

router.use('/',auth)
router.use('/users',users);
router.use('/',blogs)
router.use('/blogs/:id/comments',comments);

module.exports = router;
