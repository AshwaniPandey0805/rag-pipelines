# Phase: Word Document Processing (.docx)

## 1. Overview
Word documents (`.docx`, `.doc`) are ubiquitous in enterprise knowledge bases (contracts, proposals, design specifications). Ingesting them into a RAG pipeline requires balancing raw text extraction speed with structural preservation (headings, lists, and tables).

---

## 2. Installed Packages & Tracking

| Package Name | Type | Purpose |
| :--- | :--- | :--- |
| `@langchain/community` | Dependency | Contains `DocxLoader` and `UnstructuredLoader`. |
| `mammoth` | Dependency | Fast, local library used by `DocxLoader` to convert `.docx` to plain text or Markdown. |
| `@langchain/core` | Dependency | Standard `Document` and loader base classes. |
| `@langchain/textsplitters` | Dependency | Text splitters for downstream chunking. |

### Installation Command
```bash
npm install mammoth @langchain/community @langchain/core @langchain/textsplitters
```

---

## 3. Python vs. JavaScript Equivalents

| Python (`langchain_community`) | JavaScript / TypeScript (`@langchain/community`) | Characteristics |
| :--- | :--- | :--- |
| **`Docx2txtLoader`** | **`DocxLoader`** (`.../document_loaders/fs/docx`) | **Local, fast, zero API keys**. Uses `mammoth` under the hood. Extracts plain text. |
| **`UnstructuredWordDocumentLoader`** | **`UnstructuredLoader`** (`.../document_loaders/fs/unstructured`) | **Element-level partitioning** (`Title`, `NarrativeText`, `Table`). Requires Unstructured API key or local container. |
| *(Advanced RAG Pattern)* | **`mammoth.convertToMarkdown()`** | **Best for RAG**: Preserves heading hierarchy (`#`, `##`) and tables so chunking retains document structure. |

---

## 4. Technical Note: Why `UnstructuredLoader` Requires an API/URL in JavaScript

A critical difference between Python and JavaScript:

### In Python
The `unstructured` package is a **native Python library** (`pip install unstructured[docx]`). It executes locally using Python ML/NLP binaries (`python-docx`, `nltk`, `torch`, `tesseract`). It does **not** require an external server or API.

### In JavaScript / TypeScript
There is **no native JavaScript port** of the Unstructured partitioning engine. In LangChain.js, `UnstructuredLoader` is strictly an **HTTP client wrapper** that sends files via POST requests to an Unstructured backend server. 

Therefore, in JavaScript you **cannot** run `UnstructuredLoader` completely standalone without specifying an endpoint:

1. **Option A: Unstructured Cloud API (Requires API Key)**
   ```typescript
   const loader = new UnstructuredLoader("proposal.docx", {
     apiKey: process.env.UNSTRUCTURED_API_KEY,
   });
   ```

2. **Option B: Free Local Docker Container (No API Key Required)**
   You can run the official free Unstructured container locally:
   ```bash
   docker run -p 8000:8000 -d --rm --name unstructured-api \
     downloads.unstructured.io/unstructured-io/unstructured-api:latest
   ```
   Then connect to it with **zero API key**:
   ```typescript
   const loader = new UnstructuredLoader("proposal.docx", {
     apiUrl: "http://localhost:8000/general/v0/general",
   });
   ```

3. **Option C: Pure Offline Node.js (Zero Docker / Zero API)**
   Use **`DocxLoader`** or **`mammoth`** ([01-docx-loader.ts](file:///home/pandey/Desktop/Folders/RAG/03-Word-Document-Processing/src/01-docx-loader.ts) & [03-markdown-docx-processor.ts](file:///home/pandey/Desktop/Folders/RAG/03-Word-Document-Processing/src/03-markdown-docx-processor.ts)). These run 100% inside the local Node.js process without any server dependencies.

---

## 5. Code Structure

```
03-Word-Document-Processing/
├── word-document-processing.md         # Documentation & package tracking
└── src/
    ├── 01-docx-loader.ts               # Standard LangChain DocxLoader (equivalent to Docx2txtLoader)
    ├── 02-unstructured-docx-loader.ts  # UnstructuredLoader (equivalent to UnstructuredWordDocumentLoader)
    ├── 03-markdown-docx-processor.ts   # Advanced Markdown-preserving DOCX processor for RAG
    └── index.ts                        # Master runner comparing all approaches
```

---

## 6. Running the Demonstrations

```bash
# 1. Run standard DocxLoader (Local)
npm run demo:word-docx

# 2. Run UnstructuredLoader
npm run demo:word-unstructured

# 3. Run Markdown-preserving DOCX Processor
npm run demo:word-markdown

# 4. Run master comparison runner
npm run demo:phase3-word
```
