import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ExcelLoaderOptions {
  mode?: "rows" | "tables"; // "rows" = 1 Document per row, "tables" = 1 Markdown table Document per sheet
  sheets?: string[];        // Specific sheet names to load (default: all sheets)
}

/**
 * 3. Multi-Sheet Excel Document Loader (Powered by SheetJS / xlsx)
 * 
 * Handles Excel (.xlsx, .xls) workbooks for RAG:
 * - Traverses all worksheets automatically.
 * - In "rows" mode: Every row becomes a Document with key-value text and sheet metadata.
 * - In "tables" mode: Every sheet becomes a formatted Markdown table Document.
 */
export class ExcelLoader {
  private filePath: string;
  private options: ExcelLoaderOptions;

  constructor(filePath: string, options: ExcelLoaderOptions = { mode: "rows" }) {
    this.filePath = filePath;
    this.options = { mode: options.mode ?? "rows", sheets: options.sheets };
  }

  public async load(): Promise<Document[]> {
    console.log(`\n--- [ExcelLoader] Parsing Workbook: ${this.filePath} (Mode: ${this.options.mode}) ---`);

    // 1. Read workbook from disk
    const workbook = XLSX.readFile(this.filePath);
    const targetSheets = this.options.sheets ?? workbook.SheetNames;
    console.log(`Discovered sheets: [${workbook.SheetNames.join(", ")}]`);

    const documents: Document[] = [];

    // 2. Process each worksheet
    for (const sheetName of targetSheets) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      if (this.options.mode === "rows") {
        // --- Mode A: Row-by-Row Document Extraction ---
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

        for (const [rowIndex, row] of rows.entries()) {
          // Serialize row into key-value pairs
          const pageContent = Object.entries(row)
            .map(([col, val]) => `${col}: ${val}`)
            .join("\n");

          documents.push(
            new Document({
              pageContent,
              metadata: {
                source: path.basename(this.filePath),
                sheetName,
                rowNumber: rowIndex + 2, // Accounting for 1-based index and header row
                ...row, // Spread all row fields into metadata for hybrid filtering
              },
            })
          );
        }
      } else {
        // --- Mode B: Sheet-as-Markdown-Table ---
        // Converts sheet directly into HTML/CSV/Markdown table representation
        const csvContent = XLSX.utils.sheet_to_csv(sheet);
        const rows = csvContent.trim().split("\n").map((r) => r.split(","));
        if (rows.length === 0) continue;

        const header = rows[0];
        const markdownHeader = `| ${header.join(" | ")} |`;
        const markdownDivider = `| ${header.map(() => "---").join(" | ")} |`;
        const markdownRows = rows.slice(1).map((r) => `| ${r.join(" | ")} |`).join("\n");

        const markdownTable = `${markdownHeader}\n${markdownDivider}\n${markdownRows}`;

        documents.push(
          new Document({
            pageContent: `# Worksheet: ${sheetName}\n\n${markdownTable}`,
            metadata: {
              source: path.basename(this.filePath),
              sheetName,
              format: "markdown-table",
              totalRows: rows.length - 1,
            },
          })
        );
      }
    }

    console.log(`Generated ${documents.length} document(s) from workbook.`);
    return documents;
  }
}

// Self-executing runner for demonstration
async function main() {
  const excelPath = path.resolve(__dirname, "../../structured-file/inventory.xlsx");

  console.log("==================================================");
  console.log("     Excel (.xlsx) Multi-Sheet Loader Demo        ");
  console.log("==================================================");

  // --- Run Mode A: Row-by-Row Documents ---
  const rowLoader = new ExcelLoader(excelPath, { mode: "rows" });
  const rowDocs = await rowLoader.load();

  console.log("\nSample Row Document (Row 1):");
  console.log("--------------------------------------------------");
  console.log("Metadata:", JSON.stringify(rowDocs[0].metadata, null, 2));
  console.log("PageContent:\n" + rowDocs[0].pageContent);

  // --- Run Mode B: Sheet-level Markdown Table ---
  const tableLoader = new ExcelLoader(excelPath, { mode: "tables" });
  const tableDocs = await tableLoader.load();

  console.log("\nSample Table Document (Worksheet 1):");
  console.log("--------------------------------------------------");
  console.log("Metadata:", JSON.stringify(tableDocs[0].metadata, null, 2));
  console.log("PageContent:\n" + tableDocs[0].pageContent);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
