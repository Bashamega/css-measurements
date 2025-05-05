import { writeFileSync } from "fs";
import ensureDir from "./ensureDir.js";

export default function saveIndexFile(units: string, dir: URL) {
    ensureDir(dir);
    const filePath = new URL('index.d.ts', dir);
    writeFileSync(filePath, units, 'utf8');
    console.log(`Saved: ${filePath.pathname}`);
}