const mysql = require('mysql2/promise');

// Database configuration
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'dev1',
  database: 'theater_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create pool but don't wait for async validation
const pool = mysql.createPool(DB_CONFIG);

// Async validation (log errors but don't block server startup)
pool.getConnection()
  .then(conn => {
    console.log('✓ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('✗ Database connection error:', err.message);
    console.error('Server will continue but database operations will fail');
  });

// Get connection
async function getConnection() {
  return await pool.getConnection();
}

// Query helper
async function query(sql, values) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
}

// Execute with transaction
async function executeTransaction(callback) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getConnection,
  query,
  executeTransaction
};
