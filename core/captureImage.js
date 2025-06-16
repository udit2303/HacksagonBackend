const NodeWebcam = require('node-webcam');

const captureImage = (outputPath = 'capture.jpg', options = {}) => {
    return new Promise((resolve, reject) => {
        const webcam = NodeWebcam.create({
            width: 1280,
            height: 720,
            quality: 100,
            output: "jpeg",
            device: 0,
            callbackReturn: "location",
            verbose: false,
            ...options
        });

        webcam.capture(outputPath, function(err, data) {
            if (err) return reject(err);
            // Resolve the imageBuffer
            const fs = require('fs');
            fs.readFile(data, (err, imageBuffer) => {
                if (err) return reject(err);
                // Resolve the image buffer in the image/ jpeg format
                
                resolve(imageBuffer);
            });
        });
    });
};

module.exports = captureImage;