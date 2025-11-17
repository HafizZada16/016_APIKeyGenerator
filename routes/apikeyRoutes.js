const express = require("express");
const router = express.Router();
const apikeyController = require("../controllers/apikeyController");

// Route to generate a key without user details
router.post("/generate-only", apikeyController.generateOnly);

// Route to associate user details with a key
router.post("/associate-user", apikeyController.associateUser);

// API Key routes
router.get("/", apikeyController.getAllApiKeys); // GET /api/apikey - List all API keys
router.get("/:id", apikeyController.getApiKeyById); // GET /api/apikey/:id - Get API key by ID
router.post("/", apikeyController.createApiKey); // POST /api/apikey - Create API key
router.put("/:id/status", apikeyController.updateApiKeyStatus); // PUT /api/apikey/:id/status - Update API key status
router.delete("/:id", apikeyController.deleteApiKey); // DELETE /api/apikey/:id - Delete API key

module.exports = router;
