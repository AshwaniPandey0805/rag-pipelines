import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TokenTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { getEncoding } from "js-tiktoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Demonstrates TokenTextSplitter.
 * 
 * Why it matters for RAG:
 * - LLMs and embedding models calculate context and cost by TOKENS, not characters.
 * - In English: ~4 characters ≈ 1 token.
 * - In code, non-Latin scripts, or mathematical formulas: 1 character can be multiple tokens!
 * - TokenTextSplitter ensures your chunks strictly adhere to embedding model token limits
 *   (e.g., text-embedding-3 limits: 8191 tokens; legacy models: 512 tokens).
 */
export async function demonstrateTokenSplitter(rawText: string) {
  console.log("\n==================================================");
  console.log("       3. TokenTextSplitter Demonstration         ");
  console.log("==================================================");

  // 1. Initialize TokenTextSplitter
  // Note: chunkSize and chunkOverlap are in TOKENS, not characters!
  const tokenSplitter = new TokenTextSplitter({
    encodingName: "cl100k_base", // Standard OpenAI BPE encoding (GPT-4, text-embedding-3)
    chunkSize: 75,               // Max 75 TOKENS per chunk
    chunkOverlap: 15,            // 15 TOKENS overlap
  });

  const parentDoc = new Document({
    pageContent: rawText,
    metadata: { source: "knowledge-base.txt", encoding: "cl100k_base" },
  });

  // 2. Split documents
  const docChunks = await tokenSplitter.splitDocuments([parentDoc]);
  console.log(`\nCreated ${docChunks.length} Document chunks.`);

  // 3. Initialize tokenizer to verify token counts in each chunk
  const encoder = getEncoding("cl100k_base");

  // 4. Inspect chunks
  docChunks.forEach((chunk, index) => {
    const tokens = encoder.encode(chunk.pageContent);
    console.log(`\n--- Chunk #${index + 1} ---`);
    console.log(`Token Count: ${tokens.length} tokens (ChunkSize Limit: 75)`);
    console.log(`Character Length: ${chunk.pageContent.length} chars`);
    console.log(`Preview:\n"${chunk.pageContent.slice(0, 120).replace(/\n/g, " ")}..."`);
  });

  return docChunks;
}

// Self-executing runner
async function main() {
  const samplePath = path.resolve(__dirname, "../sample-data/knowledge-base.txt");
  const content = await fs.readFile(samplePath, "utf-8");
  await demonstrateTokenSplitter(content);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
