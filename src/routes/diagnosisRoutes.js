// routes/diagnosisRoutes.js
const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post(
  '/analyze',
  authenticate,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  diagnosisController.analyze
);

router.get('/history', authenticate, diagnosisController.getHistory);
router.get('/:id', authenticate, diagnosisController.getDiagnosisById);

module.exports = router;