const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const [admins] = await pool.execute(
            'SELECT id, email, created_at, updated_at FROM admin'
        );
        
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
        const [admins] = await pool.execute(
            'SELECT id, email, created_at, updated_at FROM admin WHERE id = ?',
            [id]
        );
        
        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        res.json({
            success: true,
            data: admins[0]
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
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO admin (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );
        
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                id: result.insertId,
                email: email
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        if (error.code === 'ER_DUP_ENTRY') {
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
        
        let updateFields = [];
        let updateValues = [];
        
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        updateValues.push(id);
        
        await pool.execute(
            `UPDATE admin SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        res.json({
            success: true,
            message: 'Admin updated successfully'
        });
    } catch (error) {
        console.error('Error updating admin:', error);
        if (error.code === 'ER_DUP_ENTRY') {
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
        
        const [result] = await pool.execute(
            'DELETE FROM admin WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
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

