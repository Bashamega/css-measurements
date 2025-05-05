import { readFile } from "fs/promises";

export async function parseMarkdown(markdownPath: URL): Promise<ParsedTable> {
  const content = await readFile(markdownPath, 'utf-8');
  const lines = content.split('\n');
  const result: ParsedTable = {};
  let currentHeading: string | null = null;
  let currentSubHeading: string | null = null;
  let tableLines: string[] = [];

  const flushTable = () => {
    if (tableLines.length > 0 && currentHeading) {
      const parsedTable = parseTable(tableLines);
      if (currentSubHeading) {
        // Ensure the result[currentHeading] is initialized as an object if needed
        result[currentHeading] = result[currentHeading] || {};
        // Assert that result[currentHeading] is a ParsedTable so we can safely index it with currentSubHeading
        (result[currentHeading] as ParsedTable)[currentSubHeading] = parsedTable;
      } else {
        result[currentHeading] = parsedTable;
      }
      tableLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushTable();
      currentHeading = toPascalCase(line.slice(4).trim());
      currentSubHeading = null;
    } else if (line.startsWith('#### ')) {
      flushTable();
      currentSubHeading = toPascalCase(line.slice(5).trim());
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
function parseTable(lines: string[]): ParsedTable[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [headerLine, separatorLine, ...rowLines] = lines;
  const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);

  return rowLines.map(row => {
    const columns = row.split('|').map(c => c.trim()).filter(item => item !== "");

    const entry: ParsedTable = {};
    const descriptions: string[] = [];
    headers.forEach((header, index) => {
      let value = columns[index] || "";
      value = value.replace(/`/g, "").trim();

      if (header.toLowerCase() !== "unit") {
        descriptions.push(value);
        return;
      }

      entry[header.toLowerCase()] = value;
    });

    return { ...entry, descriptions };
  });
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, ' ') // Remove non-alphanumerics
    .replace(/\s+/g, ' ')           // Normalize spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
