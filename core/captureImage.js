require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const captureImage = (outputPath = 'capture.jpg', options = {}) => {
    return new Promise(async (resolve, reject) => {
        const ipCamUrl = process.env.IP_CAM_URL || 'http://192.168.29.176:8080/shot.jpg'; // Default URL if not set
        try {
            // Fetch the image as a buffer
            const response = await axios.get(ipCamUrl, { responseType: 'arraybuffer' });

            // The image buffer is ready to use
            const imageBuffer = Buffer.from(response.data, 'binary');
            fs.writeFileSync(outputPath, imageBuffer); // Save the image to the specified path
            resolve(imageBuffer);

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = captureImage;