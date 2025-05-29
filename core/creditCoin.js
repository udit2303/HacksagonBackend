const creditCoin = async (user, amount) => {
    const maxReward = 30;
    const streak = user.streak || 0;
    const reward = Math.min(maxReward, Math.floor(streak * streak / 4));
    user.coins += amount + reward;
    await user.save();
}
module.exports = {creditCoin};