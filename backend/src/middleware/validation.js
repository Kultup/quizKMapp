const { body } = require('express-validator');

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),

  body('institution')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Institution must be between 2 and 200 characters'),
  
  body('gender')
    .isIn(['чоловіча', 'жіноча', 'інше'])
    .withMessage('Invalid gender'),
  

  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('position')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),

  body('institution')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Institution must be between 2 and 200 characters'),
  
  body('gender')
    .optional()
    .isIn(['чоловіча', 'жіноча', 'інше'])
    .withMessage('Invalid gender'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const questionValidation = [
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  body('questionText')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Question text must be between 10 and 1000 characters'),
  
  body('optionA')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Option A must be between 1 and 500 characters'),
  
  body('optionB')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Option B must be between 1 and 500 characters'),
  
  body('optionC')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Option C must be between 1 and 500 characters'),
  
  body('optionD')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Option D must be between 1 and 500 characters'),
  
  body('correctAnswer')
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Correct answer must be A, B, C, or D'),
  
  body('explanation')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Explanation must not exceed 1000 characters'),
  
  body('difficultyLevel')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Difficulty level must be between 1 and 5')
];

const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

const quizAnswerValidation = [
  body('answers')
    .isArray({ min: 1, max: 10 })
    .withMessage('Answers must be an array with 1-10 items'),
  
  body('answers.*.questionId')
    .isInt({ min: 1 })
    .withMessage('Each answer must have a valid question ID'),
  
  body('answers.*.answer')
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Each answer must be A, B, C, or D')
];

const feedbackValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  
  body('feedbackType')
    .optional()
    .isIn(['general', 'quiz_quality', 'menu_update', 'bug_report'])
    .withMessage('Invalid feedback type')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  questionValidation,
  categoryValidation,
  quizAnswerValidation,
  feedbackValidation
};
