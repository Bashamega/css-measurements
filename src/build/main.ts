import { emitter } from "./emitter.js";
import { parseMarkdown } from "./parser.js";
import { writeFile } from "fs/promises";

const basePath = new URL(
    "../../mdn-content/files/en-us/web/css/css_values_and_units/numeric_data_types/index.md",
    import.meta.url
);
const outputFilePath = new URL(
    "../../output/properties.json",
    import.meta.url
);
const generatedPath = new URL(
    "../../generated/",
    import.meta.url
);

async function processMarkdownData() {
    const parsedData = await parseMarkdown(basePath);

    // Write the parsed data to a JSON file
    await writeFile(outputFilePath, JSON.stringify(parsedData, null, 2));

    // Generate files
    await emitter(parsedData, generatedPath);
}

processMarkdownData();