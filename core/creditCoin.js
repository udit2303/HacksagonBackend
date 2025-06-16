const transaction = require('../models/transaction');
const {saveTransaction} = require('../core/redis');
async function creditTransaction(user, type, amount, description) {
    const newTransaction = new transaction({
        user: user._id,
        type: type,
        amount: amount,
        description: description
    });
    await newTransaction.save();
}
const creditCoin = async (user, amount, type) => {
    const maxReward = 30;
    const streak = user.streak || 0;
    const reward = Math.min(maxReward, Math.floor(streak * streak / 4));
    user.coins += amount + reward;
    user.updateStreak();
    await user.save();
    await saveTransaction(user._id, 'credit', amount + reward, `Recycled ${type}`);
}
module.exports = {creditCoin};