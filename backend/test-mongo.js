const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');

const uri = 'mongodb://AlbueraESDB:MonkeyD%2ELuffy12@albueraesdb-shard-00-00.4kmpz5z.mongodb.net:27017,albueraesdb-shard-00-01.4kmpz5z.mongodb.net:27017,albueraesdb-shard-00-02.4kmpz5z.mongodb.net:27017/Albuera-PoblacionEMS?ssl=true&replicaSet=atlas-12fq44-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  maxPoolSize: 20,
  minPoolSize: 5,
})
.then(() => {
  console.log('MongoDB connected successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});
