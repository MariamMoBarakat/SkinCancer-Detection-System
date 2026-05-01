// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');

const SALT_ROUNDS = 10;

const register = async ({ name, email, password }) => {
  const pool = await getPool();

  const existing = await pool.request()
    .input('email', email)
    .query('SELECT id FROM Users WHERE email = @email');

  if (existing.recordset.length > 0) {
    throw { status: 409, message: 'Email already registered' };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.request()
    .input('name', name)
    .input('email', email)
    .input('password', hashedPassword)
    .query(`
      INSERT INTO Users (name, email, password)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.email
      VALUES (@name, @email, @password)
    `);

  return result.recordset[0];
};

const login = async ({ email, password }) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('email', email)
    .query('SELECT id, name, email, password FROM Users WHERE email = @email');

  const user = result.recordset[0];
  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Invalid credentials' };

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email } };
};

const getProfile = async (userId) => {
  const pool = await getPool();

  const result = await pool.request()
    .input('id', userId)
    .query('SELECT id, name, email, created_at FROM Users WHERE id = @id');

  const user = result.recordset[0];
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
};

module.exports = { register, login, getProfile };