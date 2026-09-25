import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSONLoader } from "@langchain/classic/document_loaders/fs/json";
import type { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1. LangChain JSONLoader with JSON Pointer Syntax (RFC 6901)
 * 
 * Direct Equivalent to Python's:
 * `from langchain_community.document_loaders import JSONLoader`
 * 
 * In Python, JSONLoader uses `jq` syntax (e.g., `.employees[].name`).
 * In JavaScript/TypeScript, JSONLoader uses RFC 6901 JSON Pointers:
 *   - "/company"
 *   - "/employees/0/name"
 *   - "/departments/engineering/head"
 * 
 * If no pointer is supplied, it extracts all string leaf values from the JSON.
 */
export async function loadJsonWithPointers(
  filePath: string,
  pointers?: string | string[]
): Promise<Document[]> {
  try {
    console.log(`\n--- [JSONLoader] Loading: ${path.basename(filePath)} ---`);
    console.log(`Pointers:`, pointers ? JSON.stringify(pointers) : "None (extracts all strings)");

    // 1. Initialize JSONLoader with optional RFC 6901 pointers
    const loader = new JSONLoader(filePath, pointers);

    // 2. Load documents
    const docs = await loader.load();

    console.log(`Successfully extracted ${docs.length} document(s).`);
    return docs;
  } catch (error) {
    console.error(`Error loading JSON "${filePath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const jsonPath = path.resolve(__dirname, "../../json_files/company_data.json");

  console.log("==================================================");
  console.log("      1. LangChain JSONLoader (JSON Pointers)     ");
  console.log("==================================================");

  // --- Example A: Extracting specific targeted paths ---
  console.log("\n>>> Case 1: Targeted Pointers (Company name + Dept heads)");
  const targetedDocs = await loadJsonWithPointers(jsonPath, [
    "/company",
    "/departments/engineering/head",
    "/departments/data_science/head",
  ]);

  targetedDocs.forEach((doc, idx) => {
    console.log(`[Item #${idx + 1}] Source: ${doc.metadata.source}, Line: ${doc.metadata.line}`);
    console.log(`Content: "${doc.pageContent}"`);
  });

  // --- Example B: Extracting all employee fields ---
  console.log("\n>>> Case 2: Array Pointer ('/employees')");
  const employeeDocs = await loadJsonWithPointers(jsonPath, ["/employees"]);
  console.log(`Total leaf strings under /employees: ${employeeDocs.length}`);
  console.log("First 3 items preview:", employeeDocs.slice(0, 3).map((d) => d.pageContent));
  // console.log("Item previe : ", employeeDocs);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
