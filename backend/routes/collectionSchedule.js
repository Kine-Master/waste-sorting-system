const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM waste_collection_schedule ORDER BY collection_time DESC LIMIT 10');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate', async (req, res) => {
  try {
    const statusTypes = ['Scheduled', 'Collected', 'Pending'];
    const now = new Date();

    // ✅ Ensure required bins exist to satisfy foreign key constraint
    await pool.query(`
      INSERT IGNORE INTO bin_status (bin_id, bin_name, current_status) VALUES
      (1, 'Plastic Bin', 'Empty'),
      (2, 'Metal Bin', 'Empty')
    `);

    const inserts = [
      { bin_id: 1, status: statusTypes[Math.floor(Math.random() * 3)] },
      { bin_id: 2, status: statusTypes[Math.floor(Math.random() * 3)] }
    ];

    for (const item of inserts) {
      await pool.query(
        'INSERT INTO waste_collection_schedule (bin_id, collection_time, status) VALUES (?, ?, ?)',
        [item.bin_id, now, item.status]
      );
      console.log('Simulated collection schedule inserted:', item);
    }

    res.json({ message: 'Simulated collection schedule added' });
  } catch (err) {
    console.error('Error simulating collection schedule:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
