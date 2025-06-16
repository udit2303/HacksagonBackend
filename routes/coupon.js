const express = require('express');
const crypt = require('crypto');
const storeCoupon = require('../models/storeCoupons');
const userCoupon = require('../models/coupon');
const User = require('../models/user');
const transaction = require('../models/transaction');
const { saveCoupon } = require('../core/redis');
const router = express.Router();

async function createTransaction(user, amount, description) {
    const newTransaction = new transaction({
        user: user._id,
        type: 'debit',
        amount: amount,
        description: description
    });
    await newTransaction.save();
}


router.get('/:page', async(req, res) => {
    const page = parseInt(req.params.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const coupons = await storeCoupon.find()
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1});
    const totalCoupons = await storeCoupon.countDocuments();
    const totalPages = Math.ceil(totalCoupons / limit);
    res.json({
        coupons,
        pagination: {
            currentPage: page,
            totalPages,
            totalCoupons
        }
    });
});
router.post('/:id', async(req, res) => {
    if(!req.params.id){
        return res.status(400).json({message: 'Bad Request'});
    }
    const user = await User.findOne({email: req.user});
    if(!user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    const coupon = await storeCoupon.findOne({id: req.params.id});
    if(!coupon){
        return res.status(404).json({message: 'Not Found'});
    }
    if(user.coins < coupon.coins){
        return res.status(403).json({message: 'Forbidden'});
    }
    userData.coins -= couponData.coins;
    await user.save();
    const couponCode = crypt.randomBytes(8).toString('hex');
    coupon.code = couponCode;
    await saveCoupon(user._id, coupon);
    res.json({couponCode});
});

router.post('/', async(req, res) => {
    const user = await User.findOne({email: req.user});
    if(!user || user.role !== 'admin'){
        return res.status(401).json({message: 'Unauthorized'});
    };
    const {coins, category, image, link, brand} = req.body;
    if(!coins || !category || !image || !link || !brand || category === '' || image === '' || link === '' || brand === ''){
        return res.status(400).json({message: 'Bad Request'});
    }
    const created = await storeCoupon.create({coins, category, image, link, brand});
    res.status(201).json({message: 'Created', id: created.id});
});


router.put('/:id', (req, res) => {
    res.send(`Update coupon with ID ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
    res.send(`Delete coupon with ID ${req.params.id}`);
});

module.exports = router;