const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const Category = require('../models/Category');
const Question = require('../models/Question');

// Get all active categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll(true);
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get questions by category
router.get('/:id/questions', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const questions = await Question.getAll({
      categoryId: parseInt(id),
      isActive: true,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ questions });
  } catch (error) {
    console.error('Get category questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
