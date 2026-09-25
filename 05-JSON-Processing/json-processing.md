# Phase: JSON and JSONL Processing (.json, .jsonl)

## 1. Overview & The JSON Challenge in RAG
JSON is the primary format for API payloads, database exports, and application state.
However, JSON presents a unique challenge for vector retrieval:
- **Hierarchical / Nested Structure**: JSON contains nested arrays and objects (`skills: [...]`, `projects: [...]`).
- **Naive Leaf Extraction Pitfall**: If a loader extracts leaf strings individually (e.g., `"Python"`), the vector embedding loses all context: *Who knows Python? What is their job title? Which project are they on?*
- **The RAG Best Practice for JSON**: **Entity-Level Serialization**. Transform each meaningful record (e.g. an Employee, Order, or Product) into a coherent textual document while preserving critical fields in `metadata` for hybrid filtering.

---

## 2. Installed Packages & Tracking

| Package Name | Type | Purpose |
| :--- | :--- | :--- |
| `@langchain/classic` | Dependency | Contains `JSONLoader` and `JSONLinesLoader`. |
| `@langchain/core` | Dependency | Core `Document` interface. |

### Installation Command
```bash
# JSONLoader is part of @langchain/classic which is already installed
npm install @langchain/classic @langchain/core
```

---

## 3. Python vs. JavaScript Equivalents

| Feature | Python (`langchain_community`) | JavaScript / TypeScript (`@langchain/classic`) |
| :--- | :--- | :--- |
| **Loader Class** | `JSONLoader` | **`JSONLoader`** (`.../document_loaders/fs/json`) |
| **Extraction Query Syntax** | `jq` schema string (e.g., `jq_schema=".employees[]"`) | **JSON Pointer syntax** (RFC 6901, e.g., `pointers: ["/employees"]`) |
| **JSON Lines (.jsonl)** | `JSONLoader(json_lines=True)` | **`JSONLinesLoader`** (`.../document_loaders/fs/json`) |
| **Entity Serialization** | `text_content=False` (dumps json string) | Custom **`EntityJSONProcessor`** (formats clean RAG text + rich metadata) |

---

## 4. Ingestion Approaches

### Approach 1: RFC 6901 JSON Pointer (`JSONLoader`)
- Uses JSON pointer paths:
  - `"/company"` $\rightarrow$ extracts root field.
  - `"/employees/0/name"` $\rightarrow$ extracts first employee's name.
  - `"/departments/engineering/head"` $\rightarrow$ extracts nested head of engineering.

### Approach 2: JSON Lines (`JSONLinesLoader`)
- For line-delimited JSON (`.jsonl`) where each line is an independent record.
- Extracts targeted pointer from each line.

### Approach 3: Entity-Level RAG Serialization (Recommended)
- Parses JSON arrays/objects into unified entity documents.
- Produces clean text:
  ```text
  Company: TechCorp
  Employee: John Doe (ID: 1)
  Role: Software Engineer
  Skills: Python, JavaScript, React
  Projects:
   - RAG System [Status: In Progress]
   - Data Pipeline [Status: Completed]
  ```
- Retains `metadata: { id: 1, name: "John Doe", role: "Software Engineer", skills: [...] }` for hybrid search!

### Approach 4: Generic Schema-Agnostic Processing (No Predefined Models)
- Automatically flattens arbitrary nested objects and arrays into natural key-value text.
- Automatically copies all scalar fields (strings, numbers, booleans, primitive arrays) into `Document.metadata`.
- Works on flat, shallow, or deeply nested JSON without writing TypeScript interfaces.

### Approach 5: Constant-Memory Streaming for Large Datasets
- Avoids V8 `JavaScript heap out of memory` errors on massive files (500MB - 10GB+).
- Reads `.jsonl` lines using Node.js `readline` streams.
- Flushes records in configurable batches (e.g. 500 records) to the vector database and frees memory immediately.

---

## 5. Code Structure

```
05-JSON-Processing/
├── json-processing.md             # Tracking documentation & concepts
├── sample-data/
│   └── employees.jsonl            # Sample JSON Lines file
└── src/
    ├── 01-json-loader.ts          # LangChain JSONLoader with RFC 6901 pointers
    ├── 02-json-lines-loader.ts    # LangChain JSONLinesLoader (.jsonl)
    ├── 03-entity-json-processor.ts# Entity-Level RAG JSON processor
    ├── 04-generic-json-processor.ts # Schema-agnostic recursive flattener
    ├── 05-streaming-json-processor.ts # High-scale streaming processor for large datasets
    └── index.ts                   # Master runner comparing all methods
```

---

## 6. Running the Demonstrations

```bash
# 1. Run LangChain JSONLoader with JSON Pointers
npm run demo:json-loader

# 2. Run JSONLinesLoader (.jsonl)
npm run demo:jsonl-loader

# 3. Run Entity-Level JSON Processor (Best for RAG)
npm run demo:entity-json

# 4. Run Generic Schema-Agnostic Processor (Zero static models)
npm run demo:generic-json

# 5. Run High-Scale Streaming Processor (Memory safe)
npm run demo:streaming-json

# 6. Run the master comparison runner
npm run demo:phase5-json
```
