const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadToCloudinary = (buffer, folder = 'kavya_ecommerce') => {
  return new Promise((resolve, reject) => {
    // If credentials are empty or placeholders, provide helpful error or fallback
    const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('123456789012345');
    
    if (isMock) {
      console.warn('[Cloudinary] Using default/mock credentials. To persist to real Cloudinary account, set valid CLOUDINARY_* keys in .env.');
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          // If network / credential error in dev mode, return fallback high-quality placeholder image
          if (isMock) {
            const fallbackUrl = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80`;
            return resolve(fallbackUrl);
          }
          reject(error || new Error('Cloudinary upload failed'));
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};

