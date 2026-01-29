const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI || "";
    console.log(`Checking MONGO_URI: length=${uri.length}, startsWith="mongodb"=${uri.startsWith('mongodb')}, base64Prefix="${Buffer.from(uri.substring(0, 15)).toString('base64')}"`);

    try {
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('Check your MONGO_URI in Render Environment Variables.');
        console.error('Also ensure 0.0.0.0/0 is allowed in MongoDB Atlas Network Access.');
    }
};

module.exports = connectDB;
