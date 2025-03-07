const db = require('../core/db');
const Coupon = db.model('userCoupon', new db.Schema({
    user: {
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code:{
        type: String,
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
}));
module.exports = Coupon;