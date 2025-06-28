const express = require('express');
const router = express.Router();
const Machine = require('../models/machine');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const FormData = require('form-data');
const {authenticateToken} = require('../middleware/auth');
const {creditCoin} = require('../core/creditCoin');
const captureImage = require('../core/captureImage');
const axios = require('axios');
require('dotenv').config();

// Initate authentication for the machine
router.get('/initiate', async (req, res) => {
    console.log("start");
    const {id} = req.query;
    const API_KEY = req.headers['x-api-key'];
    const machine = await Machine.findOne({id: id});
    if(!machine) {
        return res.status(404).send("Machine not found");
    }
    bcrypt.compare(API_KEY, machine.apiKey, async (err, result) => {
        if (err) {
            return res.status(500).send("Internal Server Error");
        }
        if (result) {
            const code = crypto.randomBytes(6).toString('hex');
            machine.sessionCode = code;
            // Expires after 5 min
            machine.expiresAt = new Date(Date.now() + 5*60*1000);
            machine.user = null; // Clear any previous user session
            await machine.save();
            return res.status(200).json({sessionCode: code});
        }
        return res.status(401).send({error:"Unauthorized"});
    });
});
//User route, login the user to the machine
router.get('/authenticate', authenticateToken, async (req, res) => {
    console.log("User authenticated:", req.user);
    const {sessionCode} = req.query;
    const machine = await Machine.findOne({sessionCode});
    if (!machine) {
        return res.status(404).json({error:"Machine not found or session expired"});
    }
    machine.user = req.user;
    machine.expiresAt = new Date(Date.now() + 5*60*1000); // Extend session for 5 minutes
    await machine.save();
    res.status(200).send("Machine authenticated successfully");
});
router.get("/check", async (req, res) => {
    const {id} = req.query;
    const machine = await Machine.findOne({id: id});
    if (!machine) {
        return res.status(404).send("Machine not found");
    }
    return res.status(200).json({
        loggedIn: machine.user ? true : false
    });
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
                    const user = await User.findOne({email:machine.user});
                if (!user) {
                    return res.status(404).send("User not found");
                }
                    // Capture image from the webcam
                    const imageBuffer = await captureImage();
                    // Read the image, capture.jpg is the image captured from the webcam
                    const formData = new FormData();
                    formData.append('file', imageBuffer,{
                        filename: 'capture.jpg',
                        contentType: 'image/jpeg'
                    });
                    const response = await axios.post(process.env.WASTE_PROCESSING_API_URL, formData, {
                        headers: formData.getHeaders(),
                    });
                    if (response.status !== 200) {
                        console.error("Error processing waste:", response.statusText);
                        return res.status(500).send("Error processing waste");
                    }

                    const responseData = response.data;
                    console.log("Waste processed successfully:", responseData);
                    const processedData = {type: responseData.predicted_class};
                    if (responseData.predicted_class === 'plastic') {
                        processedData.coins = 10; 
                    } else if (responseData.predicted_class === 'paper') {
                        processedData.coins = 5; 
                    } else if (responseData.predicted_class === 'metal') {
                        processedData.coins = 15;
                    }
                    else if(responseData.predicted_class === 'glass'){
                        processedData.coins = 15;
                    }
                    await creditCoin(user, processedData.coins, processedData.type); // Credit coins to the user
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

module.exports = router;