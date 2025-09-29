import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const generateUploadUrl = async (key: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  return {
    url: signedUrl,
    key,
  };
};

export const getFileUrl = (key: string) => {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export const validateFile = (file: File) => {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '5242880'); // 5MB default
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (file.size > maxSize) {
    throw new Error('File size exceeds limit');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }

  return true;
};

export const generateKey = (userId: string, fileName: string) => {
  const extension = fileName.split('.').pop();
  const timestamp = Date.now();
  return `uploads/${userId}/${timestamp}-${fileName}`;
};
