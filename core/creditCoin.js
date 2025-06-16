const {saveTransaction} = require('../core/redis');
const creditCoin = async (user, amount, type) => {
    const maxReward = 30;
    const streak = user.streak || 0;
    const reward = Math.min(maxReward, Math.floor(streak * streak / 4));
    user.coins += amount + reward;
    user.updateStreak();
    await saveTransaction(user, 'credit', amount + reward, `Recycled ${type}`);
}
module.exports = {creditCoin};