const express = require('express');
const path = require('path');
const router = express.Router();

// Serve admin panel static files
router.use(express.static(path.join(__dirname, '../../admin')));

// Serve admin panel HTML
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/index.html'));
});

// Convenience routes for split pages
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/dashboard.html'));
});

router.get('/questions', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/questions.html'));
});

router.get('/categories', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/categories.html'));
});

// New split page routes
router.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/users.html'));
});

router.get('/player-stats', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/player-stats.html'));
});

router.get('/cities', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/cities.html'));
});

router.get('/institutions', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/institutions.html'));
});

router.get('/positions', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/positions.html'));
});

router.get('/quizzes', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/quizzes.html'));
});

router.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/reports.html'));
});

router.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/html/settings.html'));
});

module.exports = router;
