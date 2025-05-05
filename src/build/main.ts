import { emitter } from "./emitter.js";
import { parseMarkdown } from "./parser.js";
import { writeFileSync } from "fs";

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

const parsedData = parseMarkdown(basePath);

// Write the parsed data to a JSON file
writeFileSync(outputFilePath, JSON.stringify(parsedData, null, 2));

//Generate files
emitter(parsedData, generatedPath);