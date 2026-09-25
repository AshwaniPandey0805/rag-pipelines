import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SQLQueryLoaderOptions {
  query: string;
  contentColumns?: string[]; // Specific columns to combine into pageContent (default: all columns)
  metadataColumns?: string[]; // Specific columns to store in metadata (default: all columns)
  sourceName?: string;
}

/**
 * 1. SQL Query Loader (Equivalent to Python's SQLDatabaseLoader)
 * 
 * Transforms relational database rows into RAG Documents:
 * - Executes any arbitrary SQL query (joins, aggregations, views).
 * - Converts each row into a Document.
 * - Formats text content for vector embedding.
 * - Stores IDs, foreign keys, dates, and numbers in metadata for hybrid filtering.
 */
export class SQLQueryLoader {
  private db: DatabaseSync;
  private options: SQLQueryLoaderOptions;

  constructor(db: DatabaseSync, options: SQLQueryLoaderOptions) {
    this.db = db;
    this.options = options;
  }

  public async load(): Promise<Document[]> {
    console.log(`\n--- [SQLQueryLoader] Executing Query ---`);
    console.log(`Query: ${this.options.query.trim().replace(/\s+/g, " ")}`);

    // 1. Prepare and execute SQL statement
    const statement = this.db.prepare(this.options.query);
    const rows = statement.all() as Record<string, unknown>[];

    console.log(`Retrieved ${rows.length} row(s) from database.`);

    const documents: Document[] = [];
    const source = this.options.sourceName ?? "sql_database";

    // 2. Transform each SQL row into a LangChain Document
    for (const [rowIndex, row] of rows.entries()) {
      const rowEntries = Object.entries(row);

      // Determine pageContent
      let pageContent = "";
      if (this.options.contentColumns && this.options.contentColumns.length > 0) {
        pageContent = this.options.contentColumns
          .filter((col) => row[col] !== undefined)
          .map((col) => `${col}: ${row[col]}`)
          .join("\n");
      } else {
        pageContent = rowEntries
          .filter(([_, val]) => val !== null && val !== undefined)
          .map(([col, val]) => `${col}: ${val}`)
          .join("\n");
      }

      // Determine metadata
      const metadata: Record<string, unknown> = {
        source,
        rowIndex: rowIndex + 1,
      };

      if (this.options.metadataColumns && this.options.metadataColumns.length > 0) {
        for (const col of this.options.metadataColumns) {
          if (row[col] !== undefined) metadata[col] = row[col];
        }
      } else {
        // By default, copy all scalar row values to metadata for hybrid filtering
        for (const [col, val] of rowEntries) {
          if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
            metadata[col] = val;
          }
        }
      }

      documents.push(new Document({ pageContent, metadata }));
    }

    return documents;
  }
}

/**
 * Creates and seeds a sample SQLite database in memory for demonstration.
 */
export function createSampleDatabase(): DatabaseSync {
  const db = new DatabaseSync(":memory:");

  // Create tables
  db.exec(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Seed sample data
  db.exec(`
    INSERT INTO products (id, name, category, price, stock, description) VALUES
      (1, 'Pro Wireless Mouse', 'Accessories', 49.99, 120, 'Ergonomic 2.4GHz wireless mouse with ultra-fast optical sensor and silent click buttons.'),
      (2, 'Mechanical Gaming Keyboard', 'Accessories', 119.99, 45, 'RGB backlit mechanical keyboard featuring tactile brown switches and aircraft-grade aluminum frame.'),
      (3, 'UltraClear 4K Monitor', 'Electronics', 399.99, 30, '27-inch IPS UHD monitor with 99% sRGB color accuracy, HDR10 support, and USB-C connectivity.');

    INSERT INTO reviews (id, product_id, customer_name, rating, comment) VALUES
      (1, 1, 'Alice Smith', 5, 'Battery lasts over 3 months on a single AA. Glides smoothly on any desk mat.'),
      (2, 2, 'Bob Jones', 4, 'Keys feel fantastic for programming and gaming. Cable could be slightly longer.'),
      (3, 3, 'Carol White', 5, 'Stunning display for photo editing and video production. Text is razor sharp.');
  `);

  return db;
}

// Self-executing runner for demonstration
async function main() {
  console.log("==================================================");
  console.log("       SQL Query to RAG Documents Demo            ");
  console.log("==================================================");

  const db = createSampleDatabase();

  // Query: Join Products with Reviews
  const loader = new SQLQueryLoader(db, {
    query: `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        p.description AS product_description,
        r.rating,
        r.comment AS review_comment,
        r.customer_name
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
    `,
    contentColumns: ["product_name", "category", "product_description", "review_comment"],
    sourceName: "store_database",
  });

  const docs = await loader.load();

  // Inspect the first document
  console.log("\nSample Generated Document (Row #1):");
  console.log("--------------------------------------------------");
  console.log("Metadata:", JSON.stringify(docs[0].metadata, null, 2));
  console.log("PageContent:\n" + docs[0].pageContent);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
