const { User, Apikey } = require('../models');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Generate unique API key
const generateApiKey = () => {
    return 'ak_' + crypto.randomBytes(32).toString('hex');
};

// Get all API keys
const getAllApiKeys = async (req, res) => {
    try {
        const apikeys = await Apikey.findAll({
            attributes: [
                'id',
                'user_id',
                'key',
                'start_date',
                'last_date',
                'outofdate',
                'status',
                'created_at',
                'updated_at'
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['first_name', 'last_name', 'email']
            }],
            order: [['created_at', 'DESC']]
        });
        
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
        const apikey = await Apikey.findByPk(id, {
            attributes: [
                'id',
                'user_id',
                'key',
                'start_date',
                'last_date',
                'outofdate',
                'status',
                'created_at',
                'updated_at'
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['first_name', 'last_name', 'email']
            }]
        });
        
        if (!apikey) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }
        
        res.json({
            success: true,
            data: apikey
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
        let user = await User.findOne({
            where: { email }
        });
        
        if (user) {
            // User sudah ada, update user info
            await user.update({
                first_name,
                last_name
            });
        } else {
            // User belum ada, buat user baru
            user = await User.create({
                first_name,
                last_name,
                email
            });
        }
        
        // Buat API key
        const apikey = await Apikey.create({
            user_id: user.id,
            key: apiKey,
            start_date,
            last_date,
            outofdate,
            status: status || 'active'
        });
        
        // Update user.apikey dengan API key terbaru
        await user.update({
            apikey: apiKey
        });
        
        res.status(201).json({
            success: true,
            message: 'API key created successfully',
            data: {
                id: apikey.id,
                user_id: user.id,
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
        if (error.name === 'SequelizeUniqueConstraintError') {
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
        
        const apikey = await Apikey.findByPk(id);
        
        if (!apikey) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }
        
        await apikey.update({ status });
        
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
        
        const apikey = await Apikey.findByPk(id);
        
        if (!apikey) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }
        
        await apikey.destroy();
        
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
