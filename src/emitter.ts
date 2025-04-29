import * as fs from 'fs';

type ParsedTable = {
  [key: string]: any;
};

function ensureDir(dir: URL) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
function saveIndexFile(units: string, dir: URL) {
  ensureDir(dir);
  const filePath = new URL('index.d.ts', dir);
  fs.writeFileSync(filePath, units, 'utf8');
  console.log(`Saved: ${filePath.pathname}`);
}

export function emitter(obj: ParsedTable, basePath: URL) {
  for (const key in obj) {
    const measurements = obj[key];

    if (Array.isArray(measurements)) {
      const dir = new URL(`${key}/`, basePath)
      const content = `type ${key} = ${measurements.map(m => `"${m.unit}"`).join(" | ")}`;
      saveIndexFile(content, dir);
    } else if (typeof measurements === 'object') {
      const dir = new URL(`${key}/`, basePath);
      emitter(measurements, dir);
    }
  }
}
