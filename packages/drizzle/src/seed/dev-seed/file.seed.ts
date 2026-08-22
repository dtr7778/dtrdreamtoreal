import crypto from "node:crypto";

import { faker } from "@faker-js/faker";

import { FileDataModel, FileTable, InsertFile } from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedFile(): Promise<Array<FileDataModel>> {
  console.log("🌱 Seeding files...");

  const fileData: Array<Omit<InsertFile, "entityType" | "entityId">> =
    Array.from({
      length: seedConfigs.targets.files,
    }).map(() => {
      const filename = faker.system.fileName();
      const key = generateKey(filename);
      return {
        filename,
        originalName: filename,
        mimeType: faker.system.mimeType(),
        size: 2000,
        key,
      } satisfies InsertFile;
    });

  const files = await db.insert(FileTable).values(fileData).returning();

  console.log(`✅ ${files.length} files seeded`);
  return files;
}

function generateKey(filename: string): string {
  const ext = filename.includes(".") ? filename.split(".").pop()! : null;
  const id = crypto.randomBytes(16).toString("hex");
  return ext ? `${id}.${ext}` : id;
}
