import crypto from "node:crypto";

export abstract class BaseStorageService {
  protected generateKey(filename: string): string {
    const ext = filename.includes(".") ? filename.split(".").pop()! : null;
    const id = crypto.randomBytes(16).toString("hex");
    return ext ? `${id}.${ext}` : id;
  }
}
