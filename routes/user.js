const express = require('express');
const {getCache, setCache} = require('../core/redis');
const router = express.Router();

// Example route: GET /users
router.get('/', async (req, res) => {
    const data = await getCache(req.user);
    if (data) {
        return res.status(200).json(data);
    } else {
        return res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;