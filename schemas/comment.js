const Joi = require('@hapi/joi')


const updateComment = Joi.object({
  text:Joi.string().optional()
})

const createComment = Joi.object({
  text:Joi.string().required()
})


module.exports = { updateComment, createComment }