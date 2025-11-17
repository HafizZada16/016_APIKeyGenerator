const express = require('express');
const router = express.Router();
const {
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin
} = require('../controllers/adminController');

// CRUD Admin
router.get('/', getAllAdmins);           // GET /api/admin - List all admins
router.get('/:id', getAdminById);        // GET /api/admin/:id - Get admin by ID
router.post('/', createAdmin);           // POST /api/admin - Create admin
router.put('/:id', updateAdmin);         // PUT /api/admin/:id - Update admin
router.delete('/:id', deleteAdmin);      // DELETE /api/admin/:id - Delete admin

module.exports = router;

