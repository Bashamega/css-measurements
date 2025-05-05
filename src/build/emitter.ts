import saveIndexFile from "../utils/saveFile.js";

type ParsedTable = {
  [key: string]: any;
};

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
  const keys = Object.keys(obj)
  const pathParts = basePath.pathname.split('/');
  const folder = pathParts[pathParts.length - 2];
  const content = `type ${folder === "generated" ? "CssMeasurements" : folder + "Measurements"} = ${keys.map(key => folder === "generated" ? key + "Measurements" : key).join(" | ")}`;
  saveIndexFile(content, basePath)
}
