const mongoose = require('mongoose');
require('dotenv').config();
const url = process.env.MONGO_URL;
mongoose.connect(url);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to database');
});
module.exports = mongoose;