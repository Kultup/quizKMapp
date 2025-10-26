const express = require('express');
const path = require('path');
const router = express.Router();

// Serve admin panel static files
router.use(express.static(path.join(__dirname, '../../admin')));

// Serve admin panel HTML
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../admin/index.html'));
});

module.exports = router;
