const { validationResult } = require('express-validator');
const Position = require('../models/Position');
const Question = require('../models/Question');
const User = require('../models/User');

// Get all positions
const getPositions = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search = '', category = null } = req.query;
    
    const result = await Position.getAll(
      parseInt(limit),
      parseInt(offset),
      search,
      category
    );
    
    res.json({
      positions: result.positions,
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get position by ID
const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const position = await Position.findById(id).populate('createdBy', 'firstName lastName');
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    res.json(position);
  } catch (error) {
    console.error('Error getting position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get questions for a specific position
const getQuestionsByPosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    const { limit = 100, offset = 0, difficultyLevel = null } = req.query;
    
    const filters = {
      positionId,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    if (difficultyLevel) {
      filters.difficultyLevel = parseInt(difficultyLevel);
    }
    
    const questions = await Question.getAll(filters);
    
    res.json({
      questions,
      total: questions.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting questions by position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get random questions for a position (for quiz)
const getRandomQuestionsForPosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    const { count = 5 } = req.query;
    
    const questions = await Question.getRandomQuestions(positionId, parseInt(count));
    
    res.json({
      questions,
      count: questions.length,
      positionId
    });
  } catch (error) {
    console.error('Error getting random questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's position and questions
const getUserPositionAndQuestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user || !user.position) {
      return res.status(400).json({ error: 'User position not found' });
    }
    
    // Get available questions for user's position
    const questions = await Question.getAll({
      positionId: user.position,
      isActive: true,
      limit: 100
    });
    
    res.json({
      position: {
        id: user.position._id,
        name: user.position.name,
        category: user.position.category,
        description: user.position.description,
        level: user.position.level
      },
      availableQuestions: questions.length,
      questions: questions.slice(0, 10) // Return first 10 questions for preview
    });
  } catch (error) {
    console.error('Error getting user position and questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new position (admin only)
const createPosition = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const positionData = {
      ...req.body,
      createdBy: req.user.userId
    };
    
    const position = await Position.createPosition(positionData);
    
    res.status(201).json({
      message: 'Position created successfully',
      position
    });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update position (admin only)
const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const position = await Position.updatePosition(id, req.body);
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    res.json({
      message: 'Position updated successfully',
      position
    });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete position (admin only)
const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    
    const position = await Position.deletePosition(id);
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    
    res.json({
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get position statistics
const getPositionStats = async (req, res) => {
  try {
    const stats = await Position.getStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting position stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPositions,
  getPositionById,
  getQuestionsByPosition,
  getRandomQuestionsForPosition,
  getUserPositionAndQuestions,
  createPosition,
  updatePosition,
  deletePosition,
  getPositionStats
};
