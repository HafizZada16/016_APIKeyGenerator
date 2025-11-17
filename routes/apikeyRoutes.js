const express = require('express');
const router = express.Router();
const {
    getAllApiKeys,
    getApiKeyById,
    createApiKey,
    updateApiKeyStatus,
    deleteApiKey
} = require('../controllers/apikeyController');

// API Key routes
router.get('/', getAllApiKeys);                    // GET /api/apikey - List all API keys
router.get('/:id', getApiKeyById);                 // GET /api/apikey/:id - Get API key by ID
router.post('/', createApiKey);                   // POST /api/apikey - Create API key
router.put('/:id/status', updateApiKeyStatus);    // PUT /api/apikey/:id/status - Update API key status
router.delete('/:id', deleteApiKey);               // DELETE /api/apikey/:id - Delete API key

module.exports = router;

