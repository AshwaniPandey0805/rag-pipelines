import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import type { Document } from "@langchain/core/documents";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads a single text or markdown file using LangChain's TextLoader.
 * 
 * @param filePath Absolute or relative path to the text file.
 * @returns Array of LangChain Document objects.
 */
export async function loadSingleTextFile(filePath: string): Promise<Document[]> {
  try {
    console.log(`\n--- Loading file: ${filePath} ---`);

    // 1. Initialize the TextLoader with the file path
    const loader = new TextLoader(filePath);

    // 2. Load the document asynchronously
    // Returns an array of Document objects (TextLoader produces 1 Document per file)
    const docs = await loader.load();
    // console.log(docs);

    console.log(` Successfully loaded ${docs.length} document(s).`);
    return docs;
  } catch (error) {
    console.error(` Error loading file "${filePath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const sampleFilePath = path.resolve(__dirname, "../sample-data/ai-overview.txt");

  const docs = await loadSingleTextFile(sampleFilePath);

  for (const [index, doc] of docs.entries()) {
    console.log(`\n Document #${index + 1}:`);
    console.log("-----------------------------------------");
    console.log("Metadata:", JSON.stringify(doc.metadata, null, 2));
    console.log("Content Length:", doc.pageContent.length, "characters");
    console.log("Snippet Preview:\n", doc.pageContent.slice(0, 180) + "...");
    console.log("-----------------------------------------");
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
