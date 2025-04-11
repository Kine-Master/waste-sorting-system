// routes/sensors.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sensors');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { sensor_type, location, last_maintenance_date } = req.body;
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

// Simulate adding sensors
router.post('/simulate', async (req, res) => {
  const simulatedSensors = [
    { sensor_type: 'Ultrasonic', location: 'Bin 1', last_maintenance_date: '2025-04-01' },
    { sensor_type: 'Moisture', location: 'Bin 2', last_maintenance_date: '2025-04-05' },
    { sensor_type: 'Infrared', location: 'Entrance', last_maintenance_date: '2025-03-28' }
  ];

  try {
    for (const sensor of simulatedSensors) {
      await pool.query(
        'INSERT INTO sensors (sensor_type, location, last_maintenance_date) VALUES (?, ?, ?)',
        [sensor.sensor_type, sensor.location, sensor.last_maintenance_date]
      );
      console.log('Simulated sensor added:', sensor);
    }
    res.json({ message: 'Simulated sensors added.' });
  } catch (err) {
    console.error('Error adding simulated sensors:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;