import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocx } from "./01-docx-loader.js";
import { MarkdownDocxProcessor } from "./03-markdown-docx-processor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runWordDemo() {
  console.log("==================================================================");
  console.log("            Phase: Word Document (.docx) Processing Demo          ");
  console.log("==================================================================");

  const proposalPath = path.resolve(__dirname, "../../proposal.docx");

  // 1. Standard DocxLoader (Plain Text)
  console.log("\n>>> Step 1: Ingesting with standard DocxLoader (Plain Text)...");
  const standardDocs = await loadDocx(proposalPath);

  // 2. MarkdownDocxProcessor (Structured Markdown)
  console.log("\n>>> Step 2: Ingesting with MarkdownDocxProcessor (Structured Markdown)...");
  const processor = new MarkdownDocxProcessor({ chunkSize: 600, chunkOverlap: 100 });
  const structuredChunks = await processor.process(proposalPath);

  // Consolidated Comparison
  console.log("\n==================================================================");
  console.log("            Word Document Processing Comparison Summary            ");
  console.log("==================================================================");

  console.table([
    {
      Method: "DocxLoader (Standard)",
      "Output Type": "Single Document (Plain text)",
      "Total Characters": standardDocs[0]?.pageContent.length ?? 0,
      "Preserves Headings": "❌ No (Flattened)",
      "Preserves Tables": "❌ No (Flattened lines)",
      "Recommended For": "Basic search, flat documents",
    },
    {
      Method: "MarkdownDocxProcessor",
      "Output Type": `${structuredChunks.length} Document Chunks`,
      "Total Characters": structuredChunks.reduce((acc, c) => acc + c.pageContent.length, 0),
      "Preserves Headings": "✅ Yes (#, ## Markdown)",
      "Preserves Tables": "✅ Yes (Markdown tables)",
      "Recommended For": "Production RAG & Vector search",
    },
  ]);

  console.log("Word Document Processing completed successfully!\n");
}

runWordDemo().catch(console.error);
