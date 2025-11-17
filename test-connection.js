// Test database connection
require('dotenv').config();
const pool = require('./config/database');

async function testConnection() {
    try {
        console.log('🔄 Testing database connection...');
        console.log('📋 Config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        
        // Test query
        const [rows] = await connection.execute('SELECT DATABASE() as current_db');
        console.log('📊 Current database:', rows[0].current_db);
        
        // Check if tables exist
        const [allTables] = await connection.execute('SHOW TABLES');
        console.log('📋 Available tables:', allTables.map(t => Object.values(t)[0]));
        
        connection.release();
        console.log('✅ Connection test completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed!');
        console.error('Error:', error.message);
        console.error('\n💡 Tips:');
        console.error('1. Make sure MySQL is running');
        console.error('2. Check if database "' + process.env.DB_NAME + '" exists');
        console.error('3. Verify username and password in .env file');
        console.error('4. Run schema.sql to create tables');
        process.exit(1);
    }
}

testConnection();

