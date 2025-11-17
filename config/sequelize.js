const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME || 'project_api',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3308,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    }
);

// Test koneksi
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Sequelize database connection established successfully');
    } catch (error) {
        console.error('Sequelize database connection error:', error.message);
    }
};

// Jalankan test koneksi saat module di-load
testConnection();

module.exports = sequelize;

