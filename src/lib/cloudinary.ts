import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  secure: true,
  api_proxy: 'http://proxy.server:3128',
  timeout: 60000 // 60 seconds timeout
});

export const uploadImage = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
return new Promise((resolve) => {
    cloudinary.uploader.upload_stream((error, uploadResult) => {
        return resolve(uploadResult);
    }).end(buffer);
})
}