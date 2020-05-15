
const Joi = require('@hapi/joi')


const updateUser = Joi.object({
  email: Joi.string().email().required(),
  fname:  Joi.string().allow('').optional() ,
  lname:  Joi.string().allow('').optional() ,
  instagram: Joi.string().allow('').optional() ,
  facebook: Joi.string().allow('').optional() ,
  tumblr: Joi.string().allow('').optional() ,
  description: Joi.string().allow('').optional()
})

const resetPassword = Joi.object({
  password: Joi.string().min(8).required()
})


module.exports = { updateUser, resetPassword }