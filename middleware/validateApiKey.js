const pool = require('../config/database');

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
        const [apikeys] = await pool.execute(
            `SELECT 
                a.id,
                a.\`key\`,
                a.user_id,
                a.start_date,
                a.last_date,
                a.outofdate,
                a.status,
                u.first_name,
                u.last_name,
                u.email
            FROM apikey a
            INNER JOIN user u ON a.user_id = u.id
            WHERE a.key = ?`,
            [apiKey]
        );
        
        if (apikeys.length === 0) {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'API key tidak valid / tidak ditemukan'
            });
        }
        
        const apikeyData = apikeys[0];
        
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
            await pool.execute(
                'UPDATE apikey SET status = ? WHERE id = ?',
                ['expired', apikeyData.id]
            );
            
            return res.status(403).json({
                success: false,
                valid: false,
                message: 'API key tidak valid - Sudah expired (out of date)'
            });
        }
        
        // API key valid
        // Attach user info ke request untuk digunakan di controller
        req.user = {
            id: apikeyData.user_id,
            first_name: apikeyData.first_name,
            last_name: apikeyData.last_name,
            email: apikeyData.email
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
        
        const [apikeys] = await pool.execute(
            `SELECT 
                a.id,
                a.\`key\`,
                a.user_id,
                a.start_date,
                a.last_date,
                a.outofdate,
                a.status,
                u.first_name,
                u.last_name,
                u.email
            FROM apikey a
            INNER JOIN user u ON a.user_id = u.id
            WHERE a.key = ?`,
            [apiKey]
        );
        
        if (apikeys.length === 0) {
            return res.json({
                success: false,
                valid: false,
                message: 'API key tidak valid / tidak ditemukan'
            });
        }
        
        const apikeyData = apikeys[0];
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
            await pool.execute(
                'UPDATE apikey SET status = ? WHERE id = ?',
                ['expired', apikeyData.id]
            );
            
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
                    id: apikeyData.user_id,
                    first_name: apikeyData.first_name,
                    last_name: apikeyData.last_name,
                    email: apikeyData.email
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

