import { writeFile } from "fs/promises";
import ensureDir from "./ensureDir.js";

export default async function saveIndexFile(units: string, dir: URL) {
    await ensureDir(dir);
    const filePath = new URL('index.d.ts', dir);
    await writeFile(filePath, units, 'utf8');
    console.log(`Saved: ${filePath.pathname}`);
}