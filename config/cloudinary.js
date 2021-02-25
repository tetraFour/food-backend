// import { v2 } from 'cloudinary';

const { v2 } = require('cloudinary');

v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export { v2 as cloudinary };
module.exports = v2;
