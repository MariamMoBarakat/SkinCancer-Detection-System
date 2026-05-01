const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const connectDB = async () => {
  try {
    const initialConnection = await mysql.createConnection({
      host: process.env.DB_SERVER,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await initialConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``
    );

    console.log(' Database ensured');

    await initialConnection.end();

    pool = mysql.createPool({
      host: process.env.DB_SERVER,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log(' Connected to MySQL successfully');

    await createTables();
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    process.exit(1);
  }
};


const createTables = async () => {
  try {
    const conn = await pool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Users (
        UserID INT AUTO_INCREMENT PRIMARY KEY,
        FullName VARCHAR(100) NOT NULL,
        Email VARCHAR(150) UNIQUE NOT NULL,
        PasswordHash VARCHAR(255) NOT NULL,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        IsActive BOOLEAN DEFAULT TRUE
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS MedicalImages (
        ImageID INT AUTO_INCREMENT PRIMARY KEY,
        UserID INT,
        ImagePath VARCHAR(500) NOT NULL,
        OriginalName VARCHAR(255),
        FileSize INT,
        UploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS Diagnosis (
        DiagnosisID INT AUTO_INCREMENT PRIMARY KEY,
        ImageID INT,
        MoleType VARCHAR(100) NOT NULL,
        Confidence FLOAT NOT NULL,
        RiskLevel VARCHAR(50),
        AIModelResponse TEXT,
        DiagnosedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ImageID) REFERENCES MedicalImages(ImageID)
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS User_Diagnosis (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        UserID INT,
        DiagnosisID INT,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (DiagnosisID) REFERENCES Diagnosis(DiagnosisID)
      );
    `);

    conn.release();

    console.log(' MySQL tables ready');
  } catch (error) {
    console.error(' Error creating tables:', error.message);
  }
};

const getPool = () => {
  if (!pool) throw new Error('Database not connected');
  return pool;
};

module.exports = { connectDB, getPool };