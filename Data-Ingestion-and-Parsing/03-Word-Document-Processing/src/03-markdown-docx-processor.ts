import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DocxProcessorOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * 3. Structure-Aware Word Document Processor for RAG
 * 
 * Why this is the recommended standard for Word files in RAG:
 * 1. Plain text extraction removes heading hierarchies (# Heading 1, ## Heading 2)
 *    and turns tables into scrambled lines.
 * 2. By extracting Word documents directly to Markdown via `mammoth.convertToMarkdown()`,
 *    the semantic document tree is preserved.
 * 3. RecursiveCharacterTextSplitter can then split along markdown boundaries,
 *    keeping headers contextually attached to their sub-sections.
 */
export class MarkdownDocxProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(options: DocxProcessorOptions = {}) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: options.chunkSize ?? 600,
      chunkOverlap: options.chunkOverlap ?? 100,
      separators: ["\n## ", "\n### ", "\n\n", "\n", " ", ""],
    });
  }

  /**
   * Converts a DOCX file to Markdown and splits it into context-rich chunks.
   * 
   * @param filePath Path to the .docx file.
   * @returns Array of Document chunks with preserved markdown structures.
   */
  public async process(filePath: string): Promise<Document[]> {
    console.log(`\n--- [MarkdownDocxProcessor] Converting: ${filePath} ---`);

    // 1. Convert Word document to Markdown using mammoth
    const { value: markdownText, messages } = await (mammoth as any).convertToMarkdown({
      path: filePath,
    });

    if (messages.length > 0) {
      console.log(`Conversion warnings: ${messages.length} item(s)`);
    }

    // 2. Wrap into a parent LangChain Document
    const parentDoc = new Document({
      pageContent: markdownText,
      metadata: {
        source: path.basename(filePath),
        format: "docx-markdown",
        totalLength: markdownText.length,
      },
    });

    // 3. Chunk the document along Markdown-aware boundaries
    const chunks = await this.textSplitter.splitDocuments([parentDoc]);

    // 4. Enrich chunks with index metadata
    chunks.forEach((chunk, index) => {
      chunk.metadata.chunkIndex = index + 1;
      chunk.metadata.totalChunks = chunks.length;
    });

    console.log(`Produced ${chunks.length} structured markdown chunks.`);
    return chunks;
  }
}

// Self-executing runner for demonstration
async function main() {
  const proposalPath = path.resolve(__dirname, "../../proposal.docx");

  console.log("==================================================");
  console.log("  3. Structure-Preserving Markdown DOCX Processor ");
  console.log("==================================================");

  const processor = new MarkdownDocxProcessor({
    chunkSize: 600,
    chunkOverlap: 100,
  });

  const chunks = await processor.process(proposalPath);

  // Inspect first 2 chunks
  chunks.slice(0, 2).forEach((chunk, index) => {
    console.log(`\n--- Chunk #${index + 1} (${chunk.pageContent.length} chars) ---`);
    console.log("Metadata:", JSON.stringify(chunk.metadata, null, 2));
    console.log("Content:\n" + chunk.pageContent);
    console.log("--------------------------------------------------");
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
