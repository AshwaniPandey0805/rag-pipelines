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
| `pdf-parse` | Dependency | Node.js PDF parsing engine powering `PDFLoader` in JavaScript. |
| `@types/pdf-parse` | DevDependency | TypeScript type definitions for `pdf-parse`. |
| `typescript` | DevDependency | TypeScript compiler for type safety. |
| `@types/node` | DevDependency | Node.js type definitions. |
| `tsx` | DevDependency | TypeScript runner used for fast execution without separate compile steps. |

### Installation Command
```bash
npm install langchain @langchain/core @langchain/classic @langchain/community pdf-parse
npm install -D typescript @types/node tsx @types/pdf-parse
```

---

## 3. Python vs. JavaScript PDF Parsers

| Feature | Python Equivalent | JavaScript / Node.js Equivalent | Engine Under the Hood |
| :--- | :--- | :--- | :--- |
| **Standard Page-by-Page** | `PyPDFLoader` | **`PDFLoader`** (`@langchain/community/document_loaders/fs/pdf`) | `pdf-parse` / Mozilla `pdf.js` |
| **High Performance / Layout** | `PyMuPDFLoader` (`fitz`) | `pdfjs-dist` or `mupdf` (WebAssembly) | C/C++ MuPDF or Mozilla PDF.js |
| **Complex Multi-Modal / OCR** | `UnstructuredPDFLoader` | `UnstructuredLoader` (`@langchain/community`) | Unstructured API |

---

## 4. Core Loader Concepts

### 4.1 LangChain `Document` Interface
Every loader in LangChain produces an array of `Document` objects:
```typescript
interface Document<Metadata extends Record<string, any> = Record<string, any>> {
  pageContent: string; // The extracted text
  metadata: Metadata;  // Key-value metadata (source, pageNumber, totalPages, etc.)
  id?: string;        // Optional unique document identifier
}
```

### 4.2 `TextLoader`
- **Import**: `@langchain/classic/document_loaders/fs/text`
- Ingests a single flat text file (`.txt`, `.md`, `.log`, code files).
- Returns 1 `Document` with `metadata: { source: filePath }`.

### 4.3 `DirectoryLoader`
- **Import**: `@langchain/classic/document_loaders/fs/directory`
- Crawls a directory recursively or flat, dispatching files to loader factories based on their extension.

### 4.4 `PDFLoader`
- **Import**: `@langchain/community/document_loaders/fs/pdf`
- **Key Options**:
  - `splitPages: true` *(Default & Best Practice for RAG)*: Returns an array of `Document` objects, **one per page**. Every page automatically retains its page number in `metadata.loc.pageNumber`!
  - `splitPages: false`: Merges the entire PDF into a single large `Document`.
- **RAG Chaining**: When you pass page-level documents into `RecursiveCharacterTextSplitter`, each resulting chunk automatically preserves the exact page number it came from!

---

## 5. Code Structure

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
    ├── 03-pdf-loader.ts            # PDFLoader implementation with attention.pdf
    └── index.ts                    # Pipeline runner combining loaders
```

---

## 6. Running the Examples

```bash
# Run TextLoader demo
npm run demo:text-loader

# Run DirectoryLoader demo
npm run demo:dir-loader

# Run PDFLoader demo with attention.pdf
npm run demo:pdf-loader

# Run the complete Phase 1 ingestion demo
npm run demo:phase1
```
