const express = require('express');
const router = express.Router();
const Machine = require('../models/machine');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const {authenticateToken} = require('../middleware/auth');
const {creditCoin} = require('../core/creditCoin');
// Initate authentication for the machine
router.get('/initiate', async (req, res) => {
    const {id} = req.query;
    const API_KEY = req.headers['x-api-key'];
    const machine = await Machine.findOne({id: id});
    if(!machine) {
        return res.status(404).send("Machine not found");
    }
    bcrypt.compare(API_KEY, machine.apiKey, (err, result) => {
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        if (result) {
            const code = crypto.randomBytes(10).toString('hex');
            machine.sessionCode = code;
            // Expires after 5 min
            machine.expiresAt = new Date(Date.now() + 5*60*1000);
            return res.status(200).json({sessionCode: code});
        }
        return res.status(401).send("Unauthorized");
    });
});
//User route, login the user to the machine
router.get('/authenticate', authenticateToken, async (req, res) => {
    const {id, sessionCode} = req.query;
    const machine = await Machine.findOne({id, sessionCode});
    if (!machine) {
        return res.status(404).send("Machine not found or session expired");
    }
    Machine.user = req.user._id;
    machine.expiresAt = new Date(Date.now() + 5*60*1000); // Extend session for 5 minutes
    await machine.save();
    res.status(200).send("Machine authenticated successfully");
});

//Start processing the waste in the machine
router.post('/start', async (req, res) => {
    const {id, sessionCode} = req.body;
    const API_KEY = req.headers['x-api-key'];
    const machine = await Machine
        .findOne({id: id})
        .where('sessionCode').equals(sessionCode)
        .where('expiresAt').gt(new Date());
    if (!machine) {
        return res.status(404).send("Machine not found or session expired");
    }
    bcrypt.compare(API_KEY, machine.apiKey, async (err, result) => {
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        if (result) {
            if(machine.user) {
                try{
                    // Click picture from the webcam and send it to python backend
                    const processedData =  {'type': 'plastic', 'coins': 10}; // This is a placeholder, replace with actual logic to process waste
                    await creditCoin(req.user, processedData.coins); // Credit coins to the user
                    await req.user.updateStreak(); // Update user streak
                    await req.user.save(); // Save the user with updated coins
                    return res.status(200).json(processedData); // Machine will move waste according
                } catch (error) {
                    console.error("Error processing waste:", error);
                    return res.status(500).send("Error processing waste");
                }
            }
            return res.status(403).send("Machine not authenticated to a user");
        }
        return res.status(401).send("Unauthorized");
    });
});

// This route is used to reset the machine, it will clear the session code and user associated with the machine
router.post('/reset', async (req, res) => {
    const {id} = req.body;
    const API_KEY = req.headers['x-api-key'];
    const machine = await Machine.findOne({id: id});
    if (!machine) {
        return res.status(404).send("Machine not found");
    }
    bcrypt.compare(API_KEY, machine.apiKey, (err, result) => {
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        if (result) {
            machine.sessionCode = null;
            machine.expiresAt = null;
            machine.user = null;
            machine.save().then(() => {
                console.log("Machine reset successfully");
            }).catch((error) => {
                console.error("Error resetting machine:", error);
                return res.status(500).send("Error resetting machine");
            });
            return res.status(200).send("Machine reset successfully");
        }
        return res.status(401).send("Unauthorized");
    });
});

router.post('/terminate', async (req, res) => {
    const {id, sessionCode} = req.body;
    const API_KEY = req.headers['x-api-key'];
    const machine = await Machine
        .findOne({id: id})
        .where('sessionCode').equals(sessionCode);
    if (!machine) {
        return res.status(404).send("Machine not found or session expired");
    }
    bcrypt.compare(API_KEY, machine
        .apiKey, (err, result) => {
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        if (result) {
            machine.sessionCode = null;
            machine.expiresAt = null;
            machine.user = null;
            machine.save().then(() => {
                console.log("Machine session terminated successfully");
            }).catch((error) => {
                console.error("Error terminating machine session:", error);
                return res.status(500).send("Error terminating machine session");
            });
            return res.status(200).send("Session terminated");
        }
        return res.status(401).send("Unauthorized");
    });
});