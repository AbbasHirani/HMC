import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, public_id: publicId, overwrite: true, resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('Upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // ignore — image may already be gone
  }
}
