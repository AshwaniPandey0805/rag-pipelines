# Phase: Vector Embeddings and Vector Databases

## 1. Overview & What is an Embedding?
An **Embedding** is a mathematical vector (an array of floating-point numbers) that captures the semantic meaning of text.
- Text with similar meaning (e.g., *"How do I reset my password?"* and *"Forgot my login credentials"*) are mapped close together in high-dimensional vector space.
- Unrelated text (e.g., *"How to make pizza"*) is mapped far apart.

For example, `all-MiniLM-L6-v2` produces a **384-dimensional vector**:
```json
[0.0241, -0.0512, 0.0894, ..., -0.0123] // Array of 384 numbers
```

---

## 2. Installed Packages & Tracking

| Package Name | Type | Purpose |
| :--- | :--- | :--- |
| `@huggingface/transformers` | Dependency | Transformers.js engine enabling 100% local, offline ONNX execution of Hugging Face embedding models in Node.js (no Python or PyTorch needed). |
| `@langchain/community` | Dependency | Contains `HuggingFaceTransformersEmbeddings`. |
| `@langchain/core` | Dependency | Base `Embeddings` interface defining `embedQuery` and `embedDocuments`. |

### Installation Command
```bash
npm install @huggingface/transformers @langchain/community @langchain/core
```

---

## 3. Python vs. JavaScript Equivalents

| Concept / Method | Python (`langchain_huggingface`) | JavaScript / TypeScript (`@langchain/community`) |
| :--- | :--- | :--- |
| **Model Class** | `HuggingFaceEmbeddings(model_name="...")` | **`HuggingFaceTransformersEmbeddings({ model: "..." })`** |
| **Embed Single Query** | `embeddings.embed_query("...")` | **`await embeddings.embedQuery("...")`** $\rightarrow$ returns `number[]` |
| **Embed Multiple Docs**| `embeddings.embed_documents([...])` | **`await embeddings.embedDocuments([...])`** $\rightarrow$ returns `number[][]` |
| **Default Model** | `sentence-transformers/all-MiniLM-L6-v2` | `Xenova/all-MiniLM-L6-v2` (384 dimensions) |
| **Execution Engine** | PyTorch / sentence-transformers | ONNX Runtime via `@huggingface/transformers` |

---

## 4. `embedQuery` vs. `embedDocuments`

| Feature | `embedQuery(text)` | `embedDocuments(texts)` |
| :--- | :--- | :--- |
| **Input** | A single search query (`string`) | An array of document chunks (`string[]`) |
| **Output** | Single vector: `number[]` (e.g., length 384) | Array of vectors: `number[][]` (e.g., $N \times 384$) |
| **When Used** | At **Runtime / Query Time** when a user asks a question | At **Index Time** when storing documents into a vector database |
| **Batching** | Single execution | Batched in chunks (e.g., `batchSize: 32` or `512`) |

---

## 5. Vector Distance & Similarity Metrics

Once vectors are generated, vector databases calculate closeness using mathematical distance metrics:

1. **Cosine Similarity** ($\cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$):
   - Measures the angle between two vectors.
   - Range: `-1.0` to `1.0` (`1.0` = identical direction, `0.0` = orthogonal/unrelated).
   - Invariant to text length.
2. **Dot Product** ($A \cdot B = \sum A_i B_i$):
   - When vectors are normalized to unit length ($\|A\| = 1$), Dot Product equals Cosine Similarity.
3. **Euclidean Distance (L2)** ($\sqrt{\sum (A_i - B_i)^2}$):
   - Straight-line geometric distance between vector coordinates.
   - Smaller distance = higher similarity ($0$ = identical).

---

## 6. Code Structure

```
Vectore-Embbeding-Vectore-Database/
├── embedding-and-vector-database.md    # Concepts, tracking & comparisons
└── src/
    ├── 01-huggingface-embeddings.ts    # embedQuery & embedDocuments demonstration
    ├── 02-vector-similarity-math.ts    # Cosine similarity and ranking implementation
    └── index.ts                        # End-to-end semantic search runner
```

---

## 7. Running the Demonstrations

```bash
# 1. Run Hugging Face Embeddings (embedQuery & embedDocuments)
npm run demo:hf-embeddings

# 2. Run Vector Similarity Math & Ranking
npm run demo:similarity-math

# 3. Run complete Embedding Demo
npm run demo:phase-embedding
```
