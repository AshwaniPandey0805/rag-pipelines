import path from "node:path";
import { fileURLToPath } from "node:url";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import type { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1. Standard Local Word Processing using DocxLoader
 * 
 * Direct Equivalent to Python's:
 * `from langchain_community.document_loaders import Docx2txtLoader`
 * 
 * Characteristics:
 * - 100% local, runs completely offline, zero API keys required.
 * - Powered by `mammoth` in Node.js to extract raw text content.
 * - Extracts full text into a single LangChain Document object.
 */
export async function loadDocx(filePath: string): Promise<Document[]> {
  try {
    console.log(`\n--- [DocxLoader] Loading file: ${filePath} ---`);

    // 1. Initialize DocxLoader
    const loader = new DocxLoader(filePath);

    // 2. Load the document asynchronously
    const docs = await loader.load();

    console.log(` Successfully loaded ${docs.length} document(s).`);
    return docs;
  } catch (error) {
    console.error(` Error loading Word file "${filePath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const proposalPath = path.resolve(__dirname, "../../proposal.docx");

  console.log("==================================================");
  console.log("    1. Standard DocxLoader (Python Docx2txt)      ");
  console.log("==================================================");

  const docs = await loadDocx(proposalPath);

  if (docs.length > 0) {
    const doc = docs[0];
    console.log(`Source: ${doc.metadata.source}`);
    console.log(`Total Character Count: ${doc.pageContent.length}`);
    console.log("\nText Content Preview (First 350 chars):");
    console.log("--------------------------------------------------");
    console.log(doc.pageContent.slice(0, 350) + "...\n");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
