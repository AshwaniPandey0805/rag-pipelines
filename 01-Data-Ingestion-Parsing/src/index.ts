import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSingleTextFile } from "./01-text-loader.js";
import { loadDirectory } from "./02-directory-loader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDemo() {
  console.log("==================================================");
  console.log("   Phase 1: LangChain Document Loaders Demo       ");
  console.log("==================================================");

  // 1. Single File Ingestion with TextLoader
  console.log("\n>>> Step 1: Ingesting a single file with TextLoader");
  const singleFilePath = path.resolve(__dirname, "../sample-data/ai-overview.txt");
  const singleFileDocs = await loadSingleTextFile(singleFilePath);
  
  console.log(`Loaded ${singleFileDocs.length} document from "${path.basename(singleFilePath)}"`);
  console.log(`First 80 chars: "${singleFileDocs[0].pageContent.slice(0, 80).replace(/\n/g, " ")}..."`);

  // 2. Batch / Directory Ingestion with DirectoryLoader
  console.log("\n>>> Step 2: Ingesting an entire folder with DirectoryLoader");
  const sampleDirPath = path.resolve(__dirname, "../sample-data");
  const directoryDocs = await loadDirectory(sampleDirPath, {
    recursive: true,
    unknown: "warn",
  });

  console.log(`Total ingested documents: ${directoryDocs.length}`);
  
  // Show metadata table for inspection
  console.log("\n Ingested Documents Registry:");
  const tableData = directoryDocs.map((doc, idx) => ({
    id: idx + 1,
    source: path.relative(sampleDirPath, doc.metadata.source || ""),
    characters: doc.pageContent.length,
    words: doc.pageContent.split(/\s+/).filter(Boolean).length,
  }));
  console.table(tableData);

  console.log("\n Ingestion & Parsing demo completed successfully!");
}

runDemo().catch(console.error);
