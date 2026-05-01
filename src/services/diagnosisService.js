// services/diagnosisService.js
const path = require('path');
const { getPool } = require('../config/database');
const { analyzeImage } = require('./aiService');

const analyze = async (userId, file) => {
  if (!file) throw { status: 400, message: 'Image file is required' };

  const imagePath = file.path;
  const imageUrl = `/uploads/${file.filename}`;

  const aiResult = await analyzeImage(imagePath);
  const { mole_type, confidence, risk_level } = aiResult;

  const pool = await getPool();

  const imageInsert = await pool.request()
    .input('user_id', userId)
    .input('file_name', file.filename)
    .input('file_path', imageUrl)
    .input('mime_type', file.mimetype)
    .query(`
      INSERT INTO MedicalImages (user_id, file_name, file_path, mime_type)
      OUTPUT INSERTED.id
      VALUES (@user_id, @file_name, @file_path, @mime_type)
    `);

  const imageId = imageInsert.recordset[0].id;

  const diagnosisInsert = await pool.request()
    .input('user_id', userId)
    .input('image_id', imageId)
    .input('mole_type', mole_type)
    .input('confidence', confidence)
    .input('risk_level', risk_level)
    .query(`
      INSERT INTO Diagnosis (user_id, image_id, mole_type, confidence, risk_level)
      OUTPUT INSERTED.id, INSERTED.created_at
      VALUES (@user_id, @image_id, @mole_type, @confidence, @risk_level)
    `);

  const diagnosis = diagnosisInsert.recordset[0];

  return {
    diagnosis_id: diagnosis.id,
    image_url: imageUrl,
    mole_type,
    confidence,
    risk_level,
    created_at: diagnosis.created_at,
  };
};

const getHistory = async (userId) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('user_id', userId)
    .query(`
      SELECT
        d.id, d.mole_type, d.confidence, d.risk_level, d.created_at,
        mi.file_path AS image_url
      FROM Diagnosis d
      JOIN MedicalImages mi ON d.image_id = mi.id
      WHERE d.user_id = @user_id
      ORDER BY d.created_at DESC
    `);

  return result.recordset;
};

const getDiagnosisById = async (userId, diagnosisId) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('user_id', userId)
    .input('id', diagnosisId)
    .query(`
      SELECT
        d.id, d.mole_type, d.confidence, d.risk_level, d.created_at,
        mi.file_name, mi.file_path AS image_url, mi.mime_type
      FROM Diagnosis d
      JOIN MedicalImages mi ON d.image_id = mi.id
      WHERE d.id = @id AND d.user_id = @user_id
    `);

  const record = result.recordset[0];
  if (!record) throw { status: 404, message: 'Diagnosis not found' };
  return record;
};

module.exports = { analyze, getHistory, getDiagnosisById };