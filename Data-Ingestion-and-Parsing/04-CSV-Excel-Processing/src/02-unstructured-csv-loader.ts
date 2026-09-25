import path from "node:path";
import { fileURLToPath } from "node:url";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import type { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 2. Unstructured CSV Processing
 * 
 * Direct Equivalent to Python's:
 * `from langchain_community.document_loaders import UnstructuredCSVLoader`
 * 
 * Characteristics:
 * - Partitions the CSV file into a structured HTML/text Table representation.
 * - In JavaScript/Node.js, connects to an Unstructured endpoint (Cloud API or local Docker).
 */
export async function loadUnstructuredCsv(
  filePath: string,
  apiKey?: string,
  apiUrl?: string
): Promise<Document[]> {
  try {
    console.log(`\n--- [UnstructuredCSV] Processing: ${filePath} ---`);

    const effectiveApiKey = apiKey || process.env.UNSTRUCTURED_API_KEY;
    const effectiveApiUrl = apiUrl || process.env.UNSTRUCTURED_API_URL;

    if (!effectiveApiKey && !effectiveApiUrl) {
      console.log("\n[Notice] UnstructuredLoader requires an UNSTRUCTURED_API_KEY or local Unstructured URL.");
      console.log("Run locally via Docker: docker run -p 8000:8000 downloads.unstructured.io/unstructured-io/unstructured-api:latest");
      return [];
    }

    const loader = new UnstructuredLoader(filePath, {
      apiKey: effectiveApiKey,
      apiUrl: effectiveApiUrl,
      strategy: "fast",
    });

    const docs = await loader.load();
    console.log(`Extracted ${docs.length} element-level document(s).`);
    return docs;
  } catch (error) {
    console.error(`Error in Unstructured CSV loading for "${filePath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const csvPath = path.resolve(__dirname, "../../structured-file/products.csv");

  console.log("==================================================");
  console.log("  2. Unstructured CSV (Python UnstructuredCSV)    ");
  console.log("==================================================");

  await loadUnstructuredCsv(csvPath);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
