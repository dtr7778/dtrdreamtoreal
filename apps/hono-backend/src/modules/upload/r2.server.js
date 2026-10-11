import { createStorageSigner } from "@workspace/lib/storage";
import { getEnv } from "@/lib/env";
let cachedSigner;
export function getStorageSigner() {
    cachedSigner = createStorageSigner({
        accessKeyId: getEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY"),
        accountId: getEnv("R2_ACCOUNT_ID"),
        bucketName: getEnv("R2_BUCKET_NAME"),
        downloadTtl: getEnv("R2_DOWNLOAD_TTL"),
        uploadTtl: getEnv("R2_UPLOAD_TTL"),
    });
    return cachedSigner;
}
