import { fileURLToPath } from "node:url";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

/**
 * 1. HuggingFace Transformers Embeddings (100% Local, Zero-API)
 * 
 * Direct Equivalent to Python's:
 * `from langchain_huggingface import HuggingFaceEmbeddings`
 * `embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")`
 * 
 * In JavaScript / TypeScript:
 * - Powered by `@huggingface/transformers` (Transformers.js) using ONNX Runtime.
 * - Downloads and caches the ONNX model locally on first run.
 * - Runs 100% offline on your CPU with zero API keys or external server calls!
 */
export async function demonstrateHuggingFaceEmbeddings() {
  console.log("\n==================================================");
  console.log("  Hugging Face Transformers Embeddings in JS      ");
  console.log("==================================================");

  // 1. Initialize the embedding model
  // "Xenova/all-MiniLM-L6-v2" is the standard fast & lightweight 384-dimensional embedding model
  console.log("\nInitializing model: Xenova/all-MiniLM-L6-v2 (Local ONNX)...");
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  // =========================================================================
  // Part A: embedQuery (Used at Search / Query Time)
  // =========================================================================
  // Input: Exactly 1 string (the user's prompt or search question)
  // Output: Single vector number[] (length: 384)
  console.log("\n>>> [Part A] Running embedQuery()");
  const sampleQuery = "What is Retrieval-Augmented Generation?";
  console.log(`Query text: "${sampleQuery}"`);

  const queryVector: number[] = await embeddings.embedQuery(sampleQuery);

  console.log(`Vector Dimensions: ${queryVector.length}`);
  console.log(`First 5 coordinates: [${queryVector.slice(0, 5).map((n) => n.toFixed(4)).join(", ")}, ...]`);
  console.log(`Is Array of numbers? ${Array.isArray(queryVector)} (Length = ${queryVector.length})`);

  // =========================================================================
  // Part B: embedDocuments (Used at Ingestion / Indexing Time)
  // =========================================================================
  // Input: Array of document chunk strings (string[])
  // Output: Array of vectors number[][] (length: N x 384)
  console.log("\n>>> [Part B] Running embedDocuments()");
  const documentChunks: string[] = [
    "Retrieval-Augmented Generation (RAG) grounds LLM responses using external facts.",
    "Vector databases store high-dimensional embeddings for fast nearest neighbor search.",
    "A delicious recipe for authentic Neapolitan pizza dough using sourdough starter.",
  ];

  console.log(`Embedding ${documentChunks.length} documents in batch...`);
  const documentVectors: number[][] = await embeddings.embedDocuments(documentChunks);

  console.log(`Document Vectors Count: ${documentVectors.length}`);
  documentVectors.forEach((vec, idx) => {
    console.log(` - Doc #${idx + 1}: Vector size = ${vec.length} dims | Preview: [${vec.slice(0, 3).map((n) => n.toFixed(4)).join(", ")}, ...]`);
  });

  return { embeddings, queryVector, documentVectors, documentChunks };
}

// Self-executing runner for demonstration
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demonstrateHuggingFaceEmbeddings().catch(console.error);
}
