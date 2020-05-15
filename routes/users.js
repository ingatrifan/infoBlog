const { middleware, payloadValidation } = require("../middleware");
const router = require('express').Router();
const { users } = require('../schemas')
const { userController } = require('../controllers')
const { upload } = require('../utils')

router.get('/:id',userController.getUser)
router.get('/:id/edit',middleware.checkUser,userController.getEditUser)
router.put('/:id',[middleware.checkUser, upload.single('avatar'),payloadValidation(users.updateUser)] ,userController.putEditUser)


module.exports = router;