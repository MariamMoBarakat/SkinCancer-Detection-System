require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database.js');

const authRoutes = require('./routes/authRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// Middleware
// ==============================
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Routes
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/diagnosis', diagnosisRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mole Detection API is running ',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(' Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ==============================
// Start Server
// ==============================
const startServer = async () => {
  await connectDB(); 
  app.listen(PORT, () => {
    console.log(`
 Server running on http://localhost:${PORT}
 API Endpoints:
   POST   /api/auth/register      
   POST   /api/auth/login         
   GET    /api/auth/profile      
   POST   /api/diagnosis/analyze  
   GET    /api/diagnosis/history  
   GET    /api/diagnosis/:id      
    `);
  });
};

startServer();
