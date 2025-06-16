const db = require('../core/db');
const transactionSchema = new db.Schema({
    user: {
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const Transaction = db.model('Transaction', transactionSchema);
module.exports = Transaction;