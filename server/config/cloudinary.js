const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadImage = async (filePath, folder = 'repair_tracker') => {
  if (isCloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    // Remove local temp file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } else {
    // Local static upload fallback
    const fileName = path.basename(filePath);
    const targetDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, fileName);
    if (filePath !== targetPath && fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, targetPath);
      fs.unlinkSync(filePath);
    }
    return {
      url: `/uploads/${fileName}`,
      public_id: `local_${fileName}`,
    };
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadImage,
};
