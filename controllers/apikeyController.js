const pool = require('../config/database');
const crypto = require('crypto');

// Generate unique API key
const generateApiKey = () => {
    return 'ak_' + crypto.randomBytes(32).toString('hex');
};

// Get all API keys
const getAllApiKeys = async (req, res) => {
    try {
        const [apikeys] = await pool.execute(
            `SELECT 
                a.id,
                a.user_id,
                a.key,
                a.start_date,
                a.last_date,
                a.outofdate,
                a.status,
                a.created_at,
                a.updated_at,
                u.first_name,
                u.last_name,
                u.email
            FROM apikey a
            INNER JOIN user u ON a.user_id = u.id
            ORDER BY a.created_at DESC`
        );
        
        res.json({
            success: true,
            data: apikeys,
            count: apikeys.length
        });
    } catch (error) {
        console.error('Error getting API keys:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching API keys',
            error: error.message
        });
    }
};

// Get API key by ID
const getApiKeyById = async (req, res) => {
    try {
        const { id } = req.params;
        const [apikeys] = await pool.execute(
            `SELECT 
                a.id,
                a.user_id,
                a.key,
                a.start_date,
                a.last_date,
                a.outofdate,
                a.status,
                a.created_at,
                a.updated_at,
                u.first_name,
                u.last_name,
                u.email
            FROM apikey a
            INNER JOIN user u ON a.user_id = u.id
            WHERE a.id = ?`,
            [id]
        );
        
        if (apikeys.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }
        
        res.json({
            success: true,
            data: apikeys[0]
        });
    } catch (error) {
        console.error('Error getting API key:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching API key',
            error: error.message
        });
    }
};

// Create API key
// Berisi: first_name, last_name, email, start_date, last_date, status
const createApiKey = async (req, res) => {
    try {
        const { first_name, last_name, email, start_date, last_date, status } = req.body;
        
        // Validasi required fields
        if (!first_name || !last_name || !email || !start_date || !last_date) {
            return res.status(400).json({
                success: false,
                message: 'first_name, last_name, email, start_date, and last_date are required'
            });
        }
        
        // Validasi tanggal
        const startDate = new Date(start_date);
        const lastDate = new Date(last_date);
        
        if (isNaN(startDate.getTime()) || isNaN(lastDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }
        
        if (lastDate < startDate) {
            return res.status(400).json({
                success: false,
                message: 'last_date must be after start_date'
            });
        }
        
        // Generate API key
        const apiKey = generateApiKey();
        const outofdate = last_date; // outofdate sama dengan last_date
        
        // Cek apakah user sudah ada berdasarkan email
        const [existingUsers] = await pool.execute(
            'SELECT id FROM user WHERE email = ?',
            [email]
        );
        
        let userId;
        
        if (existingUsers.length > 0) {
            // User sudah ada, gunakan ID yang ada
            userId = existingUsers[0].id;
            
            // Update user info jika perlu
            await pool.execute(
                'UPDATE user SET first_name = ?, last_name = ? WHERE id = ?',
                [first_name, last_name, userId]
            );
        } else {
            // User belum ada, buat user baru
            const [userResult] = await pool.execute(
                'INSERT INTO user (first_name, last_name, email) VALUES (?, ?, ?)',
                [first_name, last_name, email]
            );
            userId = userResult.insertId;
        }
        
        // Buat API key
        const [apikeyResult] = await pool.execute(
            `INSERT INTO apikey (user_id, key, start_date, last_date, outofdate, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, apiKey, start_date, last_date, outofdate, status || 'active']
        );
        
        // Update user.apikey dengan API key terbaru
        await pool.execute(
            'UPDATE user SET apikey = ? WHERE id = ?',
            [apiKey, userId]
        );
        
        res.status(201).json({
            success: true,
            message: 'API key created successfully',
            data: {
                id: apikeyResult.insertId,
                user_id: userId,
                first_name,
                last_name,
                email,
                key: apiKey,
                start_date,
                last_date,
                outofdate,
                status: status || 'active'
            }
        });
    } catch (error) {
        console.error('Error creating API key:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'API key already exists (unlikely, but possible)'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating API key',
            error: error.message
        });
    }
};

// Update API key status
const updateApiKeyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['active', 'inactive', 'expired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        const [result] = await pool.execute(
            'UPDATE apikey SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }
        
        res.json({
            success: true,
            message: 'API key status updated successfully'
        });
    } catch (error) {
        console.error('Error updating API key:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating API key',
            error: error.message
        });
    }
};

// Delete API key
const deleteApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute(
            'DELETE FROM apikey WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }
        
        res.json({
            success: true,
            message: 'API key deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting API key:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting API key',
            error: error.message
        });
    }
};

module.exports = {
    getAllApiKeys,
    getApiKeyById,
    createApiKey,
    updateApiKeyStatus,
    deleteApiKey
};

