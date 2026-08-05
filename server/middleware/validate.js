const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => `${err.path}: ${err.msg}`).join('; ');
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${extractedErrors}`,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validate;
