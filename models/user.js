const db = require('../core/db');
const userSchema = new db.Schema({
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
    streak:{
        type: Number,
        default: 0
    },
    lastDeposit:{
        type: Date,
        default: Date.now
    },
    itemCount:{
        type: Number,
        default: 0
    },
    createdOn:{
        type: Date,
        default: Date.now
    },
    role:{
        type: String,
        default: 'user'
    },
});
// Utility method to check and update streak
userSchema.methods.updateStreak = function(currentDate = new Date()) {
    // Normalize both dates to midnight
    const last = new Date(this.lastDeposit);
    last.setHours(0,0,0,0);
    const now = new Date(currentDate);
    now.setHours(0,0,0,0);

    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
        this.streak += 1;
    } else if (diffDays > 1) {
        this.streak = 1;
    }
    // If diffDays === 0, do not update streak
    this.lastDeposit = currentDate;
    return true;
};

const User = db.model('User', userSchema);
module.exports = User;
