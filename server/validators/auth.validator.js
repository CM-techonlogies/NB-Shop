const { body } = require('express-validator');

exports.registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits')
];

exports.loginValidator = [
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.verifyOtpValidator = [
  body('idToken').notEmpty().withMessage('ID token is required')
];
