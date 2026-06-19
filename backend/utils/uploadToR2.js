import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";

export async function uploadToR2(file, folder = "residents") {
  const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET, // ONLY bucket name here
      Key: fileKey,                  // ONLY path here
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${fileKey}`;
}