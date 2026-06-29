import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string,
  resourceType: 'image' | 'video' | 'auto' = 'image'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, public_id: publicId, overwrite: true, resource_type: resourceType,
          transformation: resourceType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
          eager: resourceType === 'video' ? [{ format: 'mp4', video_codec: 'auto' }] : undefined,
          eager_async: false // Wait for transcoding so the frontend can immediately play it with byte-ranges
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('Upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // ignore — file may already be gone
  }
}
