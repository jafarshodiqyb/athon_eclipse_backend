const cloudinary = require('cloudinary');

const connectCloudinary = async () => {
    await cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
      })
    console.log(`Cloudinary Connected`);
};



module.exports = connectCloudinary
