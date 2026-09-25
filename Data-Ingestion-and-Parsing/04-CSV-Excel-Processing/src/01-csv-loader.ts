import path from "node:path";
import { fileURLToPath } from "node:url";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import type { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1. Standard CSV Processing using LangChain's CSVLoader
 * 
 * Direct Equivalent to Python's:
 * `from langchain_community.document_loaders import CSVLoader`
 * 
 * Key RAG Principles for CSV:
 * - 1 CSV Row = 1 LangChain Document.
 * - Standard mode serializes each row as:
 *     ColumnA: ValueA
 *     ColumnB: ValueB
 * - Column-targeted mode extracts a specific descriptive column into pageContent.
 */
export async function loadCsvDefault(filePath: string): Promise<Document[]> {
  console.log(`\n--- [CSVLoader] Mode A: Full Key-Value Serialization ---`);
  
  // By default, every row is converted to "Key: Value" lines
  const loader = new CSVLoader(filePath);
  const docs = await loader.load();

  console.log(`Loaded ${docs.length} row document(s) from ${path.basename(filePath)}.`);
  return docs;
}

export async function loadCsvTargetColumn(filePath: string, targetColumn: string): Promise<Document[]> {
  console.log(`\n--- [CSVLoader] Mode B: Target Column as Content ("${targetColumn}") ---`);

  // Target column mode: only the specified column becomes pageContent
  const loader = new CSVLoader(filePath, {
    column: targetColumn,
  });
  const docs = await loader.load();

  console.log(`Loaded ${docs.length} document(s) with focus column "${targetColumn}".`);
  return docs;
}

// Self-executing runner for demonstration
async function main() {
  const csvPath = path.resolve(__dirname, "../../structured-file/products.csv");

  console.log("==================================================");
  console.log("           LangChain CSVLoader Demo               ");
  console.log("==================================================");

  // --- Run Mode A: Full Key-Value ---
  const defaultDocs = await loadCsvDefault(csvPath);
  console.log("\nSample Document (Row 1 - Full Key-Value):");
  console.log("--------------------------------------------------");
  console.log("Metadata:", JSON.stringify(defaultDocs[0].metadata, null, 2));
  console.log("PageContent:\n" + defaultDocs[0].pageContent);

  // --- Run Mode B: Column-Targeted ---
  const columnDocs = await loadCsvTargetColumn(csvPath, "Description");
  console.log("\nSample Document (Row 1 - Target Column 'Description'):");
  console.log("--------------------------------------------------");
  console.log("Metadata:", JSON.stringify(columnDocs[0].metadata, null, 2));
  console.log("PageContent:\n" + columnDocs[0].pageContent);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
