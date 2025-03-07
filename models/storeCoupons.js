const db = require('../core/db');
const Coupon = db.model('StoreCoupon', new db.Schema({
    id:{
        type: Number,
        autoIncrement: true,
        unique: true,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    link:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    brand:{
        type: String,
        required: true
    },
    coins:{
        type: Number,
        required: true
    }
}));

module.exports = Coupon;