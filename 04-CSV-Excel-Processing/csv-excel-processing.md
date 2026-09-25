# Phase: CSV and Excel Processing (.csv, .xlsx)

## 1. Overview & The Tabular RAG Challenge
Tabular files (CSV, Excel) differ fundamentally from unstructured text (PDFs, Markdown):
- In prose documents, chunks are split by character or token limits with overlap.
- In tabular data, arbitrary splitting breaks rows and detaches values from column headers!
- **The Core Strategy for RAG**: **1 Row = 1 Document**. Every row is serialized with its column headers so the vector embedding preserves full semantic context.
- **Metadata Filtering**: Numeric/categorical fields (e.g., `Price`, `Category`, `Stock`) can be stored in `Document.metadata` so vector search can be combined with metadata filters (e.g., *"Find laptops under $1000"*).

---

## 2. Installed Packages & Tracking

| Package Name | Type | Purpose |
| :--- | :--- | :--- |
| `@langchain/community` | Dependency | Contains `CSVLoader` and `UnstructuredLoader`. |
| `d3-dsv` | Dependency | High-performance delimiter-separated values parser used by LangChain's `CSVLoader`. |
| `xlsx` | Dependency | Powerful SheetJS engine for parsing multi-sheet Excel workbooks (`.xlsx`, `.xls`). |
| `@types/d3-dsv` | DevDependency | TypeScript definitions for `d3-dsv`. |
| `@langchain/core` | Dependency | Standard `Document` interface. |

### Installation Command
```bash
npm install d3-dsv xlsx @langchain/community @langchain/core
npm install -D @types/d3-dsv
```

---

## 3. Python vs. JavaScript Equivalents

| Python (`langchain_community`) | JavaScript / TypeScript Equivalent | Characteristics |
| :--- | :--- | :--- |
| **`CSVLoader`** | **`CSVLoader`** (`.../document_loaders/fs/csv`) | **Local, fast**. Uses `d3-dsv`. Turns each CSV row into a `Document` formatted as key-value pairs. |
| **`UnstructuredCSVLoader`** | **`UnstructuredLoader`** (`.../document_loaders/fs/unstructured`) | Partitions CSV into table elements. Requires Unstructured API or local Docker container. |
| *(Excel Processing)* `UnstructuredExcelLoader` | **Custom `ExcelLoader`** (built with `xlsx` / SheetJS) | **Best for RAG**: Traverses multiple sheets (`Products`, `Summary`), generates row-level documents with `sheetName` and row indexes in metadata. |

---

## 4. Ingestion Strategies for Tabular Data

### Strategy A: Full Key-Value Serialization (Default)
Each row becomes a document where all column names and values are printed:
```text
Product: Laptop
Category: Electronics
Price: 999.99
Stock: 50
Description: High-performance laptop with 16GB RAM and 512GB SSD
```

### Strategy B: Target Column as `pageContent` + Metadata Enrichment
Specify `column: "Description"`. The semantic description becomes the embeddable `pageContent`, while `Product`, `Price`, and `Category` are placed into `metadata` for hybrid filtering!

### Strategy C: Multi-Sheet Excel Traversal
Iterates across all sheets in the `.xlsx` workbook, extracting records per sheet with `{ sheetName, rowNumber, source }` attached.

---

## 5. Code Structure

```
04-CSV-Excel-Processing/
├── csv-excel-processing.md         # Tracking documentation & concepts
└── src/
    ├── 01-csv-loader.ts            # LangChain CSVLoader (Default & Column-targeted modes)
    ├── 02-unstructured-csv-loader.ts # Unstructured CSV Loader (API/Container)
    ├── 03-excel-loader.ts          # Multi-sheet ExcelLoader using SheetJS
    └── index.ts                    # Master comparison runner
```

---

## 6. Running the Demonstrations

```bash
# 1. Run standard CSVLoader
npm run demo:csv-loader

# 2. Run Unstructured CSVLoader
npm run demo:unstructured-csv

# 3. Run multi-sheet ExcelLoader
npm run demo:excel-loader

# 4. Run master tabular demo
npm run demo:phase4-tabular
```
