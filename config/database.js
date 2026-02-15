const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string' || !uri.startsWith('mongodb')) {
    console.error(
      'MONGODB_URI is missing or invalid. Set it in Render Dashboard → Environment to your MongoDB Atlas connection string (e.g. mongodb+srv://...@cluster0.xxxxx.mongodb.net/...)'
    );
    process.exit(1);
  }
  if (/localhost|127\.0\.0\.1|::1/.test(uri)) {
    console.error(
      'MONGODB_URI points to localhost. On Render you must use MongoDB Atlas (mongodb+srv://...). Set MONGODB_URI in Render Dashboard → Environment.'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    if (error.message.includes('timed out')) {
      console.error(
        'Tip: If using localhost, ensure MongoDB is running. Otherwise use MongoDB Atlas and set MONGODB_URI to your Atlas connection string.'
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
