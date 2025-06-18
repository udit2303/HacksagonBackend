const {Router} = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = Router();
router.post('/login', (req, res) => {
    const {username, password} = req.body;
    if(!username || !password || username === '' || password === ''){
        return res.status(400).json({message: 'Invalid username or password'});
    };
    User
        .findOne({username: username})
        .then(user => {
            if(!user){
                return res.status(400).json({message: 'Invalid username or password'});
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if(err){
                    return res.status(500).json({message: 'Internal server error'});
                }
                if(result){
                    const accessToken = jwt.sign(user.email, process.env.ACCESS_TOKEN_SECRET);
                    res.cookie('accessToken', accessToken, {
                        httpOnly: true,    // Prevents JS access
                        secure: true,      // Only send over HTTPS
                        sameSite: 'Strict', // Protects against CSRF
                        maxAge: 24 * 60 * 60 * 1000 // 1 day
                    });
                    return res.status(200).json({message: 'Login successful'});
                }
                return res.status(400).json({message: 'Invalid username or password'});
            });
        })
        .catch(err => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/register', (req, res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password || username === '' || email === '' || password === ''){
        return res.status(400).json({message: 'Invalid username, email or password'});
    }
    bcrypt.hash(password, 10, (err, hash) => {
        if(err){
            return res.status(500).json({message: 'Internal server error'});
        }
        const user = new User({
            username: username,
            email: email,
            password: hash
        });
        user.save()
            .then(() => {
                return res.sendStatus(201);
            })
            .catch(err => {
                console.error(err);
                return res.sendStatus(500);
            });
    });
});
module.exports = router;