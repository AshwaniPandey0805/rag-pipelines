import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PDFParsingOptions {
  splitPages?: boolean; // true = 1 doc per page, false = 1 doc for entire PDF
}

/**
 * Loads and extracts text from a PDF file using LangChain's PDFLoader.
 * (Equivalent to PyPDFLoader in Python LangChain)
 * 
 * @param filePath Path to the target PDF file.
 * @param options PDFLoader configuration options.
 * @returns Array of Document objects.
 */
export async function loadPdfDocument(
  filePath: string,
  options: PDFParsingOptions = { splitPages: true }
): Promise<Document[]> {
  try {
    console.log(`\n--- Loading PDF: ${filePath} ---`);
    console.log(`Mode: splitPages = ${options.splitPages}`);

    // 1. Initialize PDFLoader
    // Under the hood in JS/Node, it uses Mozilla's pdf-parse engine
    const loader = new PDFLoader(filePath, {
      splitPages: options.splitPages ?? true,
    });

    // 2. Extract content asynchronously
    const docs = await loader.load();

    console.log(` Successfully parsed PDF. Generated ${docs.length} document(s).`);
    return docs;
  } catch (error) {
    console.error(` Error parsing PDF "${filePath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const pdfPath = path.resolve(__dirname, "../../attention.pdf");

  console.log("==================================================");
  console.log("     PDF Document Ingestion & Parsing Demo        ");
  console.log("==================================================");

  // --- Step 1: Parse Page-by-Page (splitPages: true) ---
  console.log("\n>>> Step 1: Page-by-page extraction (Default & Recommended for RAG)");
  const pageDocs = await loadPdfDocument(pdfPath, { splitPages: true });

  console.log(`Total Pages Extracted: ${pageDocs.length}`);

  // Inspect the first 2 pages
  pageDocs.slice(0, 2).forEach((doc, idx) => {
    console.log(`\n--- Page #${idx + 1} Metadata ---`);
    console.log(JSON.stringify(doc.metadata, null, 2));
    console.log(`Characters on this page: ${doc.pageContent.length}`);
    console.log(`Snippet:\n"${doc.pageContent.slice(0, 150).replace(/\n/g, " ")}..."`);
  });

  // --- Step 2: Full Document Extraction (splitPages: false) ---
  console.log("\n>>> Step 2: Single-document extraction (splitPages: false)");
  const fullDocs = await loadPdfDocument(pdfPath, { splitPages: false });
  console.log(`Output document count: ${fullDocs.length}`);
  console.log(`Total PDF character count: ${fullDocs[0].pageContent.length}`);

  // --- Step 3: End-to-End Pipeline: Parse PDF -> Chunk with Recursive Splitter ---
  console.log("\n>>> Step 3: Pipeline chaining (PDF Pages -> Text Splitting)");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  // Splitting pageDocs automatically retains pageNumber in every chunk!
  const chunkedDocs = await textSplitter.splitDocuments(pageDocs);
  console.log(`Total chunks generated from all pages: ${chunkedDocs.length}`);

  console.log("\n--- Sample Chunk with Retained Page Number ---");
  const sampleChunk = chunkedDocs[0];
  console.log("Metadata:", sampleChunk.metadata);
  console.log("Page Number:", sampleChunk.metadata.loc?.pageNumber);
  console.log("Content Preview:\n", sampleChunk.pageContent.slice(0, 200));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
