import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Demonstrates CharacterTextSplitter.
 * 
 * Mechanism:
 * - Splits strictly by a single separator string (default: "\n\n").
 * - Merges pieces until the chunk reaches chunkSize.
 * - Adds chunkOverlap from the prior chunk.
 * 
 * Pitfall to watch for:
 * - If a single paragraph is longer than chunkSize, CharacterTextSplitter
 *   will NOT break it down further (to avoid breaking the unit), resulting
 *   in chunks that exceed chunkSize unless configured otherwise.
 */
export async function demonstrateCharacterSplitter(rawText: string) {
  console.log("\n==================================================");
  console.log("    1. CharacterTextSplitter Demonstration        ");
  console.log("==================================================");

  // 1. Initialize splitter
  const splitter = new CharacterTextSplitter({
    separator: "\n\n", // Splits on double newlines (paragraphs)
    chunkSize: 300,    // Target max characters per chunk
    chunkOverlap: 50,  // Overlap between adjacent chunks
  });

  // 2. Split raw string directly -> string[]
  const rawChunks: string[] = await splitter.splitText(rawText);
  console.log(`\n[String Split] Created ${rawChunks.length} chunks from raw text.`);

  // 3. Or split LangChain Document objects -> Document[]
  // This automatically propagates metadata from parent to child chunks!
  const parentDoc = new Document({
    pageContent: rawText,
    metadata: { source: "knowledge-base.txt", category: "architecture" },
  });

  const docChunks: Document[] = await splitter.splitDocuments([parentDoc]);
  console.log(`[Document Split] Created ${docChunks.length} Document chunks.`);

  // 4. Inspect chunks
  docChunks.forEach((chunk, index) => {
    console.log(`\n--- Chunk #${index + 1} (${chunk.pageContent.length} chars) ---`);
    console.log("Metadata:", chunk.metadata);
    // console.log(`Preview: "${chunk.pageContent.slice(0, 100).replace(/\n/g, " ")}..."`);
    console.log(`Preview: "${chunk.pageContent}`);
  });

  return docChunks;
}

// Self-executing runner
async function main() {
  const samplePath = path.resolve(__dirname, "../sample-data/knowledge-base.txt");
  const content = await fs.readFile(samplePath, "utf-8");
  await demonstrateCharacterSplitter(content);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
