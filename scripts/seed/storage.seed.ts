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

const STORAGE_BUCKET_NAME = "file_storage";

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
    await supabase.storage.deleteBucket(STORAGE_BUCKET_NAME);

    await supabase.storage.createBucket(STORAGE_BUCKET_NAME, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50 MB
      allowedMimeTypes: [
        // image
        "image/*",
        // PDF
        "application/pdf",
        // Microsoft Word
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        // Microsoft Excel
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        // Text files
        "text/plain", // .txt
        "text/csv", // .csv
        // Rich Text
        "application/rtf", // .rtf
      ],
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
