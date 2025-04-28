import { readFileSync } from "fs";
import slugify from "slugify"

export function parseMarkdown(markdownPath: URL) {
  const content = readFileSync(markdownPath, 'utf-8');
  const lines = content.split('\n');
  const result: any = {};
  let currentHeading: string | null = null;
  let currentSubHeading: string | null = null;
  let tableLines: string[] = [];

  const flushTable = () => {
    if (tableLines.length > 0 && currentHeading) {
      const parsedTable = parseTable(tableLines);
      if (currentSubHeading) {
        result[currentHeading] = result[currentHeading] || {};
        result[currentHeading][currentSubHeading] = parsedTable;
      } else {
        result[currentHeading] = parsedTable;
      }
      tableLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushTable();
      currentHeading = line.slice(3).trim();
      currentSubHeading = null;
    } else if (line.startsWith('#### ')) {
      flushTable();
      currentSubHeading = line.slice(4).trim();
    } else if (line.startsWith('|') && line.includes('|')) {
      tableLines.push(line.trim());
    } else if (line.trim() === '' && tableLines.length > 0) {
      // End of table on blank line
      flushTable();
    }
  }

  // In case the file ends with a table
  flushTable();

  return result;
}

// Helper to parse a markdown table into objects
function parseTable(lines: string[]): any[] {
  const [headerLine, separatorLine, ...rowLines] = lines;
  const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);

  return rowLines.map(row => {
    const columns = row.split('|').map(c => c.trim()).filter(item => item !== "");

    const entry: any = {};
    const descriptions: string[] = [];  // Array to store headers that are not 'unit'
    headers.forEach((header, index) => {
      let value = columns[index] || ""; // handle missing column data
      value = value.replace(/`/g, "").trim(); // remove backticks

      if (header.toLowerCase() !== "unit") {
        descriptions.push(value); // Add to descriptions if header is not 'unit'
        return ;
      }

      entry[slugify(header, {lower: true})] = value;
    });

    return {...entry, descriptions};
  });
}
