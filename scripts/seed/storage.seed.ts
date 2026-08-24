import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({
  path: [path.join(process.cwd(), ".env")],
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const PUBLIC_BUCKET = "public_file_storage";
const PRIVATE_BUCKET = "private_file_storage";

const contentTypes: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".xml": "application/xml",
  ".zip": "application/zip",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function getContentType(extension: string): string {
  return contentTypes[extension] || "application/octet-stream";
}

async function main() {
  try {
    await supabase.storage.deleteBucket(PUBLIC_BUCKET);
    await supabase.storage.deleteBucket(PRIVATE_BUCKET);

    await supabase.storage.createBucket(PUBLIC_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
      allowedMimeTypes: ["image/*"],
    });
    await supabase.storage.createBucket(PRIVATE_BUCKET, {
      public: false,
    });
  } catch (error) {
    throw error;
  }
}

main()
  .then(() => {
    console.log("Storage seeded successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding storage:", error);
    process.exit(1);
  });
