const middleware = require("../middleware");
const router = require('express').Router();
const { userController } = require('../controllers')
const { upload } = require('../utils')

router.get('/:id',userController.getUser)
router.get('/:id/edit',middleware.checkUser,userController.getEditUser)
router.put('/:id',middleware.checkUser,upload.single('avatar'),userController.putEditUser)


module.exports = router;