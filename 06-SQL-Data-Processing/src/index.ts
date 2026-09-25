import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { SQLQueryLoader, createSampleDatabase } from "./01-sql-query-loader.js";
import { DatabaseSchemaLoader } from "./02-schema-ddl-loader.js";

const __filename = fileURLToPath(import.meta.url);

async function runSqlDemo() {
  console.log("==================================================================");
  console.log("             Phase: SQL Data and Schema Processing for RAG        ");
  console.log("==================================================================");

  // 1. Initialize embedded database
  const db: DatabaseSync = createSampleDatabase();

  // 2. Pattern 1: Data Rows Ingestion via Query
  console.log("\n>>> Step 1: Ingesting Data Rows with SQLQueryLoader...");
  const queryLoader = new SQLQueryLoader(db, {
    query: `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        p.description AS product_description,
        r.rating,
        r.comment AS review_comment
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
    `,
    contentColumns: ["product_name", "category", "product_description", "review_comment"],
  });
  const dataDocs = await queryLoader.load();

  // 3. Pattern 2: Schema / DDL Ingestion for Text-to-SQL
  console.log("\n>>> Step 2: Ingesting Schema / DDL definitions for Text-to-SQL...");
  const schemaLoader = new DatabaseSchemaLoader(db);
  const schemaDocs = await schemaLoader.load();

  // 4. Consolidated Summary Table
  console.log("\n==================================================================");
  console.log("               SQL Ingestion Pipeline Summary Table               ");
  console.log("==================================================================");

  console.table([
    {
      Pattern: "Data Record Ingestion",
      Loader: "SQLQueryLoader",
      "Documents Produced": dataDocs.length,
      "RAG Purpose": "Ground answers in transactional records (joins, views, metrics)",
      "Metadata Fields": "product_id, price, rating, category",
    },
    {
      Pattern: "Schema / DDL Ingestion",
      Loader: "DatabaseSchemaLoader",
      "Documents Produced": schemaDocs.length,
      "RAG Purpose": "Allows LLM to retrieve relevant table structures for Text-to-SQL",
      "Metadata Fields": "tableName, columnCount, columnNames, hasForeignKeys",
    },
  ]);

  // 5. Demonstrate Hybrid Search & Metadata Filtering on SQL data
  console.log("\n>>> Real-World RAG Benefit: Combining Vector Search with SQL Metadata");
  const topRated = dataDocs.filter((d) => Number(d.metadata.rating) === 5);
  console.log(`Found ${topRated.length} product(s) with 5-star reviews:`);
  topRated.forEach((doc) => {
    console.log(` - ${doc.metadata.product_name} ($${doc.metadata.price}) -> "${doc.metadata.review_comment}"`);
  });

  console.log("\nSQL RAG Ingestion pipeline completed successfully!\n");
}

runSqlDemo().catch(console.error);
