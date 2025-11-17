const { Admin } = require('../models');

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            attributes: ['id', 'email', 'created_at', 'updated_at'],
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: admins,
            count: admins.length
        });
    } catch (error) {
        console.error('Error getting admins:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admins',
            error: error.message
        });
    }
};

// Get admin by ID
const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByPk(id, {
            attributes: ['id', 'email', 'created_at', 'updated_at']
        });
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error('Error getting admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin',
            error: error.message
        });
    }
};

// Create admin
const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = await Admin.create({
            email,
            password: hashedPassword
        });
        
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                id: admin.id,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating admin',
            error: error.message
        });
    }
};

// Update admin
const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password } = req.body;
        
        const admin = await Admin.findByPk(id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        const updateData = {};
        
        if (email) {
            updateData.email = email;
        }
        
        if (password) {
            const bcrypt = require('bcryptjs');
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        await admin.update(updateData);
        
        res.json({
            success: true,
            message: 'Admin updated successfully'
        });
    } catch (error) {
        console.error('Error updating admin:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating admin',
            error: error.message
        });
    }
};

// Delete admin
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        const admin = await Admin.findByPk(id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        await admin.destroy();
        
        res.json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting admin',
            error: error.message
        });
    }
};

module.exports = {
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin
};
