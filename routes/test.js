const machine = require('../models/machine');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
router.post('/create', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).send("All fields are required");
    }
    try {
        let name = 'test-machine';
        let location = 'test-location';

        const hashedApiKey = await bcrypt.hash(apiKey, 10);
        const newMachine = new machine({
            id: Date.now(), // Simple unique ID based on timestamp
            name,
            location,
            apiKey: hashedApiKey
        });
        await newMachine.save();
        return res.status(201).send("Machine created successfully");
    } catch (error) {
        console.error("Error creating machine:", error);
        return res.status(500).send("Internal Server Error");
    }
});
module.exports = router;