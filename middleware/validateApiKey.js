const { Apikey, User } = require('../models');

// Middleware untuk validasi API Key
// Digunakan untuk memvalidasi apakah API key valid atau tidak
const validateApiKey = async (req, res, next) => {
    try {
        // Ambil API key dari header atau query parameter
        const apiKey = req.headers['x-api-key'] || req.headers['api-key'] || req.query.api_key;
        
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'API key is required'
            });
        }
        
        // Cari API key di database
        const apikeyData = await Apikey.findOne({
            where: { key: apiKey },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
            }]
        });
        
        if (!apikeyData) {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'API key tidak valid / tidak ditemukan'
            });
        }
        
        // Cek status API key
        if (apikeyData.status === 'inactive' || apikeyData.status === 'expired') {
            return res.status(403).json({
                success: false,
                valid: false,
                message: `API key tidak valid - Status: ${apikeyData.status}`
            });
        }
        
        // Cek apakah API key sudah expired (outofdate)
        const today = new Date();
        const outofdate = new Date(apikeyData.outofdate);
        
        if (today > outofdate) {
            // Update status menjadi expired
            await apikeyData.update({ status: 'expired' });
            
            return res.status(403).json({
                success: false,
                valid: false,
                message: 'API key tidak valid - Sudah expired (out of date)'
            });
        }
        
        // API key valid
        // Attach user info ke request untuk digunakan di controller
        req.user = {
            id: apikeyData.user.id,
            first_name: apikeyData.user.first_name,
            last_name: apikeyData.user.last_name,
            email: apikeyData.user.email
        };
        req.apikey = {
            id: apikeyData.id,
            key: apikeyData.key,
            start_date: apikeyData.start_date,
            last_date: apikeyData.last_date,
            outofdate: apikeyData.outofdate,
            status: apikeyData.status
        };
        
        next();
    } catch (error) {
        console.error('Error validating API key:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Error validating API key',
            error: error.message
        });
    }
};

// Endpoint khusus untuk validasi API key (untuk testing di Postman)
const validateApiKeyEndpoint = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'] || req.headers['api-key'] || req.query.api_key || req.body.api_key;
        
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'API key is required'
            });
        }
        
        const apikeyData = await Apikey.findOne({
            where: { key: apiKey },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'first_name', 'last_name', 'email']
            }]
        });
        
        if (!apikeyData) {
            return res.json({
                success: false,
                valid: false,
                message: 'API key tidak valid / tidak ditemukan'
            });
        }
        
        const today = new Date();
        const outofdate = new Date(apikeyData.outofdate);
        
        // Cek status dan tanggal
        if (apikeyData.status === 'inactive' || apikeyData.status === 'expired') {
            return res.json({
                success: false,
                valid: false,
                message: `API key tidak valid - Status: ${apikeyData.status}`,
                data: {
                    key: apikeyData.key,
                    status: apikeyData.status,
                    outofdate: apikeyData.outofdate
                }
            });
        }
        
        if (today > outofdate) {
            // Update status menjadi expired
            await apikeyData.update({ status: 'expired' });
            
            return res.json({
                success: false,
                valid: false,
                message: 'API key tidak valid - Sudah expired (out of date)',
                data: {
                    key: apikeyData.key,
                    status: 'expired',
                    outofdate: apikeyData.outofdate
                }
            });
        }
        
        // API key valid
        return res.json({
            success: true,
            valid: true,
            message: 'API key valid',
            data: {
                key: apikeyData.key,
                user: {
                    id: apikeyData.user.id,
                    first_name: apikeyData.user.first_name,
                    last_name: apikeyData.user.last_name,
                    email: apikeyData.user.email
                },
                start_date: apikeyData.start_date,
                last_date: apikeyData.last_date,
                outofdate: apikeyData.outofdate,
                status: apikeyData.status
            }
        });
    } catch (error) {
        console.error('Error validating API key:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Error validating API key',
            error: error.message
        });
    }
};

module.exports = {
    validateApiKey,
    validateApiKeyEndpoint
};
