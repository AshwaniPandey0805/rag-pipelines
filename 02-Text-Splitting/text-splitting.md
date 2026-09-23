# Phase 2: Text Splitting Techniques

## 1. Overview & Why Splitting Matters
In RAG pipelines, raw documents are rarely fed directly into embedding models.
- **Embedding Model Limits**: Models (like `text-embedding-3-small`) have strict token limits (e.g., 8192 tokens), while older embedding models only supported 512 tokens.
- **Retrieval Precision**: If a chunk is too large, the embedding becomes diluted with multiple topics. If it's too small, it loses necessary context.
- **Chunk Overlap**: Overlapping contiguous chunks (e.g., 10-20% overlap) ensures context that spans across split boundaries is not lost.

---

## 2. Installed Packages & Tracking

| Package Name | Type | Purpose |
| :--- | :--- | :--- |
| `@langchain/textsplitters` | Dependency | Contains all text splitting algorithms (`CharacterTextSplitter`, `RecursiveCharacterTextSplitter`, `TokenTextSplitter`, etc.). |
| `js-tiktoken` | Dependency | Fast JavaScript BPE tokenizer powering `TokenTextSplitter` for OpenAI encoding schemes (`cl100k_base`, `o200k_base`). |
| `@langchain/core` | Dependency | Shared document interfaces (`Document`). |

### Installation Command
```bash
npm install @langchain/textsplitters
```

---

## 3. Comparison of the Three Splitters

| Feature | `CharacterTextSplitter` | `RecursiveCharacterTextSplitter` | `TokenTextSplitter` |
| :--- | :--- | :--- | :--- |
| **Splitting Unit** | Character count | Character count | **Token count** (BPE / tiktoken) |
| **Separator Strategy** | Single separator (default `\n\n`) | Hierarchical list: `["\n\n", "\n", " ", ""]` | Direct token slice |
| **Preserves Semantics** | Poor (rigid boundary) | **Best** (keeps paragraphs & sentences intact) | Good (strictly respects LLM token limits) |
| **Best Used For** | Uniformly formatted files (e.g., logs, TSV) | General documents, markdown, articles, books | Preparing chunks directly tailored to strict LLM context windows |

---

## 4. Key Parameters Explained

- **`chunkSize`**: The maximum target size of each chunk.
  - For `CharacterTextSplitter` & `RecursiveCharacterTextSplitter`: Measured in **characters**.
  - For `TokenTextSplitter`: Measured in **tokens**.
- **`chunkOverlap`**: How much content from the end of Chunk $N$ is repeated at the start of Chunk $N+1$.
- **`separators`** *(Recursive only)*: The priority order of delimiters used to split text when a chunk is oversized.

---

## 5. Code Structure

```
02-Text-Splitting/
├── text-splitting.md                  # Documentation and package tracking
├── sample-data/
│   └── knowledge-base.txt             # Realistic multi-paragraph text for testing
└── src/
    ├── 01-character-splitter.ts       # CharacterTextSplitter demonstration
    ├── 02-recursive-character-splitter.ts # RecursiveCharacterTextSplitter demonstration
    ├── 03-token-splitter.ts           # TokenTextSplitter (with BPE token checks)
    └── index.ts                       # Comparative metrics runner
```

---

## 6. Running the Demonstrations

Execute the examples directly via npm scripts:

```bash
# 1. Run CharacterTextSplitter
npm run demo:character-splitter

# 2. Run RecursiveCharacterTextSplitter
npm run demo:recursive-splitter

# 3. Run TokenTextSplitter
npm run demo:token-splitter

# 4. Run the comparative side-by-side benchmark
npm run demo:phase2
```
