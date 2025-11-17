const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById
} = require('../controllers/userController');

// List User
router.get('/', getAllUsers);            // GET /api/user - List all users
router.get('/:id', getUserById);        // GET /api/user/:id - Get user by ID with API keys

module.exports = router;

