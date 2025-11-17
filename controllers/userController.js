const { User, Apikey } = require('../models');
const { Sequelize } = require('sequelize');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'apikey',
                'created_at',
                'updated_at',
                [Sequelize.fn('COUNT', Sequelize.col('apikeys.id')), 'total_apikeys']
            ],
            include: [{
                model: Apikey,
                as: 'apikeys',
                attributes: [],
                required: false
            }],
            group: ['user.id'],
            order: [['created_at', 'DESC']],
            raw: true,
            nest: true
        });
        
        // Format hasil untuk menghilangkan nested structure
        const formattedUsers = users.map(user => ({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            apikey: user.apikey,
            created_at: user.created_at,
            updated_at: user.updated_at,
            total_apikeys: parseInt(user.total_apikeys) || 0
        }));
        
        res.json({
            success: true,
            data: formattedUsers,
            count: formattedUsers.length
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
        const user = await User.findByPk(id, {
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'apikey',
                'created_at',
                'updated_at'
            ],
            include: [{
                model: Apikey,
                as: 'apikeys',
                attributes: [
                    'id',
                    'key',
                    'start_date',
                    'last_date',
                    'outofdate',
                    'status',
                    'created_at'
                ],
                order: [['created_at', 'DESC']]
            }]
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
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
