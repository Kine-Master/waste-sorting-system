// routes/binStatus.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get current bin status
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bin_status');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bin status from Arduino
router.post('/', async (req, res) => {
  const { bin_id, current_status } = req.body;
  const now = new Date();

  if (!bin_id || !current_status) {
    return res.status(400).json({ error: 'bin_id and current_status are required.' });
  }

  try {
    await pool.query(
      'UPDATE bin_status SET current_status = ?, last_checked_time = ? WHERE bin_id = ?',
      [current_status, now, bin_id]
    );
    console.log('Bin status updated from Arduino:', { bin_id, current_status });
    res.json({ message: 'Bin status updated successfully.' });
  } catch (err) {
    console.error('Error updating bin status:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;