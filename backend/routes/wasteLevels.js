// routes/wasteLevels.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get recent waste level readings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM waste_levels ORDER BY timestamp DESC LIMIT 10');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert a new waste level reading from Arduino
router.post('/', async (req, res) => {
  const { sensor_id, waste_level } = req.body;

  if (!sensor_id || waste_level === undefined) {
    return res.status(400).json({ error: 'sensor_id and waste_level are required.' });
  }

  try {
    await pool.query(
      'INSERT INTO waste_levels (sensor_id, waste_level) VALUES (?, ?)',
      [sensor_id, waste_level]
    );
    console.log('Waste level inserted from Arduino:', { sensor_id, waste_level });
    res.json({ message: 'Waste level inserted successfully.' });
  } catch (err) {
    console.error('Error inserting waste level:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
