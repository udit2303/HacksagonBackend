const express = require('express');
const crypt = require('crypto');
const storeCoupon = require('../models/storeCoupons');
const userCoupon = require('../models/coupon');
const User = require('../models/user');
const router = express.Router();

router.get('/:id', async(req, res) => {
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
    user.coins -= coupon.coins;
    const couponCode = crypt.randomBytes(8).toString('hex');
    await userCoupon.create({userId: user.id, code: couponCode, coupon});
    await user.save();
    await userCoupon.save();
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