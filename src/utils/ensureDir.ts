import { promises as fsPromises } from "fs";

export default async function ensureDir(dir: URL) {
  try {
    await fsPromises.access(dir);
  } catch {
    await fsPromises.mkdir(dir, { recursive: true });
  }
}
