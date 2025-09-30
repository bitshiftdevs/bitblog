import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let r2Client: S3Client | null = null;

function getR2Client() {
  if (!r2Client) {
    const config = useRuntimeConfig();

    if (
      !config.r2AccessKeyId ||
      !config.r2SecretAccessKey ||
      !config.r2BucketName
    ) {
      throw new Error("Cloudflare R2 configuration is incomplete");
    }

    r2Client = new S3Client({
      region: "auto",
      endpoint: config.r2Endpoint,
      credentials: {
        accessKeyId: config.r2AccessKeyId,
        secretAccessKey: config.r2SecretAccessKey,
      },
    });
  }

  return r2Client;
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string,
) {
  const config = useRuntimeConfig();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  console.log(config.public.r2PublicUrl);
  // Generate public URL
  const publicUrl = `${config.public.r2PublicUrl}/${key}`;

  return publicUrl;
}

export async function deleteFromR2(key: string) {
  const config = useRuntimeConfig();
  const client = getR2Client();

  const command = new DeleteObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
  });

  await client.send(command);
}

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
) {
  const config = useRuntimeConfig();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn });

  return presignedUrl;
}

export function generateMediaKey(filename: string, userId?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const fileExtension = filename.split(".").pop();
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  const prefix = userId ? `user-${userId}` : "uploads";
  return `${prefix}/${timestamp}-${randomString}-${sanitizedName}`;
}

export function getFileTypeFromMime(
  mimeType: string,
): "image" | "video" | "audio" | "document" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text/")
  )
    return "document";
  return "other";
}

export function validateFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Videos
    "video/mp4",
    "video/webm",
    "video/ogg",
    // Audio
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    // Documents
    "application/pdf",
    "text/plain",
  ];

  return allowedTypes.includes(mimeType.toLowerCase());
}

export function validateFileSize(
  size: number,
  type: "image" | "video" | "audio" | "document" | "other",
): boolean {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    audio: 50 * 1024 * 1024, // 50MB
    document: 25 * 1024 * 1024, // 25MB
    other: 10 * 1024 * 1024, // 10MB
  };

  return size <= maxSizes[type];
}
