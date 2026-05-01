// controllers/authController.js
const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const user = await authService.register({ name, email, password });
    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const data = await authService.login({ email, password });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
};

module.exports = { register, login, getProfile };