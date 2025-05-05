import { existsSync, mkdirSync } from "fs";

export default function ensureDir(dir: URL) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}