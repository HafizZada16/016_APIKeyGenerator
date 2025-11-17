const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/authController');
const { validateApiKeyEndpoint } = require('../middleware/validateApiKey');

// Auth routes
router.post('/admin/login', adminLogin);           // POST /api/auth/admin/login - Admin login
router.post('/validate', validateApiKeyEndpoint); // POST /api/auth/validate - Validate API key (untuk Postman)
router.get('/validate', validateApiKeyEndpoint);  // GET /api/auth/validate - Validate API key (untuk Postman)

module.exports = router;

