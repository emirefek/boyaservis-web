const multer = require('multer');

const uploadMW = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  }
});

module.exports = uploadMW