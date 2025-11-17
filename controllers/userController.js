const pool = require('../config/database');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.email, 
                u.apikey,
                u.created_at, 
                u.updated_at,
                COUNT(a.id) as total_apikeys
            FROM user u
            LEFT JOIN apikey a ON u.id = a.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC`
        );
        
        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await pool.execute(
            `SELECT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.email, 
                u.apikey,
                u.created_at, 
                u.updated_at
            FROM user u
            WHERE u.id = ?`,
            [id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get user's API keys
        const [apikeys] = await pool.execute(
            `SELECT 
                id, 
                key, 
                start_date, 
                last_date, 
                outofdate, 
                status,
                created_at
            FROM apikey 
            WHERE user_id = ?
            ORDER BY created_at DESC`,
            [id]
        );
        
        res.json({
            success: true,
            data: {
                ...users[0],
                apikeys: apikeys
            }
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById
};

