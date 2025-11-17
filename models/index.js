const sequelize = require('../config/sequelize');
const Admin = require('./Admin');
const User = require('./User');
const Apikey = require('./Apikey');

// Define relationships
// User has many Apikey (one-to-many)
User.hasMany(Apikey, {
    foreignKey: 'user_id',
    as: 'apikeys'
});

Apikey.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Export models
module.exports = {
    sequelize,
    Admin,
    User,
    Apikey
};

