const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('Make sure MongoDB is running locally (brew services start mongodb-community) or update MONGO_URI in .env');
        // Do not exit process so the server remains up to report the error
        // process.exit(1); 
    }
};

module.exports = connectDB;
