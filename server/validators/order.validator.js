const { body } = require('express-validator');

exports.createOrderValidator = [
  body('addressId').notEmpty().withMessage('Address ID is required')
];
