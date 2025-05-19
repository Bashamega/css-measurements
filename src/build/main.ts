import { merge } from "../utils/merge.js";
import { emitter } from "./emitter.js";
import { parseMarkdown } from "./parser.js";
import { writeFile, readFile } from "fs/promises";

const basePath = new URL(
  "../../mdn-content/files/en-us/web/css/css_values_and_units/numeric_data_types/index.md",
  import.meta.url,
);
const jsonPath = new URL("../../input/addedTypes.json", import.meta.url);
const outputFilePath = new URL("../../output/properties.json", import.meta.url);
const generatedPath = new URL("../../generated/", import.meta.url);

async function processMarkdownData() {
  // Read json file
  const addedTypes = await readFile(jsonPath, "utf-8");

  // Parse the markdown file
  let parsedData = await parseMarkdown(basePath);

  // Merge the parsed data with the JSON data
  parsedData = merge(parsedData, JSON.parse(addedTypes));

  // Write the parsed data to a JSON file
  await writeFile(outputFilePath, JSON.stringify(parsedData, null, 2));

  // Generate files
  await emitter(parsedData, generatedPath);
}

processMarkdownData();
