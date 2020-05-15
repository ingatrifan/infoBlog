const HttpStatus = require('http-status-codes')

const payloadValidation = schema => async (req, res, next) => {
  try {
    const { body: payload } = req
    console.log(req.body  )
    await schema.validateAsync(payload)
    next()
  } catch (error) {
    req.flash('error', error.message);
    return res.status(HttpStatus.BAD_REQUEST).redirect("back");
  }
}

module.exports = payloadValidation