import { AwsClient } from "aws4fetch";

export const DEFAULT_UPLOAD_TTL = 300;
export const DEFAULT_DOWNLOAD_TTL = 3600;

export interface R2Config {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  uploadTtl?: number;
  downloadTtl?: number;
}

export interface PresignUploadOptions {
  key: string;
  contentType?: string;
  contentLength?: number;
  expiresIn?: number;
}

export interface PresignDownloadOptions {
  key: string;
  expiresIn?: number;
}

export interface StorageSigner {
  presignUpload(options: PresignUploadOptions): Promise<string>;
  presignDownload(options: PresignDownloadOptions): Promise<string>;
  buildObjectUrl(key: string): string;
}

function buildObjectUrl(config: R2Config, key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");

  return `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucketName}/${encodedKey}`;
}

/**
 * Creates a SigV4 presigner for an S3-compatible (Cloudflare R2) bucket.
 * Pure and isomorphic — the caller supplies credentials/config.
 */
export function createStorageSigner(config: R2Config): StorageSigner {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const uploadTtl = config.uploadTtl ?? DEFAULT_UPLOAD_TTL;
  const downloadTtl = config.downloadTtl ?? DEFAULT_DOWNLOAD_TTL;

  async function presignUpload({
    key,
    contentType,
    contentLength,
    expiresIn,
  }: PresignUploadOptions): Promise<string> {
    const url = new URL(buildObjectUrl(config, key));
    url.searchParams.set("X-Amz-Expires", String(expiresIn ?? uploadTtl));

    const headers: Record<string, string> = {};
    if (contentType) headers["content-type"] = contentType;
    if (contentLength !== undefined) {
      headers["content-length"] = String(contentLength);
    }

    const request = await client.sign(url, {
      method: "PUT",
      headers,
      aws: {
        signQuery: true,
        allHeaders: Object.keys(headers).length > 0,
      },
    });

    return request.url;
  }

  async function presignDownload({
    key,
    expiresIn,
  }: PresignDownloadOptions): Promise<string> {
    const url = new URL(buildObjectUrl(config, key));
    url.searchParams.set("X-Amz-Expires", String(expiresIn ?? downloadTtl));

    const request = await client.sign(url, {
      method: "GET",
      aws: { signQuery: true },
    });

    return request.url;
  }

  return {
    presignUpload,
    presignDownload,
    buildObjectUrl: (key) => buildObjectUrl(config, key),
  };
}
