import saveIndexFile from "../utils/saveFile.js";

type ParsedTable = {
  [key: string]: any;
};

export async function emitter(obj: ParsedTable, basePath: URL): Promise<void> {
  const keys = Object.keys(obj);

  for (const key of keys) {
    const measurements = obj[key];

    const dir = new URL(`${key}/`, basePath);

    if (Array.isArray(measurements)) {
      const content = `export type ${key} = ${measurements.map((m) => `"${m.unit}"`).join(" | ")};`;
      await saveIndexFile(content, dir);
    } else if (typeof measurements === "object" && measurements !== null) {
      await emitter(measurements, dir); // <-- await added
    }
  }

  const pathParts = basePath.pathname.split("/");
  const folder = pathParts[pathParts.length - 2];
  const typeName = folder === "generated" ? "CssMeasurements" : folder;

  const imports = keys
    .map((key) => `import type { ${key} } from './${key}';`)
    .join("\n");

  const typeUnion = keys.join(" | "); // <-- fixed union construction

  const content = `${imports}\n\nexport type ${typeName} = ${typeUnion};`;
  await saveIndexFile(content, basePath);
}
