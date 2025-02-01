const { body, validationResult, query } = require('express-validator');
const AppError = require('../utils/appError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }
    next();
  };
};

exports.validateSignup = validate([
  body('name').trim().notEmpty().escape().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().toLowerCase().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .withMessage('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'),
]);

exports.validateLogin = validate([
    body('email').trim().toLowerCase().notEmpty().isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
  ]);

exports.validateEmailVerification = validate([
    query('token').notEmpty()
    .withMessage('Verification token is required')
    .isString()
    .trim()
    .escape(),
  ]);


exports.getAllUsers = validate([
    query('name').optional().isString().trim().escape(),
    query('email').optional().isEmail().normalizeEmail(),
    query('isVerified').optional().isBoolean().toBoolean(),
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate(),
    query('page').optional().isInt({ gt: 0 }).toInt(),
    query('limit').optional().isInt({ gt: 0 }).toInt(),
  ]);

exports.updateMeValidation = validate([
    body('name').optional().isString().trim().escape(),
    body('email').optional().toLowerCase().isEmail().normalizeEmail(),
  ]);


exports.getInActiveUsersValidation = validate([
    query('period', `Period must be "hour" or "month"`).isString().notEmpty().toLowerCase().trim().escape().matches(/^(hour|month)$/i),
])

module.exports = exports;