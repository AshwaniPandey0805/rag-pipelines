# Phase: SQL Database and Query Parsing for RAG

## 1. Overview
In enterprise RAG, relational databases (PostgreSQL, MySQL, SQLite, Snowflake) hold structured transactional data.
There are two primary ways SQL data is ingested into RAG:
1. **Data Record Ingestion (Rows -> Documents)**:
   - Query tables or views (`SELECT ... FROM orders JOIN products ...`).
   - Serialize each row into an embeddable `Document`.
   - Store IDs and numeric fields in `metadata` for hybrid search & post-filtering.
2. **Schema & DDL Ingestion (Text-to-SQL / Database Agent RAG)**:
   - Extract table definitions, column types, and foreign key relationships.
   - Embed schema documentation so an LLM can retrieve the right tables and construct accurate SQL queries.

---

## 2. Installed Packages & Tracking

| Package Name | Type | Purpose |
| :--- | :--- | :--- |
| `node:sqlite` | Built-in (Node 22+) | High-performance zero-dependency SQLite engine built directly into Node.js. |
| `@langchain/core` | Dependency | Standard `Document` interface. |

---

## 3. Python vs. JavaScript Equivalents

| Python (`langchain_community`) | JavaScript / TypeScript Equivalent | Characteristics |
| :--- | :--- | :--- |
| `SQLDatabaseLoader` | **`SQLQueryLoader`** ([01-sql-query-loader.ts](file:///home/pandey/Desktop/Folders/RAG/06-SQL-Data-Processing/src/01-sql-query-loader.ts)) | Executes SQL queries and transforms rows into RAG `Document` objects with metadata. |
| `SQLDatabase.from_uri()` | **`DatabaseSchemaLoader`** ([02-schema-ddl-loader.ts](file:///home/pandey/Desktop/Folders/RAG/06-SQL-Data-Processing/src/02-schema-ddl-loader.ts)) | Extracts schema definitions and table DDLs for Text-to-SQL agents. |

---

## 4. Code Structure

```
06-SQL-Data-Processing/
├── sql-data-processing.md         # Tracking documentation & concepts
└── src/
    ├── 01-sql-query-loader.ts     # Row-by-Row SQL query ingestion to Document[]
    ├── 02-schema-ddl-loader.ts    # Schema / DDL table structure loader for Text-to-SQL
    └── index.ts                   # Master runner demonstrating both patterns
```

---

## 5. Running the Demonstrations

```bash
# 1. Run SQL Query Loader (Row-by-Row ingestion)
npm run demo:sql-query

# 2. Run Database Schema Loader (Text-to-SQL metadata)
npm run demo:sql-schema

# 3. Run the complete SQL RAG demo
npm run demo:phase6-sql
```
