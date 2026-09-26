import { fileURLToPath } from "node:url";

/**
 * 2. Vector Similarity Mathematics (The Core of Vector Search)
 * 
 * When a Vector Database searches for the "most relevant" documents,
 * it runs geometric distance calculations between the Query Vector and Document Vectors.
 */

/**
 * Calculates the Dot Product of two vectors:
 * sum(A[i] * B[i])
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Dimension mismatch: vector A has ${a.length}, vector B has ${b.length}`);
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Calculates the Euclidean Norm (magnitude/length) of a vector:
 * sqrt(sum(A[i]^2))
 */
export function vectorMagnitude(a: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
}

/**
 * Calculates the Cosine Similarity between two vectors:
 * cos(theta) = (A . B) / (||A|| * ||B||)
 * 
 * Range: -1.0 to 1.0
 * 1.0  = Exactly identical direction (highest relevance)
 * 0.0  = Orthogonal (completely unrelated)
 * -1.0 = Exactly opposite direction
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = dotProduct(a, b);
  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/**
 * Calculates Euclidean Distance (L2) between two vectors:
 * sqrt(sum((A[i] - B[i])^2))
 * 
 * Smaller distance = Higher similarity (0 = identical)
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Self-executing runner for demonstration
function main() {
  console.log("==================================================");
  console.log("       Vector Mathematics Demo (Mini Example)     ");
  console.log("==================================================");

  // Consider two 3-dimensional toy vectors
  const query = [1, 2, 3];
  const docSimilar = [1.2, 1.9, 3.1]; // Closely aligned
  const docOpposite = [-1, -2, -3];   // Opposite direction
  const docUnrelated = [3, -2, 0];    // Perpendicular (dot product = 0)

  console.log("Query Vector:", query);
  console.log("Similar Vector:", docSimilar);
  console.log("Opposite Vector:", docOpposite);
  console.log("Unrelated Vector:", docUnrelated);

  console.log("\n>>> Cosine Similarities:");
  console.log(`- Query vs Similar:   ${cosineSimilarity(query, docSimilar).toFixed(4)} (Very close to 1.0)`);
  console.log(`- Query vs Unrelated: ${cosineSimilarity(query, docUnrelated).toFixed(4)} (Close to 0.0)`);
  console.log(`- Query vs Opposite:  ${cosineSimilarity(query, docOpposite).toFixed(4)} (Exactly -1.0)`);

  console.log("\n>>> Euclidean Distances (L2):");
  console.log(`- Query vs Similar:   ${euclideanDistance(query, docSimilar).toFixed(4)} (Small distance)`);
  console.log(`- Query vs Opposite:  ${euclideanDistance(query, docOpposite).toFixed(4)} (Large distance)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
