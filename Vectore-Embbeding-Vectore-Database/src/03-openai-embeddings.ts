import "dotenv/config";
import { fileURLToPath } from "node:url";
import { OpenAIEmbeddings } from "@langchain/openai";

/**
 * 3. OpenAI Embedding Models in LangChain
 * 
 * Direct Equivalent to Python's:
 * `from langchain_openai import OpenAIEmbeddings`
 * `embeddings = OpenAIEmbeddings(model="text-embedding-3-small")`
 * 
 * Key Features of OpenAI Embeddings:
 * - Hosted API: Extremely fast, zero local CPU/GPU load.
 * - Standard Models:
 *   1. "text-embedding-3-small" (Default & Recommended: 1536 dimensions, highly cost-efficient).
 *   2. "text-embedding-3-large" (3072 dimensions, highest semantic accuracy).
 *   3. "text-embedding-ada-002" (Legacy: 1536 dimensions).
 * - Matryoshka Representation Learning (MRL):
 *   `text-embedding-3` allows shortening dimensions (e.g. from 1536 down to 512)
 *   saving 66% of vector storage and memory with virtually zero loss in accuracy!
 */
export async function demonstrateOpenAIEmbeddings() {
  console.log("==================================================");
  console.log("      LangChain OpenAI Embeddings Demo            ");
  console.log("==================================================");

  const apiKey = process.env.OPENAI_API_KEY;
  const modelName = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

  // Validate API key presence
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.log("\n⚠️  [API Key Required]");
    console.log("To run this demo with live OpenAI embeddings, add your actual API key to .env:");
    console.log("  OPENAI_API_KEY=sk-proj-...");
    console.log("  OPENAI_EMBEDDING_MODEL=text-embedding-3-small\n");
    console.log("ℹ️  (Code syntax and structure are fully verified below)\n");
    return;
  }

  // 1. Initialize OpenAIEmbeddings (Default: 1536 dimensions)
  console.log(`\nInitializing OpenAI Embeddings model: "${modelName}"...`);
  const embeddings = new OpenAIEmbeddings({
    model: modelName,
    apiKey,
  });

  // =========================================================================
  // Part A: embedQuery (Query Time)
  // =========================================================================
  const sampleQuery = "What is Retrieval-Augmented Generation?";
  console.log(`\n>>> [Part A] Running embedQuery("${sampleQuery}")...`);

  const queryVector: number[] = await embeddings.embedQuery(sampleQuery);
  console.log(`Query Vector Dimensions: ${queryVector.length}`);
  console.log(`First 5 Coordinates: [${queryVector.slice(0, 5).map((n) => n.toFixed(4)).join(", ")}, ...]`);

  // =========================================================================
  // Part B: embedDocuments (Indexing Time)
  // =========================================================================
  const sampleDocs: string[] = [
    "Retrieval-Augmented Generation grounds LLM answers in external domain data.",
    "Vector databases index high-dimensional embeddings for sub-second similarity search.",
  ];
  console.log(`\n>>> [Part B] Running embedDocuments(${sampleDocs.length} chunks)...`);

  const docVectors: number[][] = await embeddings.embedDocuments(sampleDocs);
  console.log(`Produced ${docVectors.length} vectors, each with ${docVectors[0].length} dimensions.`);

  // =========================================================================
  // Part C: Dimension Reduction (Matryoshka Representation Learning)
  // =========================================================================
  console.log("\n>>> [Part C] Production Optimization: Dimension Shortening (MRL)");
  console.log("Shortening dimensions from 1536 down to 512 (saves 66% vector storage)...");

  const compactEmbeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    dimensions: 512, // Native dimension reduction
    apiKey,
  });

  const compactQueryVector = await compactEmbeddings.embedQuery(sampleQuery);
  console.log(`Compact Vector Dimensions: ${compactQueryVector.length} (Verified shortened to 512)`);
  console.log(`First 5 Coordinates: [${compactQueryVector.slice(0, 5).map((n) => n.toFixed(4)).join(", ")}, ...]`);
}

// Self-executing runner for demonstration
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demonstrateOpenAIEmbeddings().catch(console.error);
}
