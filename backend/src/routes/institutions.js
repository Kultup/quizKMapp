const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');
const { verifyToken } = require('../controllers/authController');
const { isAdmin } = require('../controllers/adminController');

// Get all institutions
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search = '', cityId, type } = req.query;
    const result = await Institution.getAll(
      parseInt(limit), 
      parseInt(offset), 
      search, 
      cityId, 
      type
    );
    
    res.json({
      success: true,
      data: result.institutions,
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні списку закладів',
      error: error.message
    });
  }
});

// Get institutions by city
router.get('/by-city/:cityId', async (req, res) => {
  try {
    const institutions = await Institution.getByCity(req.params.cityId);
    
    res.json({
      success: true,
      data: institutions
    });
  } catch (error) {
    console.error('Error fetching institutions by city:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні закладів міста',
      error: error.message
    });
  }
});

// Get institution by ID (requires auth)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');
    
    if (!institution || !institution.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Заклад не знайдено'
      });
    }

    res.json({
      success: true,
      data: institution
    });
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні закладу',
      error: error.message
    });
  }
});

// Create new institution (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, shortName, type, city, address, phone, email, website } = req.body;

    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: 'Назва та місто є обов\'язковими полями'
      });
    }

    const institutionData = {
      name: name.trim(),
      shortName: shortName?.trim(),
      type: type || 'школа',
      city,
      address: address?.trim(),
      phone: phone?.trim(),
      email: email?.trim()?.toLowerCase(),
      website: website?.trim(),
      isActive: true,
      createdBy: req.user.id
    };

    const institution = await Institution.createInstitution(institutionData);
    
    res.status(201).json({
      success: true,
      message: 'Заклад успішно створено',
      data: institution
    });
  } catch (error) {
    console.error('Error creating institution:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Заклад з такою назвою вже існує'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Помилка при створенні закладу',
      error: error.message
    });
  }
});

// Update institution (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, shortName, type, city, address, phone, email, website, isActive } = req.body;

    if (!name || !city) {
      return res.status(400).json({
        success: false,
        message: 'Назва та місто є обов\'язковими полями'
      });
    }

    const updateData = {
      name: name.trim(),
      shortName: shortName?.trim(),
      type,
      city,
      address: address?.trim(),
      phone: phone?.trim(),
      email: email?.trim()?.toLowerCase(),
      website: website?.trim(),
      isActive
    };

    const institution = await Institution.updateInstitution(req.params.id, updateData);
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Заклад не знайдено'
      });
    }

    res.json({
      success: true,
      message: 'Заклад успішно оновлено',
      data: institution
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Заклад з такою назвою вже існує'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Помилка при оновленні закладу',
      error: error.message
    });
  }
});

// Delete institution (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const institution = await Institution.deleteInstitution(req.params.id);
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Заклад не знайдено'
      });
    }

    res.json({
      success: true,
      message: 'Заклад успішно видалено'
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при видаленні закладу',
      error: error.message
    });
  }
});

// Get institutions statistics (Admin only)
router.get('/stats/overview', verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await Institution.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching institutions stats:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні статистики закладів',
      error: error.message
    });
  }
});

module.exports = router;