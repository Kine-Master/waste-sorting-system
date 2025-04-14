// routes/collectionSchedule.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get recent collection schedule entries
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM waste_collection_schedule ORDER BY collection_time DESC LIMIT 10');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new collection schedule entry from Arduino
router.post('/', async (req, res) => {
  const { bin_id, collection_time, status } = req.body;

  if (!bin_id || !collection_time || !status) {
    return res.status(400).json({ error: 'bin_id, collection_time, and status are required.' });
  }

  try {
    await pool.query(
      'INSERT INTO waste_collection_schedule (bin_id, collection_time, status) VALUES (?, ?, ?)',
      [bin_id, collection_time, status]
    );
    console.log('Collection schedule added from Arduino:', { bin_id, collection_time, status });
    res.json({ message: 'Collection schedule added successfully.' });
  } catch (err) {
    console.error('Error adding collection schedule:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;