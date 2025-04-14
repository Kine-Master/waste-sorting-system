const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, initializeDatabase } = require('./db');
const sensorsRoutes = require('./routes/sensors');
const wasteLevelsRoutes = require('./routes/wasteLevels');
const binStatusRoutes = require('./routes/binStatus');
const collectionScheduleRoutes = require('./routes/collectionSchedule');

const app = express();
app.use(cors());
app.use(express.json());

// Make the pool available to all routes
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Routes
app.use('/api/sensors', sensorsRoutes);
app.use('/api/waste-levels', wasteLevelsRoutes);
app.use('/api/bin-status', binStatusRoutes);
app.use('/api/collection-schedule', collectionScheduleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // simulateInitialData(); <--- REMOVED THIS LINE
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// async function simulateInitialData() { <--- REMOVED THIS ENTIRE BLOCK
//   try {
//     await axios.post('http://localhost:' + PORT + '/api/sensors/simulate');
//     await axios.post('http://localhost:' + PORT + '/api/waste-levels/simulate');
//     await axios.post('http://localhost:' + PORT + '/api/bin-status/simulate');
//     await axios.post('http://localhost:' + PORT + '/api/collection-schedule/simulate');
//     console.log('✅ Simulated data posted at server startup.');
//   } catch (err) {
//     console.error('❌ Error posting simulated data:', err.message);
//   }
// }

// const axios = require('axios'); <--- OPTIONALLY REMOVE THIS LINE