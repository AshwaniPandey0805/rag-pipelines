import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { Document } from "@langchain/core/documents";
import { createSampleDatabase } from "./01-sql-query-loader.js";

interface TableInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: unknown;
  pk: number;
}

interface ForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
}

/**
 * 2. Database Schema & DDL Loader for Text-to-SQL RAG
 * 
 * In production enterprise databases with 50+ to 500+ tables:
 * - You cannot feed the entire database schema into the LLM context window.
 * - This loader converts EACH TABLE's DDL, columns, and foreign keys into a Document.
 * - When a user asks a question, RAG retrieves only the relevant table schemas
 *   and provides them to the LLM to write the exact SQL query!
 */
export class DatabaseSchemaLoader {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  public async load(): Promise<Document[]> {
    console.log(`\n--- [DatabaseSchemaLoader] Inspecting Database Tables ---`);

    // 1. Discover all user tables
    const tableQuery = this.db.prepare(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    const tables = tableQuery.all() as { name: string; sql: string }[];

    const documents: Document[] = [];

    // 2. Extract column definitions and relationships for each table
    for (const table of tables) {
      const tableName = table.name;

      // Extract columns
      const colStatement = this.db.prepare(`PRAGMA table_info(${tableName})`);
      const columns = colStatement.all() as unknown as TableInfo[];

      // Extract foreign keys
      const fkStatement = this.db.prepare(`PRAGMA foreign_key_list(${tableName})`);
      const foreignKeys = fkStatement.all() as unknown as ForeignKeyInfo[];

      // Build structured, LLM-optimized schema documentation
      const columnLines = columns.map(
        (c) => `  - ${c.name} (${c.type})${c.pk ? " [PRIMARY KEY]" : ""}${c.notnull ? " [NOT NULL]" : ""}`
      );

      const fkLines = foreignKeys.map(
        (fk) => `  - ${fk.from} references ${fk.table}(${fk.to})`
      );

      const pageContent = [
        `Table: ${tableName}`,
        `Original DDL:\n${table.sql}`,
        `Columns:`,
        columnLines.join("\n"),
        foreignKeys.length > 0 ? `Foreign Keys:\n${fkLines.join("\n")}` : `Foreign Keys: None`,
      ].join("\n\n");

      documents.push(
        new Document({
          pageContent,
          metadata: {
            type: "schema_definition",
            tableName,
            columnCount: columns.length,
            hasForeignKeys: foreignKeys.length > 0,
            columnNames: columns.map((c) => c.name),
          },
        })
      );
    }

    console.log(`Generated ${documents.length} table schema document(s) for Text-to-SQL RAG.`);
    return documents;
  }
}

// Self-executing runner for demonstration
async function main() {
  console.log("==================================================");
  console.log("    Database Schema Loader (Text-to-SQL RAG)      ");
  console.log("==================================================");

  const db = createSampleDatabase();
  const schemaLoader = new DatabaseSchemaLoader(db);
  const schemaDocs = await schemaLoader.load();

  schemaDocs.forEach((doc, idx) => {
    console.log(`\n================ Table #${idx + 1}: ${doc.metadata.tableName} ================`);
    console.log("Metadata:", JSON.stringify(doc.metadata, null, 2));
    console.log("\nSchema Documentation for LLM:\n");
    console.log(doc.pageContent);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
