const express = require("express");
const router = express.Router();
const apikeyController = require("../controllers/apikeyController");

// Route baru untuk flow yang diminta
router.post("/generate-only", apikeyController.generateOnly);
router.post("/associate-user", apikeyController.associateUser);

// Route CRUD standar
router.get("/", apikeyController.getAllApiKeys);
router.get("/:id", apikeyController.getApiKeyById);
router.post("/", apikeyController.createApiKey);
router.put("/:id/status", apikeyController.updateApiKeyStatus);
router.delete("/:id", apikeyController.deleteApiKey);

module.exports = router;
