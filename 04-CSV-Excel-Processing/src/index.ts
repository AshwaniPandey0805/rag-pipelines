import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCsvDefault, loadCsvTargetColumn } from "./01-csv-loader.js";
import { ExcelLoader } from "./03-excel-loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTabularDemo() {
  console.log("==================================================================");
  console.log("        Phase: Tabular Data (CSV & Excel) Processing for RAG      ");
  console.log("==================================================================");

  const csvPath = path.resolve(__dirname, "../../structured-file/products.csv");
  const excelPath = path.resolve(__dirname, "../../structured-file/inventory.xlsx");

  // 1. Ingest CSV (Full Key-Value)
  console.log("\n>>> Step 1: Ingesting products.csv (Full Key-Value)...");
  const csvDocs = await loadCsvDefault(csvPath);

  // 2. Ingest CSV (Target Column 'Description')
  console.log("\n>>> Step 2: Ingesting products.csv (Target Column 'Description')...");
  const columnDocs = await loadCsvTargetColumn(csvPath, "Description");

  // 3. Ingest Excel Workbook (Row Mode)
  console.log("\n>>> Step 3: Ingesting inventory.xlsx (Multi-Sheet Row Mode)...");
  const excelRowLoader = new ExcelLoader(excelPath, { mode: "rows" });
  const excelRowDocs = await excelRowLoader.load();

  // 4. Ingest Excel Workbook (Markdown Table Mode)
  console.log("\n>>> Step 4: Ingesting inventory.xlsx (Sheet-as-Table Mode)...");
  const excelTableLoader = new ExcelLoader(excelPath, { mode: "tables" });
  const excelTableDocs = await excelTableLoader.load();

  // 5. Consolidated Summary Table
  console.log("\n==================================================================");
  console.log("            Tabular Ingestion Processing Summary Table            ");
  console.log("==================================================================");

  console.table([
    {
      Format: "CSV (.csv)",
      Loader: "CSVLoader (Default)",
      Source: path.basename(csvPath),
      "Documents Produced": csvDocs.length,
      "RAG Chunking Strategy": "1 Row = 1 Document (Key-Value text)",
    },
    {
      Format: "CSV (.csv)",
      Loader: "CSVLoader (Target Column)",
      Source: path.basename(csvPath),
      "Documents Produced": columnDocs.length,
      "RAG Chunking Strategy": "Description text only (Fields in metadata)",
    },
    {
      Format: "Excel (.xlsx)",
      Loader: "ExcelLoader (Row Mode)",
      Source: path.basename(excelPath),
      "Documents Produced": excelRowDocs.length,
      "RAG Chunking Strategy": "Row-level documents with sheetName metadata",
    },
    {
      Format: "Excel (.xlsx)",
      Loader: "ExcelLoader (Table Mode)",
      Source: path.basename(excelPath),
      "Documents Produced": excelTableDocs.length,
      "RAG Chunking Strategy": "1 Markdown table Document per sheet",
    },
  ]);

  // 6. Demonstrate Metadata Filtering Capability for RAG
  console.log("\n>>> Real-World RAG Benefit: Hybrid Search & Metadata Filtering");
  const affordableProducts = excelRowDocs.filter(
    (doc) => doc.metadata.Price !== undefined && Number(doc.metadata.Price) < 100
  );
  console.log(`Found ${affordableProducts.length} items with Price < $100:`);
  affordableProducts.forEach((p) => {
    console.log(` - ${p.metadata.Product} ($${p.metadata.Price}) [Sheet: ${p.metadata.sheetName}]`);
  });

  console.log("\nTabular Ingestion pipeline completed successfully!\n");
}

runTabularDemo().catch(console.error);
