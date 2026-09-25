import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Production Pattern 1: Generic, Schema-Agnostic JSON Processor
 * 
 * Solves:
 * - Eliminates the need to create manual TypeScript interfaces/models for every JSON file.
 * - Works automatically for flat JSON, shallow JSON, or deeply nested JSON.
 * - Formats nested structures into clean, natural key-value text for embeddings.
 * - Automatically copies scalar fields into Document.metadata for hybrid filtering.
 */
export class GenericJSONProcessor {
  /**
   * Recursively serializes any value (object, array, primitive) into human-readable text.
   */
  public static serializeToText(data: unknown, prefix = ""): string {
    if (data === null || data === undefined) return "";

    const lines: string[] = [];

    if (Array.isArray(data)) {
      // 1. Array of primitives: [ "Python", "JavaScript" ] -> "skills: Python, JavaScript"
      if (data.every((item) => typeof item !== "object" || item === null)) {
        lines.push(`${prefix}: ${data.join(", ")}`);
      } else {
        // 2. Array of objects: [{ name: "RAG" }, { name: "ML" }]
        data.forEach((item, index) => {
          const itemText = this.serializeToText(item, `${prefix}[${index + 1}]`);
          if (itemText) lines.push(itemText);
        });
      }
    } else if (typeof data === "object") {
      // 3. Object traversal
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) continue;

        if (typeof value === "object") {
          lines.push(this.serializeToText(value, fullKey));
        } else {
          lines.push(`${fullKey}: ${value}`);
        }
      }
    } else {
      // 4. Single primitive
      lines.push(`${prefix}: ${data}`);
    }

    return lines.filter(Boolean).join("\n");
  }

  /**
   * Extracts shallow/primitive key-values from any object for metadata filtering.
   */
  public static extractScalarMetadata(data: Record<string, unknown>): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // Store strings, numbers, booleans, and primitive arrays in metadata
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        metadata[key] = value;
      } else if (Array.isArray(value) && value.every((v) => typeof v !== "object")) {
        metadata[key] = value;
      }
    }

    return metadata;
  }

  /**
   * Ingests any arbitrary JSON file without requiring any predefined schema.
   */
  public async processFile(filePath: string): Promise<Document[]> {
    console.log(`\n--- [GenericJSONProcessor] Processing: ${path.basename(filePath)} ---`);

    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const source = path.basename(filePath);
    const documents: Document[] = [];

    if (Array.isArray(parsed)) {
      // Case A: JSON is an array of records [ {...}, {...} ]
      parsed.forEach((item, index) => {
        documents.push(
          new Document({
            pageContent: GenericJSONProcessor.serializeToText(item),
            metadata: {
              source,
              index: index + 1,
              ...GenericJSONProcessor.extractScalarMetadata(typeof item === "object" && item !== null ? item : {}),
            },
          })
        );
      });
    } else if (typeof parsed === "object" && parsed !== null) {
      // Case B: JSON is a complex object with nested collections
      for (const [topLevelKey, topLevelValue] of Object.entries(parsed)) {
        if (Array.isArray(topLevelValue)) {
          // Break each item in the array into its own document
          topLevelValue.forEach((item, index) => {
            documents.push(
              new Document({
                pageContent: `Category: ${topLevelKey}\n` + GenericJSONProcessor.serializeToText(item),
                metadata: {
                  source,
                  collection: topLevelKey,
                  index: index + 1,
                  ...GenericJSONProcessor.extractScalarMetadata(typeof item === "object" && item !== null ? item : {}),
                },
              })
            );
          });
        } else if (typeof topLevelValue === "object" && topLevelValue !== null) {
          // Break nested sub-objects (e.g. departments) into documents
          for (const [subKey, subVal] of Object.entries(topLevelValue)) {
            documents.push(
              new Document({
                pageContent: `Category: ${topLevelKey} (${subKey})\n` + GenericJSONProcessor.serializeToText(subVal),
                metadata: {
                  source,
                  collection: topLevelKey,
                  entityKey: subKey,
                  ...GenericJSONProcessor.extractScalarMetadata(typeof subVal === "object" && subVal !== null ? subVal as Record<string, unknown> : {}),
                },
              })
            );
          }
        }
      }
    }

    console.log(`Generic parser created ${documents.length} document(s) with zero hardcoded schemas.`);
    return documents;
  }
}

// Self-executing runner for demonstration
async function main() {
  const jsonPath = path.resolve(__dirname, "../../json_files/company_data.json");

  console.log("==================================================");
  console.log("    Generic Schema-Agnostic JSON Processing       ");
  console.log("==================================================");

  const processor = new GenericJSONProcessor();
  const docs = await processor.processFile(jsonPath);

  // Preview generated documents
  console.log("\nSample Generated Document (Employee #1):");
  console.log("--------------------------------------------------");
  console.log("Metadata:", JSON.stringify(docs[0].metadata, null, 2));
  console.log("PageContent:\n" + docs[0].pageContent);

  console.log("\nSample Generated Document (Department):");
  console.log("--------------------------------------------------");
  const deptDoc = docs.find((d) => d.metadata.collection === "departments");
  if (deptDoc) {
    console.log("Metadata:", JSON.stringify(deptDoc.metadata, null, 2));
    console.log("PageContent:\n" + deptDoc.pageContent);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
