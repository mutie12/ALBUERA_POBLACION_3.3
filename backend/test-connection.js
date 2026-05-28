require('dotenv').config();
const mongoose = require('mongoose');
console.log('Connecting to:', process.env.MONGO_URI.replace(/:[^@]*@/, ':***@'));
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 30000,
})
  .then(() => {
    console.log('MongoDB Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB ERROR:', err.message);
    console.error('CODE:', err.code);
    process.exit(1);
  });
