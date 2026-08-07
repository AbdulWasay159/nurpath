const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nurpath');
    console.log(`[NurPath DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[NurPath DB Warning] Database connection failed: ${error.message}. Running in memory fallback mode.`);
  }
};

module.exports = connectDB;
