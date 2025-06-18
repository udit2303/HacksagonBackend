const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();
const transaction = require('../models/transactions');
const user = require('../models/user');
const userCoupon = require('../models/coupon');
const client = redis.createClient({
    url:process.env.REDIS_URL,
});
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});
client.connect(process.env.REDIS_URL)
    .then(() => console.log('Redis client connected'))
    .catch(err => console.error('Redis connection error', err));

const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes

async function setCache(key, value) {
    await client.set(key, JSON.stringify(value), {
        EX: CACHE_TTL_SECONDS,
    });
    
}
async function saveTransaction(user, type, amount, description) {
    const newTransaction = new transaction({
        user: user._id,
        type: type,
        amount: amount,
        description: description,
    });
    await newTransaction.save();
    await user.save();
    const data = await client.get(user.email);
    if (data) {
        const cachedData = JSON.parse(data);
        cachedData.transactions.unshift({
            _id: newTransaction._id,
            type: newTransaction.type,
            amount: newTransaction.amount,
            description: newTransaction.description,
            date: newTransaction.date.toISOString(),
        });
        cachedData.transactions = cachedData.transactions.slice(0, 10);
        cachedData.coins = user.coins;
        cachedData.streak = user.streak;
        await setCache(user.email, cachedData);
    }
}
async function saveCoupon(user, couponData) {
    const newCoupon = new userCoupon({
        userId: user._id,
        code: couponData.code,
        brand: couponData.brand,
        image: couponData.image,
        link: couponData.link,
        category: couponData.category,
    });
    await newCoupon.save();
    await saveTransaction(user, 'debit', couponData.coins , `Redeemed coupon from ${couponData.brand}`);
    const data = await client.get(user.email);
    if (data) {
        const cachedData = JSON.parse(data);
        cachedData.coupons.push({
            code: newCoupon.code,
            brand: newCoupon.brand,
            image: newCoupon.image,
            link: newCoupon.link,
            category: newCoupon.category,
        });
        await setCache(user.email, cachedData);
    }
}
async function getCache(key) {
    const data = await client.get(key);
    if(!data) {
        const userData = await user.findOne({ email: key });
        if (!userData) {
            return null; // User not found
        }
        const coupons = await userCoupon.find({ userId: userData._id });
        userData.coupons = coupons.map(coupon => ({
            code: coupon.code,
            brand: coupon.brand,
            image: coupon.image,
            link: coupon.link,
            category: coupon.category,
        }));
        const transactionData = await transaction.find({ user: userData._id }).sort({ date: -1 }).limit(10);
        userData.transactions = transactionData.map(tx => ({
            _id: tx._id,
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            date: tx.date.toISOString(),
        }));
        const dataToCache = {
            _id: userData._id,
            email: userData.email,
            username: userData.username,
            coins: userData.coins,
            streak: userData.streak,
            lastDeposit: userData.lastDeposit,
            transactions: userData.transactions,
            coupons: userData.coupons,
        };
        await setCache(key,dataToCache);
        return dataToCache;     
    }
    const cachedData = JSON.parse(data);
    return cachedData;
}

module.exports = {
    saveTransaction,
    saveCoupon,
    getCache,
    client,
};