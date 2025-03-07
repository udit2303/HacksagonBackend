const db = require('../core/db');
const User = db.model('User', new db.Schema({
    email:{
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    coins:{
        type: Number,
        default: 0
    },
    role:{
        type: String,
        default: 'user'
    },
}));
module.exports = User;
