import path from "node:path";
import { fileURLToPath } from "node:url";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import type { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 2. Element-Level Word Processing using UnstructuredLoader
 * 
 * Direct Equivalent to Python's:
 * `from langchain_community.document_loaders import UnstructuredWordDocumentLoader`
 * 
 * Characteristics:
 * - Partitions the Word document into distinct structural elements:
 *   - "Title"
 *   - "NarrativeText"
 *   - "ListItem"
 *   - "Table"
 * - In JavaScript/Node.js, it connects to either the hosted Unstructured Cloud API
 *   or a self-hosted Unstructured Docker container (http://localhost:8000).
 */
export async function loadWithUnstructured(
  filePath: string,
  apiKey?: string,
  apiUrl?: string
): Promise<Document[]> {
  try {
    console.log(`\n--- [UnstructuredLoader] Processing: ${filePath} ---`);

    const effectiveApiKey = apiKey || process.env.UNSTRUCTURED_API_KEY;
    const effectiveApiUrl = apiUrl || process.env.UNSTRUCTURED_API_URL;

    if (!effectiveApiKey && !effectiveApiUrl) {
      console.log("\n[Notice] UnstructuredLoader requires an UNSTRUCTURED_API_KEY or local Unstructured URL.");
      console.log("To run with Unstructured Cloud API:");
      console.log("  export UNSTRUCTURED_API_KEY=\"your_key_here\"");
      console.log("Or run locally via Docker:");
      console.log("  docker run -p 8000:8000 downloads.unstructured.io/unstructured-io/unstructured-api:latest\n");
      return [];
    }

    const loader = new UnstructuredLoader(filePath, {
      apiKey: effectiveApiKey,
      apiUrl: effectiveApiUrl,
      strategy: "fast", // "fast" | "hi_res" | "ocr_only"
    });

    const docs = await loader.load();
    console.log(`Successfully partitioned into ${docs.length} document elements.`);
    return docs;
  } catch (error) {
    console.error(`Error in UnstructuredLoader for "${filePath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const proposalPath = path.resolve(__dirname, "../../proposal.docx");

  console.log("==================================================");
  console.log("  2. UnstructuredLoader (Python UnstructuredWord) ");
  console.log("==================================================");

  const docs = await loadWithUnstructured(proposalPath);

  if (docs.length > 0) {
    console.log(`First Element Type: ${docs[0].metadata.category}`);
    console.log(`First Element Content: "${docs[0].pageContent}"`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
