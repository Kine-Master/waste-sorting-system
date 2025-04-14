// routes/sensors.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all sensors
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sensors');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new sensor from Arduino or frontend
router.post('/', async (req, res) => {
  const { sensor_type, location, last_maintenance_date } = req.body;

  if (!sensor_type || !location || !last_maintenance_date) {
    return res.status(400).json({ error: 'sensor_type, location, and last_maintenance_date are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO sensors (sensor_type, location, last_maintenance_date) VALUES (?, ?, ?)',
      [sensor_type, location, last_maintenance_date]
    );
    console.log('Sensor added:', { id: result.insertId, sensor_type, location });
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error adding sensor:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
