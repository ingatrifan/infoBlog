const Joi = require('@hapi/joi')


const updateBlog = Joi.object({
  title:Joi.string().optional(),
  body:Joi.string().optional()
})

const createBlog = Joi.object({
    title:Joi.string().required(),
    body:Joi.string().required()
})


module.exports = { updateBlog, createBlog }