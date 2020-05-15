const Joi = require('@hapi/joi')

const login = Joi.object({
  username: Joi.string().min(8).required(),
  password: Joi.string().min(8).required()
})

const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().min(8).required(),
  fname:  Joi.string().allow('').optional() ,
  lname:  Joi.string().allow('').optional() ,
  instagram: Joi.string().allow('').optional() ,
  facebook: Joi.string().allow('').optional() ,
  tumblr: Joi.string().allow('').optional() ,
  description: Joi.string().allow('').optional()
})

const forgotPassword = Joi.object({
  email: Joi.string().required().email()
})

module.exports = { login, register, forgotPassword }