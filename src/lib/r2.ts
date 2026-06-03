import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: "token", // Literal string "token" is required when passing an API Token
    secretAccessKey: process.env.CLOUDFLARE_API_TOKEN || "",
  },
});

export const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || "";
export const R2_PUBLIC_CUSTOM_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";
