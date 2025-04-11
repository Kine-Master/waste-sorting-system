// routes/wasteLevels.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM waste_levels ORDER BY timestamp DESC LIMIT 10');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate', async (req, res) => {
  try {
    const levels = [
      { sensor_id: 1, waste_level: (Math.random() * 60 + 20).toFixed(1) },
      { sensor_id: 2, waste_level: (Math.random() * 60 + 20).toFixed(1) }
    ];
    for (const entry of levels) {
      await pool.query(
        'INSERT INTO waste_levels (sensor_id, waste_level) VALUES (?, ?)',
        [entry.sensor_id, entry.waste_level]
      );
      console.log('Simulated waste level inserted:', entry);
    }
    res.json({ message: 'Simulated waste levels stored' });
  } catch (err) {
    console.error('Error simulating waste levels:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;