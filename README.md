# Production RAG Pipeline Architecture in TypeScript

A comprehensive, modular, and production-ready guide to building Retrieval-Augmented Generation (RAG) pipelines in **TypeScript** and **Node.js** using LangChain, SheetJS, and native runtime capabilities.

---

## 📁 Repository Architecture

```text
rag-pipelines/
├── Data-Ingestion-and-Parsing/
│   ├── 01-Data-Ingestion-Parsing/       # Text, Directory, and PDF document loaders
│   ├── 02-Text-Splitting/               # Character, Recursive, and Token-based splitting
│   ├── 03-Word-Document-Processing/     # Word document (.docx) extraction & Markdown conversion
│   ├── 04-CSV-Excel-Processing/         # Tabular processing (CSV key-values & multi-sheet Excel)
│   ├── 05-JSON-Processing/              # JSON pointers, JSONL, Entity, and high-scale streaming
│   ├── 06-SQL-Data-Processing/          # SQL queries to Documents & Schema DDL extraction
│   ├── attention.pdf                    # Sample academic PDF
│   ├── proposal.docx                    # Sample Word document
│   ├── structured-file/                 # Sample CSV & Excel workbooks
│   └── json_files/                      # Sample hierarchical JSON data
├── Vectore-Embbeding-Vectore-Database/
│   ├── embedding-and-vector-database.md # Embeddings theory & mathematical metrics
│   └── src/
│       ├── 01-huggingface-embeddings.ts # embedQuery & embedDocuments with Hugging Face ONNX
│       ├── 02-vector-similarity-math.ts # Cosine Similarity, Dot Product, Euclidean Distance
│       └── index.ts                     # End-to-end semantic similarity ranking demo
├── package.json                         # Dependencies & demo execution scripts
├── tsconfig.json                        # NodeNext TypeScript configuration
└── .gitignore
```

---

## 🚀 Module Overview

### 1. [Data Ingestion and Parsing](file:///home/pandey/Desktop/Folders/RAG/Data-Ingestion-and-Parsing/01-Data-Ingestion-Parsing/data-ingestion-and-parsing.md)
* **`TextLoader`**: Ingestion of single flat text and markdown files.
* **`DirectoryLoader`**: Recursive file tree scanning with extension-to-loader mapping.
* **`PDFLoader`**: Page-by-page extraction preserving page numbers in metadata.
* **`SmartPDFProcessor`**: Real-world PDF sanitation tackling typographic ligatures (`ﬁ` $\rightarrow$ `fi`), hyphenated line breaks (`trans-\nformer`), and blank page filtering.

### 2. [Text Splitting Strategies](file:///home/pandey/Desktop/Folders/RAG/Data-Ingestion-and-Parsing/02-Text-Splitting/text-splitting.md)
* **`CharacterTextSplitter`**: Delimiter-based splitting (`\n\n`) and why it produces oversized chunks when units exceed `chunkSize`.
* **`RecursiveCharacterTextSplitter`**: The production standard using a fallback hierarchy (`["\n\n", "\n", " ", ""]`) to preserve paragraphs and sentences.
* **`TokenTextSplitter`**: BPE token-level splitting (`cl100k_base` via `js-tiktoken`) to strictly respect embedding model context windows.

### 3. [Word Document Processing](file:///home/pandey/Desktop/Folders/RAG/Data-Ingestion-and-Parsing/03-Word-Document-Processing/word-document-processing.md)
* **`DocxLoader`**: 100% offline, fast local text extraction using `mammoth`.
* **`UnstructuredLoader`**: Element-level partitioning (`Title`, `NarrativeText`, `Table`) connecting to Unstructured API or local Docker.
* **`MarkdownDocxProcessor`**: Converts `.docx` to structured Markdown before chunking to preserve heading hierarchy (`#`, `##`) and table layouts for RAG.

### 4. [CSV and Excel Processing](file:///home/pandey/Desktop/Folders/RAG/Data-Ingestion-and-Parsing/04-CSV-Excel-Processing/csv-excel-processing.md)
* **Row-as-Document Principle**: Why random chunking destroys tabular context, and how serializing rows into key-value pairs preserves records.
* **`CSVLoader`**: Default key-value serialization vs. targeted description column extraction.
* **`ExcelLoader`**: Multi-sheet workbook traversal using `xlsx` (SheetJS), supporting both row-level documents and sheet-level Markdown tables.

