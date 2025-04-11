// routes/binStatus.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bin_status');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate', async (req, res) => {
  try {
    const statuses = ['Empty', 'Full', 'Overloaded'];
    const now = new Date();
    const updates = [
      { bin_id: 1, status: statuses[Math.floor(Math.random() * 3)] },
      { bin_id: 2, status: statuses[Math.floor(Math.random() * 3)] }
    ];
    for (const bin of updates) {
      await pool.query(
        'UPDATE bin_status SET current_status = ?, last_checked_time = ? WHERE bin_id = ?',
        [bin.status, now, bin.bin_id]
      );
      console.log('Simulated bin status updated:', bin);
    }
    res.json({ message: 'Simulated bin status updated' });
  } catch (err) {
    console.error('Error simulating bin status:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;