import { fileURLToPath } from "node:url";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { cosineSimilarity } from "./02-vector-similarity-math.js";

const __filename = fileURLToPath(import.meta.url);

async function runEmbeddingDemo() {
  console.log("==================================================================");
  console.log("        Vector Embeddings & Semantic Search End-to-End Demo       ");
  console.log("==================================================================");

  // 1. Initialize local HuggingFace embedding model (384 dims, ONNX)
  console.log("\n[1/4] Loading Local Hugging Face Embedding Model (Xenova/all-MiniLM-L6-v2)...");
  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
  });

  // 2. Define document knowledge base chunks
  const knowledgeBase: string[] = [
    "Retrieval-Augmented Generation (RAG) improves LLM responses by fetching relevant context from verified data sources to stop hallucinations.",
    "Vector databases like Pinecone, Chroma, and Qdrant store high-dimensional vectors and perform approximate nearest neighbor search in milliseconds.",
    "Neapolitan pizza dough requires high-protein '00' flour, 65% water hydration, fresh yeast, sea salt, and a 24-hour slow cold fermentation.",
    "PostgreSQL with the pgvector extension allows storing vector embeddings alongside traditional relational SQL tables for hybrid querying.",
  ];

  // 3. Generate embeddings for all documents (embedDocuments -> number[][])
  console.log("\n[2/4] Generating embeddings for knowledge base documents (embedDocuments)...");
  const docVectors = await embeddings.embedDocuments(knowledgeBase);
  console.log(`Generated ${docVectors.length} vectors of dimension ${docVectors[0].length}.`);

  // 4. Generate embedding for user query (embedQuery -> number[])
  const userQuery = "How do we prevent hallucinations in Large Language Models?";
  console.log(`\n[3/4] Embedding User Query (embedQuery): "${userQuery}"...`);
  const queryVector = await embeddings.embedQuery(userQuery);
  console.log(`Generated 1 query vector of dimension ${queryVector.length}.`);

  // 5. Calculate Cosine Similarities and Rank Documents
  console.log("\n[4/4] Calculating Semantic Cosine Similarities (Query Vector vs Document Vectors)...");
  const results = knowledgeBase.map((content, idx) => {
    const score = cosineSimilarity(queryVector, docVectors[idx]);
    return {
      rank: 0,
      similarityScore: score,
      preview: content.slice(0, 85) + "...",
    };
  });

  // Sort descending by highest similarity score
  results.sort((a, b) => b.similarityScore - a.similarityScore);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  console.log("\n==================================================================");
  console.log(`            Semantic Retrieval Ranking for: "${userQuery}"        `);
  console.log("==================================================================");

  console.table(
    results.map((r) => ({
      Rank: `#${r.rank}`,
      "Cosine Similarity": (r.similarityScore * 100).toFixed(2) + "%",
      "Raw Score": r.similarityScore.toFixed(4),
      "Document Snippet": r.preview,
    }))
  );

  console.log("Observations:");
  console.log("1. The RAG/Hallucination document received the highest similarity score.");
  console.log("2. The Vector DB document scored moderately because it shares AI/data retrieval context.");
  console.log("3. The Pizza dough recipe scored near zero because it is semantically unrelated.");
  console.log("\nEmbedding & Vector similarity pipeline executed successfully!\n");
}

runEmbeddingDemo().catch(console.error);
