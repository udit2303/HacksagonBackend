const express = require('express');
const {getCache, setCache} = require('../core/redis');
const router = express.Router();

// Example route: GET /users
router.get('/', (req, res) => {
    res.send('User route');
});

module.exports = router;