const { body, validationResult } = require('express-validator');

const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
];

const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateProjectCreate = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Project name must be at least 3 characters'),
  body('description').optional().trim(),
];

const validateTaskCreate = [
  body('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Task title must be at least 3 characters'),
  body('description').optional().trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
];

const validateCommentCreate = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty'),
];

module.exports = {
  validateInput,
  validateRegister,
  validateLogin,
  validateProjectCreate,
  validateTaskCreate,
  validateCommentCreate,
};