### 5. [JSON & JSONL Processing](file:///home/pandey/Desktop/Folders/RAG/Data-Ingestion-and-Parsing/05-JSON-Processing/json-processing.md)
* **`JSONLoader`**: RFC 6901 JSON Pointer navigation (`/company`, `/departments/engineering/head`).
* **`JSONLinesLoader`**: Field extraction across line-delimited streaming records (`.jsonl`).
* **`EntityJSONProcessor`**: Bundles nested objects into unified entity documents with metadata for hybrid search.
* **`GenericJSONProcessor`**: Schema-agnostic recursive flattener that processes arbitrary JSON without manual models or interfaces.
* **`StreamingJSONProcessor`**: Memory-constant stream batching that prevents V8 heap overflow on multi-gigabyte datasets.

### 6. [SQL Database & Schema Processing](file:///home/pandey/Desktop/Folders/RAG/Data-Ingestion-and-Parsing/06-SQL-Data-Processing/sql-data-processing.md)
* **`SQLQueryLoader`**: Zero-dependency SQL row extraction via `node:sqlite`, separating text content from numerical/filter metadata.
* **`DatabaseSchemaLoader`**: Extracts DDL, column types, and foreign key relationships as documents for Text-to-SQL AI agents.

### 7. [Vector Embeddings and Similarity Math](file:///home/pandey/Desktop/Folders/RAG/Vectore-Embbeding-Vectore-Database/embedding-and-vector-database.md)
* **`HuggingFaceTransformersEmbeddings`**: 100% local, offline embedding generation via `@huggingface/transformers` (ONNX) with zero API keys.
* **`embedQuery(text)` vs. `embedDocuments(texts)`**: Query-time 1D vector generation vs. index-time 2D batch generation.
* **Vector Distance Mathematics**: Deep-dive implementations of Cosine Similarity, Dot Product, and Euclidean Distance (L2) to rank semantic relevance.

---

## 🛠️ Setup & Installation

### Prerequisites
* **Node.js**: v20+ or v22+ (recommended for built-in `node:sqlite`).
* **npm**: v10+

### Installation
```bash
git clone https://github.com/AshwaniPandey0805/rag-pipelines.git
cd rag-pipelines
npm install
```

---

## ⚡ Execution Commands Cheatsheet

| Module | Command | Description |
| :--- | :--- | :--- |
| **01. Ingestion** | `npm run demo:phase1` | Runs Text and Directory loader suite |
| | `npm run demo:pdf-loader` | Ingests PDF page-by-page |
| | `npm run demo:smart-pdf` | Ingests PDF with ligature & hyphen sanitization |
| **02. Splitting** | `npm run demo:character-splitter` | Tests single-delimiter splitting |
| | `npm run demo:recursive-splitter` | Tests hierarchical recursive splitting |
| | `npm run demo:token-splitter` | Tests BPE token-level chunking |
| | `npm run demo:phase2` | Side-by-side comparison benchmark |
| **03. Word (.docx)** | `npm run demo:word-docx` | Tests local DocxLoader |
| | `npm run demo:word-markdown` | Ingests Word document as structured Markdown |
| | `npm run demo:phase3-word` | Comparison summary of Word loaders |
| **04. Tabular** | `npm run demo:csv-loader` | Tests row-level CSV serialization |
| | `npm run demo:excel-loader` | Tests multi-sheet Excel parsing |
| | `npm run demo:phase4-tabular` | Tabular comparison & metadata filtering demo |
| **05. JSON** | `npm run demo:json-loader` | Tests RFC 6901 JSON Pointers |
| | `npm run demo:entity-json` | Ingests JSON entities with metadata |
| | `npm run demo:generic-json` | Ingests arbitrary JSON with zero predefined models |
| | `npm run demo:streaming-json` | Memory-safe streaming batching for large datasets |
| | `npm run demo:phase5-json` | JSON comparison runner |
| **06. SQL** | `npm run demo:sql-query` | Executes SQL queries to Documents |
| | `npm run demo:sql-schema` | Generates schema documentation for Text-to-SQL |
| | `npm run demo:phase6-sql` | Full SQL RAG execution demo |
| **07. Embeddings** | `npm run demo:hf-embeddings` | Runs Hugging Face embedQuery & embedDocuments |
| | `npm run demo:similarity-math` | Demonstrates Cosine, Dot Product & Euclidean math |
| | `npm run demo:phase-embedding` | End-to-end semantic similarity ranking |