const cv = require('opencv4nodejs');
async function captureImage(deviceIndex = 1) {
  try {
    const cap = new cv.VideoCapture(deviceIndex);
    const frame = cap.read();
    if (frame.empty) {
      cap.read();
    }

    const buffer = cv.imencode('.jpg', frame); // You can change to '.png' if needed
    cv.imwrite('captured_image.jpg', frame);
    return buffer;
  } catch (err) {
    console.error('Error capturing image:', err.message);
    throw err;
  }
}

module.exports = captureImage;
