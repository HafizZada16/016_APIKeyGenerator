const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Cari admin berdasarkan email
        const [admins] = await pool.execute(
            'SELECT id, email, password FROM admin WHERE email = ?',
            [email]
        );
        
        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const admin = admins[0];
        
        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Login berhasil
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: admin.id,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

module.exports = {
    adminLogin
};

