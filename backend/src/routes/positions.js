const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../controllers/authController');
const {
  getPositions,
  getPositionById,
  getQuestionsByPosition,
  getRandomQuestionsForPosition,
  getUserPositionAndQuestions,
  createPosition,
  updatePosition,
  deletePosition,
  getPositionStats
} = require('../controllers/positionController');

// Public routes
router.get('/', getPositions);
router.get('/stats', getPositionStats);
router.get('/:id', getPositionById);
router.get('/:positionId/questions', getQuestionsByPosition);
router.get('/:positionId/questions/random', getRandomQuestionsForPosition);

// Protected routes (require authentication)
router.get('/user/position', verifyToken, getUserPositionAndQuestions);

// Admin routes (require admin authentication)
router.post('/', 
  verifyToken,
  [
    body('name').notEmpty().withMessage('Position name is required'),
    body('category').isIn(['адміністратор_закладу', 'банкетний_менеджер', 'шеф_кухар', 'менеджер_звязку']).withMessage('Invalid category'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('level').optional().isIn(['початковий', 'середній', 'старший', 'керівний']).withMessage('Invalid level')
  ],
  createPosition
);

router.put('/:id',
  verifyToken,
  [
    body('name').optional().notEmpty().withMessage('Position name cannot be empty'),
    body('category').optional().isIn(['адміністратор_закладу', 'банкетний_менеджер', 'шеф_кухар', 'менеджер_звязку']).withMessage('Invalid category'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('level').optional().isIn(['початковий', 'середній', 'старший', 'керівний']).withMessage('Invalid level')
  ],
  updatePosition
);

router.delete('/:id', verifyToken, deletePosition);

module.exports = router;