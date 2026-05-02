import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");

const configuredUploadsDir = process.env.UPLOADS_DIR?.trim();
const configuredPublicBase = process.env.UPLOADS_PUBLIC_URL_BASE?.trim();

export const uploadsDir = configuredUploadsDir
  ? path.resolve(projectRoot, configuredUploadsDir)
  : path.join(projectRoot, "uploads");

export const uploadsPublicUrlBase = configuredPublicBase || "/uploads";

export function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export function buildStoredFileUrl(filename) {
  const safeBase = uploadsPublicUrlBase.endsWith("/")
    ? uploadsPublicUrlBase.slice(0, -1)
    : uploadsPublicUrlBase;

  return `${safeBase}/${filename}`;
}
