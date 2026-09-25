import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSONLinesLoader } from "@langchain/classic/document_loaders/fs/json";
import type { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 2. LangChain JSONLinesLoader (.jsonl)
 * 
 * Direct Equivalent to Python's:
 * `JSONLoader(file_path="...", jq_schema="...", json_lines=True)`
 * 
 * In .jsonl (JSON Lines), each line is an independent JSON object.
 * JSONLinesLoader takes a single pointer and extracts that field across each line.
 */
export async function loadJsonLines(
  filePath: string,
  pointer: string
): Promise<Document[]> {
  try {
    console.log(`\n--- [JSONLinesLoader] Loading: ${path.basename(filePath)} (Pointer: "${pointer}") ---`);

    const loader = new JSONLinesLoader(filePath, pointer);
    const docs = await loader.load();

    console.log(`Extracted ${docs.length} document(s) from .jsonl lines.`);
    return docs;
  } catch (error) {
    console.error(`Error loading JSONLines file "${filePath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const jsonlPath = path.resolve(__dirname, "../sample-data/employees.jsonl");

  console.log("==================================================");
  console.log("       2. LangChain JSONLinesLoader (.jsonl)      ");
  console.log("==================================================");

  // Extract the "role" from each employee line
  const roleDocs = await loadJsonLines(jsonlPath, "/role");

  roleDocs.forEach((doc, idx) => {
    console.log(`[Line #${doc.metadata.line}] Role: "${doc.pageContent}"`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
