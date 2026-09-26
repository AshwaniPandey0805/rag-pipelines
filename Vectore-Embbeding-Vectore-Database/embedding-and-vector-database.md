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
| `@langchain/openai` | Dependency | Official LangChain integration for OpenAI models (`OpenAIEmbeddings`, `ChatOpenAI`). |
| `dotenv` | Dependency | Loads environment variables from `.env` file into `process.env`. |
| `@langchain/community` | Dependency | Contains `HuggingFaceTransformersEmbeddings`. |
| `@langchain/core` | Dependency | Base `Embeddings` interface defining `embedQuery` and `embedDocuments`. |

### Installation Command
```bash
npm install @langchain/openai dotenv @huggingface/transformers @langchain/community @langchain/core
```

---

## 3. Environment Variables Configuration (`.env`)

For cloud embedding providers like OpenAI, API keys and model configurations should be kept secure in a root `.env` file and loaded using `dotenv`.

### `.env` File Setup
Create `.env` in the repository root:
```env
# OpenAI API Credentials
OPENAI_API_KEY=sk-proj-your_actual_api_key_here

# OpenAI Embedding Model Selection
# Options: text-embedding-3-small | text-embedding-3-large | text-embedding-ada-002
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### Loading in TypeScript
```typescript
import "dotenv/config"; // Automatically reads root .env into process.env

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
```

---

## 4. Python vs. JavaScript Equivalents

| Concept / Method | Python (`langchain_openai` / `langchain_huggingface`) | JavaScript / TypeScript (`@langchain/openai` / `@langchain/community`) |
| :--- | :--- | :--- |
| **OpenAI Model Class** | `OpenAIEmbeddings(model="text-embedding-3-small")` | **`new OpenAIEmbeddings({ model: "text-embedding-3-small", apiKey: process.env.OPENAI_API_KEY })`** |
| **HuggingFace Class** | `HuggingFaceEmbeddings(model_name="...")` | **`new HuggingFaceTransformersEmbeddings({ model: "..." })`** |
| **Embed Single Query** | `embeddings.embed_query("...")` | **`await embeddings.embedQuery("...")`** $\rightarrow$ returns `number[]` |
| **Embed Multiple Docs**| `embeddings.embed_documents([...])` | **`await embeddings.embedDocuments([...])`** $\rightarrow$ returns `number[][]` |
| **Dimension Truncation**| `OpenAIEmbeddings(dimensions=512)` | **`new OpenAIEmbeddings({ dimensions: 512 })`** (MRL supported) |

---

## 5. OpenAI Embedding Models Comparison

| Model | Dimensions | Context Window | Use Case | Cost per 1M tokens |
| :--- | :--- | :--- | :--- | :--- |
| **`text-embedding-3-small`** | **1,536** (can shorten to **512**) | 8,191 tokens | **Default & Recommended**: Outstanding performance, low latency, 5x cheaper than Ada-002. | ~$0.02 |
| **`text-embedding-3-large`** | **3,072** (can shorten to **1024** or **256**) | 8,191 tokens | **Highest Accuracy**: Best for multi-lingual and domain-specific enterprise search. | ~$0.13 |
| **`text-embedding-ada-002`** | 1,536 (fixed) | 8,191 tokens | **Legacy**: Older generation; lacks Matryoshka dimension truncation. | ~$0.10 |

### 🚀 Production Tip: Matryoshka Representation Learning (MRL)
The `text-embedding-3` family supports native **dimension reduction** without retraining or separate projection matrices:
```typescript
const compactEmbeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  dimensions: 512, // Shortens from 1536 to 512!
});
```
* **Benefits**:
  1. Reduces vector database RAM and disk storage by **66%**.
  2. Speeds up vector distance calculation (Cosine / Dot product) by **3x**.
  3. Retains over **99% of retrieval accuracy** on MTEB benchmarks.

---

## 6. `embedQuery` vs. `embedDocuments`

| Feature | `embedQuery(text)` | `embedDocuments(texts)` |
| :--- | :--- | :--- |
| **Input** | A single search query (`string`) | An array of document chunks (`string[]`) |
| **Output** | Single vector: `number[]` (e.g., length 1536 or 512) | Array of vectors: `number[][]` (e.g., $N \times 1536$) |
| **When Used** | At **Runtime / Query Time** when a user asks a question | At **Index Time** when storing documents into a vector database |
| **Batching** | Single execution | Batched in chunks |

---

## 7. Vector Distance & Similarity Metrics

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

## 8. Code Structure

```
Vectore-Embbeding-Vectore-Database/
├── embedding-and-vector-database.md    # Concepts, tracking & comparisons
└── src/
    ├── 01-huggingface-embeddings.ts    # 100% local ONNX embedding generation
    ├── 02-vector-similarity-math.ts    # Cosine similarity and ranking implementation
    ├── 03-openai-embeddings.ts         # OpenAIEmbeddings with .env, embedQuery, embedDocuments & MRL
    └── index.ts                        # End-to-end semantic search runner
```

---

## 9. Running the Demonstrations

```bash
# 1. Run Hugging Face Local Embeddings (embedQuery & embedDocuments)
npm run demo:hf-embeddings

# 2. Run Vector Similarity Math & Ranking
npm run demo:similarity-math

# 3. Run OpenAI Embeddings (.env API key required)
npm run demo:openai-embeddings

# 4. Run complete Embedding Demo
npm run demo:phase-embedding
```
