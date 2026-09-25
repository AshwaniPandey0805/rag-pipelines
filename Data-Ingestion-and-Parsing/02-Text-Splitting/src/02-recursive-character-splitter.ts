import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Demonstrates RecursiveCharacterTextSplitter.
 * 
 * Why it is the industry standard for RAG:
 * - It evaluates a list of separators in order of semantic preservation:
 *   1. "\n\n" (Paragraphs)
 *   2. "\n"   (Lines/Sentences)
 *   3. " "    (Words)
 *   4. ""     (Individual characters - last resort)
 * 
 * - If a paragraph fits inside chunkSize, it is preserved intact.
 * - If a paragraph is too big, it gracefully breaks into lines.
 * - If a line is too big, it breaks into words. Words are never split
 *   unless a single word is larger than chunkSize.
 */
export async function demonstrateRecursiveSplitter(rawText: string) {
  console.log("\n==================================================");
  console.log(" 2. RecursiveCharacterTextSplitter Demonstration ");
  console.log("==================================================");

  // 1. Initialize with custom or default separators
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,        // Target chunk length in characters
    chunkOverlap: 50,      // Overlap between adjacent chunks
    separators: ["\n\n", "\n", " ", ""], // Priority order
  });

  const parentDoc = new Document({
    pageContent: rawText,
    metadata: { source: "knowledge-base.txt", type: "rag-guide" },
  });

  // 2. Split documents
  const docChunks: Document[] = await splitter.splitDocuments([parentDoc]);
  console.log(`\nCreated ${docChunks.length} Document chunks.`);

  // 3. Inspect chunks and verify chunk size boundaries
  docChunks.forEach((chunk, index) => {
    console.log(`\n--- Chunk #${index + 1} (${chunk.pageContent.length} chars) ---`);
    console.log("Metadata:", chunk.metadata);
    console.log(`Content:\n"${chunk.pageContent}"`);
  });

  return docChunks;
}

// Self-executing runner
async function main() {
  const samplePath = path.resolve(__dirname, "../sample-data/knowledge-base.txt");
  const content = await fs.readFile(samplePath, "utf-8");
  await demonstrateRecursiveSplitter(content);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
