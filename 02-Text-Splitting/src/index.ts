import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CharacterTextSplitter, RecursiveCharacterTextSplitter, TokenTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { getEncoding } from "js-tiktoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runComparison() {
  console.log("==================================================================");
  console.log("            Phase 2: Text Splitters In-Depth Comparison           ");
  console.log("==================================================================");

  const samplePath = path.resolve(__dirname, "../sample-data/knowledge-base.txt");
  const rawText = await fs.readFile(samplePath, "utf-8");
  const encoder = getEncoding("cl100k_base");
  const totalTokens = encoder.encode(rawText).length;

  console.log(`Input Document Stats:`);
  console.log(`- Characters: ${rawText.length}`);
  console.log(`- Tokens (cl100k_base): ${totalTokens}`);
  console.log(`- Paragraphs: ${rawText.split("\n\n").length}`);
  console.log("------------------------------------------------------------------");

  const doc = new Document({ pageContent: rawText, metadata: { source: "knowledge-base.txt" } });

  // 1. CharacterTextSplitter
  const charSplitter = new CharacterTextSplitter({
    separator: "\n\n",
    chunkSize: 350,
    chunkOverlap: 50,
  });
  const charChunks = await charSplitter.splitDocuments([doc]);

  // 2. RecursiveCharacterTextSplitter
  const recursiveSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 350,
    chunkOverlap: 50,
    separators: ["\n\n", "\n", " ", ""],
  });
  const recursiveChunks = await recursiveSplitter.splitDocuments([doc]);

  // 3. TokenTextSplitter (roughly 350 chars ≈ 85 tokens)
  const tokenSplitter = new TokenTextSplitter({
    encodingName: "cl100k_base",
    chunkSize: 85,
    chunkOverlap: 15,
  });
  const tokenChunks = await tokenSplitter.splitDocuments([doc]);

  // Generate Comparison Summary Table
  function computeStats(chunks: Document[]) {
    const charLengths = chunks.map((c) => c.pageContent.length);
    const tokenLengths = chunks.map((c) => encoder.encode(c.pageContent).length);
    return {
      chunkCount: chunks.length,
      avgChars: Math.round(charLengths.reduce((a, b) => a + b, 0) / chunks.length),
      maxChars: Math.max(...charLengths),
      minChars: Math.min(...charLengths),
      avgTokens: Math.round(tokenLengths.reduce((a, b) => a + b, 0) / chunks.length),
      maxTokens: Math.max(...tokenLengths),
    };
  }

  const charStats = computeStats(charChunks);
  const recStats = computeStats(recursiveChunks);
  const tokStats = computeStats(tokenChunks);

  console.log("\n>>> Performance & Chunking Metrics Table:");
  console.table([
    {
      Splitter: "CharacterTextSplitter",
      "Chunks Created": charStats.chunkCount,
      "Avg Chars": charStats.avgChars,
      "Max Chars": charStats.maxChars,
      "Avg Tokens": charStats.avgTokens,
      "Max Tokens": charStats.maxTokens,
      "Splitting Basis": "Single separator ('\\n\\n')",
    },
    {
      Splitter: "RecursiveCharacterTextSplitter",
      "Chunks Created": recStats.chunkCount,
      "Avg Chars": recStats.avgChars,
      "Max Chars": recStats.maxChars,
      "Avg Tokens": recStats.avgTokens,
      "Max Tokens": recStats.maxTokens,
      "Splitting Basis": "Hierarchy ['\\n\\n', '\\n', ' ', '']",
    },
    {
      Splitter: "TokenTextSplitter",
      "Chunks Created": tokStats.chunkCount,
      "Avg Chars": tokStats.avgChars,
      "Max Chars": tokStats.maxChars,
      "Avg Tokens": tokStats.avgTokens,
      "Max Tokens": tokStats.maxTokens,
      "Splitting Basis": "BPE Tokens (cl100k_base)",
    },
  ]);

  console.log("\n>>> Key Observations:");
  console.log("1. CharacterTextSplitter will produce oversized chunks if an entire paragraph exceeds chunkSize.");
  console.log("2. RecursiveCharacterTextSplitter achieves the most uniform character lengths while preserving natural sentence boundaries.");
  console.log("3. TokenTextSplitter enforces strict mathematical token limits, preventing embedding context overflow.");
}

runComparison().catch(console.error);
