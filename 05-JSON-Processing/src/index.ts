import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadJsonWithPointers } from "./01-json-loader.js";
import { loadJsonLines } from "./02-json-lines-loader.js";
import { EntityJSONProcessor } from "./03-entity-json-processor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runJsonDemo() {
  console.log("==================================================================");
  console.log("             Phase: JSON and JSONL Processing for RAG             ");
  console.log("==================================================================");

  const jsonPath = path.resolve(__dirname, "../../json_files/company_data.json");
  const jsonlPath = path.resolve(__dirname, "../sample-data/employees.jsonl");

  // 1. JSONLoader with RFC 6901 pointers
  console.log("\n>>> Step 1: Ingesting targeted pointers with JSONLoader...");
  const pointerDocs = await loadJsonWithPointers(jsonPath, [
    "/company",
    "/departments/engineering/head",
    "/departments/data_science/head",
  ]);

  // 2. JSONLinesLoader
  console.log("\n>>> Step 2: Ingesting .jsonl with JSONLinesLoader...");
  const jsonlDocs = await loadJsonLines(jsonlPath, "/role");

  // 3. EntityJSONProcessor (RAG Gold Standard)
  console.log("\n>>> Step 3: Ingesting complete entities with EntityJSONProcessor...");
  const processor = new EntityJSONProcessor();
  const entityDocs = await processor.processCompanyData(jsonPath);

  // Consolidated Summary Table
  console.log("\n==================================================================");
  console.log("             JSON Processing Techniques Summary Table             ");
  console.log("==================================================================");

  console.table([
    {
      Method: "JSONLoader (RFC 6901 Pointers)",
      Input: "company_data.json",
      "Documents Produced": pointerDocs.length,
      "Extraction Level": "Targeted leaf strings (/company, /departments/...)",
      "Best For": "Pinpointing specific fields",
    },
    {
      Method: "JSONLinesLoader",
      Input: "employees.jsonl",
      "Documents Produced": jsonlDocs.length,
      "Extraction Level": "One field per line across records",
      "Best For": "Streaming logs & line-delimited records",
    },
    {
      Method: "EntityJSONProcessor",
      Input: "company_data.json",
      "Documents Produced": entityDocs.length,
      "Extraction Level": "Complete Entity (Employees + Departments)",
      "Best For": "Production RAG, hybrid search & semantic context",
    },
  ]);

  // Demonstrate Hybrid Search & Metadata Filtering for JSON
  console.log("\n>>> Real-World RAG Benefit: Metadata Filtering on Entities");
  
  // Filter 1: Find employees skilled in Python
  const pythonDevs = entityDocs.filter(
    (doc) => doc.metadata.entityType === "employee" && doc.metadata.skills?.includes("Python")
  );
  console.log(`Employees with Python skills (${pythonDevs.length}):`);
  pythonDevs.forEach((e) => console.log(` - ${e.metadata.name} (${e.metadata.role})`));

  // Filter 2: Find departments with budget >= $1M
  const bigBudgets = entityDocs.filter(
    (doc) => doc.metadata.entityType === "department" && Number(doc.metadata.budget) >= 1000000
  );
  console.log(`\nDepartments with Budget >= $1,000,000 (${bigBudgets.length}):`);
  bigBudgets.forEach((d) => console.log(` - ${d.metadata.department} (Head: ${d.metadata.head}, Budget: $${d.metadata.budget.toLocaleString()})`));

  console.log("\nJSON Processing pipeline completed successfully!\n");
}

runJsonDemo().catch(console.error);
