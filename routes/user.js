const express = require('express');
const {getCache, setCache} = require('../core/redis');
const transactions = require('../models/transactions');
const User = require('../models/user');
const router = express.Router();

// Example route: GET /users
router.get('/', async (req, res) => {
    console.log("req for user data", req.user);
    const data = await getCache(req.user);
    if (data) {
        return res.status(200).json(data);
    } else {
        return res.status(404).json({ message: 'User not found' });
    }
});
router.get('/transactions', async (req, res) => {
    const user =await User.findOne({ email: req.user });
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    };
    const userTransactions = await transactions.find({ user: user._id }).sort({ createdAt: 1 });
    return res.status(200).json(userTransactions);

});

module.exports = router;