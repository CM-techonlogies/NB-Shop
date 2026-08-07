const { body } = require('express-validator');

exports.productValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('mrp').isNumeric().withMessage('MRP must be a number'),
  body('price').isNumeric().withMessage('Price must be a number')
];
