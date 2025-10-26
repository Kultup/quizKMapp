const express = require('express');
const router = express.Router();
const City = require('../models/City');
const { verifyToken } = require('../controllers/authController');
const { isAdmin } = require('../controllers/adminController');

// Get all cities
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search = '' } = req.query;
    const result = await City.getAll(parseInt(limit), parseInt(offset), search);
    
    res.json({
      success: true,
      data: result.cities,
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні списку міст',
      error: error.message
    });
  }
});

// Get city by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate('createdBy', 'firstName lastName');
    
    if (!city || !city.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Місто не знайдено'
      });
    }

    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні міста',
      error: error.message
    });
  }
});

// Create new city (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, region, country } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Назва міста є обов\'язковою'
      });
    }

    const cityData = {
      name: name.trim(),
      region: region?.trim(),
      country: country?.trim() || 'Україна',
      createdBy: req.user.id
    };

    const city = await City.createCity(cityData);
    
    res.status(201).json({
      success: true,
      message: 'Місто успішно створено',
      data: city
    });
  } catch (error) {
    console.error('Error creating city:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Місто з такою назвою вже існує'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Помилка при створенні міста',
      error: error.message
    });
  }
});

// Update city (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, region, country } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Назва міста є обов\'язковою'
      });
    }

    const updateData = {
      name: name.trim(),
      region: region?.trim(),
      country: country?.trim() || 'Україна'
    };

    const city = await City.updateCity(req.params.id, updateData);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Місто не знайдено'
      });
    }

    res.json({
      success: true,
      message: 'Місто успішно оновлено',
      data: city
    });
  } catch (error) {
    console.error('Error updating city:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Місто з такою назвою вже існує'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Помилка при оновленні міста',
      error: error.message
    });
  }
});

// Delete city (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const city = await City.deleteCity(req.params.id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'Місто не знайдено'
      });
    }

    res.json({
      success: true,
      message: 'Місто успішно видалено'
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при видаленні міста',
      error: error.message
    });
  }
});

// Get city statistics (Admin only)
router.get('/stats/overview', verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await City.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching cities stats:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні статистики міст',
      error: error.message
    });
  }
});

module.exports = router;