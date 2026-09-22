# Phase 1: Data Ingestion and Parsing

## 1. Overview
Data ingestion is the first and most critical stage of any RAG pipeline. It bridges the gap between raw, unstructured files and structured, normalized representations that can be chunked, embedded, and retrieved.

---

## 2. Installed Packages & Tracking

| Package Name | Type | Purpose |
| :--- | :--- | :--- |
| `langchain` | Dependency | Main LangChain package containing core abstractions and orchestrators. |
| `@langchain/core` | Dependency | Fundamental interfaces (`Document`, `BaseDocumentLoader`, metadata definitions). |
| `@langchain/classic` | Dependency | Classical filesystem loaders (`TextLoader`, `DirectoryLoader`). |
| `@langchain/community` | Dependency | Extended community-maintained loaders (PDF, CSV, HTML, Notion, etc.). |
| `typescript` | DevDependency | TypeScript compiler for type safety. |
| `@types/node` | DevDependency | Node.js type definitions. |
| `tsx` | DevDependency | TypeScript runner used for fast execution without separate compile steps. |

### Installation Command
```bash
npm install langchain @langchain/core @langchain/classic @langchain/community
npm install -D typescript @types/node tsx
```

---

## 3. Core Concepts

### 3.1 LangChain `Document` Interface
Every loader in LangChain produces an array of `Document` objects:
```typescript
interface Document<Metadata extends Record<string, any> = Record<string, any>> {
  pageContent: string; // The extracted text
  metadata: Metadata;  // Key-value metadata (e.g., source path, line numbers, file type)
  id?: string;        // Optional unique document identifier
}
```

### 3.2 `TextLoader`
- **Import**: `@langchain/classic/document_loaders/fs/text`
- **Role**: Ingests a single flat text file (`.txt`, `.md`, `.log`, code files).
- **Execution Flow**:
  1. Instantiated with a target file path: `new TextLoader(filePath)`.
  2. Reads file content into memory.
  3. Returns `Document[]` (with a single item) containing `pageContent` and `metadata: { source: filePath }`.

### 3.3 `DirectoryLoader`
- **Import**: `@langchain/classic/document_loaders/fs/directory`
- **Role**: Crawls a directory recursively or flat, dispatching files to loader factories based on their extension.
- **Key Parameters**:
  - `dirPath`: Target directory to traverse.
  - `loaders`: A dictionary mapping extensions to loader factories, e.g. `{ ".txt": (path) => new TextLoader(path) }`.
  - `recursive`: Boolean (default `true`) indicating if subdirectories are traversed.
  - `unknown`: Action for unmatched file extensions (`"warn"` | `"error"` | `"ignore"`).

---

## 4. Code Structure

```
01-Data-Ingestion-Parsing/
├── data-ingestion-and-parsing.md   # Tracking & documentation
├── sample-data/                    # Sample documents for testing
│   ├── ai-overview.txt
│   ├── vector-db.md
│   └── subfolder/
│       └── rag-architecture.txt
└── src/
    ├── 01-text-loader.ts           # TextLoader implementation & walkthrough
    ├── 02-directory-loader.ts      # DirectoryLoader implementation & walkthrough
    └── index.ts                    # Pipeline runner combining both loaders
```

---

## 5. Running the Examples

Execute the examples directly via npm scripts:

```bash
# Run TextLoader demo
npm run demo:text-loader

# Run DirectoryLoader demo
npm run demo:dir-loader

# Run the complete Phase 1 ingestion demo
npm run demo:phase1
```
