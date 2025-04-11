const mysql = require('mysql2');
require('dotenv').config();

// Create a basic connection for admin tasks (without specifying database)
const adminConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Create the pool (will be exported)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Database initialization function
async function initializeDatabase() {
  try {
    // Create database if not exists
    await adminConnection.promise().query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Switch to the database
    await adminConnection.promise().query(`USE ${process.env.DB_NAME}`);

    // Create tables
    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS sensors (
        sensor_id INT AUTO_INCREMENT PRIMARY KEY,
        sensor_type VARCHAR(50),
        location VARCHAR(100),
        last_maintenance_date DATE
      )
    `);

    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS waste_levels (
        entry_id INT AUTO_INCREMENT PRIMARY KEY,
        sensor_id INT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        waste_level FLOAT,
        FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id)
      )
    `);

    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS bin_status (
        bin_id INT AUTO_INCREMENT PRIMARY KEY,
        bin_name VARCHAR(50),
        current_status ENUM('Empty', 'Full', 'Overloaded'),
        last_checked_time DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.promise().query(`
      CREATE TABLE IF NOT EXISTS waste_collection_schedule (
        schedule_id INT AUTO_INCREMENT PRIMARY KEY,
        bin_id INT,
        collection_time DATETIME,
        status ENUM('Scheduled', 'Collected', 'Pending') DEFAULT 'Scheduled',
        FOREIGN KEY (bin_id) REFERENCES bin_status(bin_id)
      )
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    adminConnection.end();
  }
}

// Export both the pool and initialization function
module.exports = {
  pool: pool.promise(),
  initializeDatabase
};