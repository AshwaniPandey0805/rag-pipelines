import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SmartPDFProcessorOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  minPageLength?: number; // Minimum characters to consider a page valid (skips blanks)
}

export interface EnrichedPDFMetadata extends Record<string, any> {
  page: number;
  totalPages: number;
  chunkMethod: string;
  charCount: number;
  chunkIndex?: number;
  source: string;
}

/**
 * SmartPDFProcessor (TypeScript implementation)
 * 
 * Solves real-world PDF parsing challenges:
 * 1. Broken Ligatures: Decodes typographic ligatures (ﬁ, ﬂ, ﬀ, ﬃ, ﬄ) into standard letters so vector searches match.
 * 2. Hyphenated Line Breaks: Reconnects words split across line breaks (e.g., "trans-\nformer" -> "transformer").
 * 3. Whitespace Normalization: Eliminates irregular line-feeds, form-feeds, and excessive tabs/spaces.
 * 4. Blank/Junk Page Filtering: Skips near-empty pages (e.g. blank sheets, single-word disclaimer pages).
 * 5. Metadata Enrichment: Injects page numbers, total pages, character counts, and chunk indexes.
 */
export class SmartPDFProcessor {
  private chunkSize: number;
  private chunkOverlap: number;
  private minPageLength: number;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(options: SmartPDFProcessorOptions = {}) {
    this.chunkSize = options.chunkSize ?? 1000;
    this.chunkOverlap = options.chunkOverlap ?? 100;
    this.minPageLength = options.minPageLength ?? 50;

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap,
      separators: ["\n\n", "\n", " ", ""],
    });
  }

  /**
   * Cleans extracted text to fix common PDF parsing artifacts.
   */
  public cleanText(text: string): string {
    let cleaned = text;

    // 1. Fix common typographic ligatures (critical for keyword & embedding matching)
    const ligatures: Record<string, string> = {
      "ﬁ": "fi",
      "ﬂ": "fl",
      "ﬀ": "ff",
      "ﬃ": "ffi",
      "ﬄ": "ffl",
      "ﬅ": "ft",
      "ﬆ": "st",
    };

    for (const [ligature, replacement] of Object.entries(ligatures)) {
      cleaned = cleaned.replaceAll(ligature, replacement);
    }

    // 2. Fix hyphenated line breaks (e.g., "atten-\ntion" -> "attention")
    cleaned = cleaned.replace(/(\w+)-\n(\w+)/g, "$1$2");

    // 3. Remove non-printable / control characters (preserves standard newlines & tabs)
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // 4. Normalize multiple consecutive spaces/tabs into a single space (while keeping paragraph breaks)
    cleaned = cleaned
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .filter((line) => line.length > 0)
      .join("\n");

    return cleaned;
  }

  /**
   * Ingests, sanitizes, enriches, and chunks a PDF document.
   * 
   * @param pdfPath Absolute or relative path to the PDF file.
   * @returns Array of chunked Document objects with enriched metadata.
   */
  public async processPdf(pdfPath: string): Promise<Document[]> {
    try {
      console.log(`\n[SmartPDFProcessor] Ingesting: ${pdfPath}`);

      // 1. Load PDF page-by-page
      const loader = new PDFLoader(pdfPath, { splitPages: true });
      const pages = await loader.load();
      console.log(`[SmartPDFProcessor] Raw pages loaded: ${pages.length}`);

      const processedChunks: Document[] = [];
      let skippedPages = 0;

      // 2. Process each page individually
      for (const [pageIndex, page] of pages.entries()) {
        const pageNumber = pageIndex + 1;

        // Clean extracted text
        const cleanedText = this.cleanText(page.pageContent);

        // Skip nearly empty pages (e.g. blank sheets, pure whitespace)
        if (cleanedText.trim().length < this.minPageLength) {
          skippedPages++;
          continue;
        }

        // 3. Build enriched metadata
        const metadata: EnrichedPDFMetadata = {
          source: path.basename(pdfPath),
          page: pageNumber,
          totalPages: pages.length,
          chunkMethod: "smart_pdf_processor",
          charCount: cleanedText.length,
        };

        // 4. Chunk this specific page while carrying the page metadata
        const chunks = await this.textSplitter.createDocuments(
          [cleanedText],
          [metadata]
        );

        // 5. Assign an intra-page chunk index for precision citations
        chunks.forEach((chunk, chunkIdx) => {
          chunk.metadata.chunkIndex = chunkIdx + 1;
        });

        processedChunks.push(...chunks);
      }

      console.log(`[SmartPDFProcessor] Completed processing.`);
      console.log(`- Filtered out ${skippedPages} empty/insignificant page(s).`);
      console.log(`- Produced ${processedChunks.length} high-quality chunks.`);

      return processedChunks;
    } catch (error) {
      console.error(`[SmartPDFProcessor] Failed to process ${pdfPath}:`, error);
      throw error;
    }
  }
}

// Self-executing runner for demonstration
async function main() {
  const pdfPath = path.resolve(__dirname, "../../attention.pdf");

  const processor = new SmartPDFProcessor({
    chunkSize: 800,
    chunkOverlap: 100,
    minPageLength: 50,
  });

  const chunks = await processor.processPdf(pdfPath);

  // Inspect first 3 chunks
  console.log("\n================ Sample Chunks ================");
  chunks.slice(0, 3).forEach((chunk, idx) => {
    console.log(`\n--- Chunk #${idx + 1} ---`);
    console.log("Metadata:", JSON.stringify(chunk.metadata, null, 2));
    console.log("Character length:", chunk.pageContent.length);
    console.log(`Preview:\n${chunk.pageContent.slice(0, 220)}...`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
