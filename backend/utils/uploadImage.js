const cloudinary = require('../config/cloudinary');

// Wraps Cloudinary's upload_stream in a Promise so controllers can just
// `await` it. Takes an in-memory buffer (from multer) rather than a file
// path, since nothing here ever touches disk.
const uploadImage = (fileBuffer, folder = 'food-delivery-app') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

module.exports = uploadImage;
