const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const analyzeImage = async (imagePath) => {
  try {
    const aiModelUrl = process.env.AI_MODEL_URL || 'http://localhost:5000/predict';

    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(aiModelUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, 
    });

    const { mole_type, confidence, risk_level } = response.data;

    if (!mole_type || confidence === undefined) {
      throw new Error('Invalid response from AI model');
    }

    return {
      moleType: mole_type,
      confidence: parseFloat((confidence * 100).toFixed(2)), 
      riskLevel: risk_level || determineRiskLevel(confidence),
      rawResponse: JSON.stringify(response.data),
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('AI Model server is not running. Please start the Python API.');
    }
    if (error.response) {
      throw new Error(`AI Model error: ${error.response.data?.message || 'Unknown error'}`);
    }
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

const determineRiskLevel = (confidence) => {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
};

module.exports = { analyzeImage };
