// controllers/diagnosisController.js
const diagnosisService = require('../services/diagnosisService');

const analyze = async (req, res) => {
  try {
    const result = await diagnosisService.analyze(req.user.id, req.file);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await diagnosisService.getHistory(req.user.id);
    return res.status(200).json({ history });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
};

const getDiagnosisById = async (req, res) => {
  try {
    const diagnosis = await diagnosisService.getDiagnosisById(req.user.id, req.params.id);
    return res.status(200).json({ diagnosis });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
};

module.exports = { analyze, getHistory, getDiagnosisById };