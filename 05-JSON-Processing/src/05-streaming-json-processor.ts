import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { Document } from "@langchain/core/documents";
import { GenericJSONProcessor } from "./04-generic-json-processor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface StreamingOptions {
  batchSize?: number; // How many documents to accumulate before pushing to vector store
  onBatch: (batch: Document[], batchNumber: number) => Promise<void> | void;
}

/**
 * Production Pattern 2: High-Scale Streaming JSON/JSONL Processor
 * 
 * Solves:
 * - Prevents V8 "JavaScript heap out of memory" crashes on massive files (500MB - 10GB+).
 * - Uses Node.js ReadStream and readline to process records one line at a time.
 * - Flushes records in configurable batches (e.g. 500 records) to the vector store
 *   and allows Node's garbage collector to immediately release memory.
 * - Memory usage stays virtually constant (~25MB) regardless of file size.
 */
export class StreamingJSONProcessor {
  /**
   * Streams a JSON Lines (.jsonl) file in constant memory.
   */
  public async processJsonLines(filePath: string, options: StreamingOptions): Promise<{ totalProcessed: number; totalBatches: number }> {
    console.log(`\n--- [StreamingJSONProcessor] Streaming: ${path.basename(filePath)} ---`);
    console.log(`Batch Size: ${options.batchSize ?? 500} records per batch.`);

    const batchSize = options.batchSize ?? 500;
    const fileStream = fs.createReadStream(filePath, { encoding: "utf-8" });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentBatch: Document[] = [];
    let totalProcessed = 0;
    let batchNumber = 0;
    const source = path.basename(filePath);

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const record = JSON.parse(trimmed);
        totalProcessed++;

        // Convert the record to a Document using the generic serializer
        const doc = new Document({
          pageContent: GenericJSONProcessor.serializeToText(record),
          metadata: {
            source,
            line: totalProcessed,
            ...GenericJSONProcessor.extractScalarMetadata(record),
          },
        });

        currentBatch.push(doc);

        // When batch limit is reached, flush to callback / Vector Store
        if (currentBatch.length >= batchSize) {
          batchNumber++;
          await options.onBatch(currentBatch, batchNumber);
          currentBatch = []; // Immediately freed for Garbage Collection!
        }
      } catch (err) {
        console.warn(`[Skip] Corrupted JSON at line ${totalProcessed + 1}:`, err);
      }
    }

    // Flush any remaining documents in the final partial batch
    if (currentBatch.length > 0) {
      batchNumber++;
      await options.onBatch(currentBatch, batchNumber);
      currentBatch = [];
    }

    console.log(`Stream complete: Processed ${totalProcessed} records in ${batchNumber} batch(es).`);
    return { totalProcessed, totalBatches: batchNumber };
  }
}

// Self-executing runner for demonstration
async function main() {
  const jsonlPath = path.resolve(__dirname, "../sample-data/employees.jsonl");

  console.log("==================================================");
  console.log("    Streaming Large JSON Datasets (Memory Safe)   ");
  console.log("==================================================");

  const processor = new StreamingJSONProcessor();

  // Simulate flushing batches of 2 records to a Vector Database
  await processor.processJsonLines(jsonlPath, {
    batchSize: 2,
    onBatch: async (batch, batchNumber) => {
      console.log(`\n>>> [Batch #${batchNumber}] Flushed ${batch.length} documents to Vector Store:`);
      batch.forEach((doc) => {
        console.log(`  - Record #${doc.metadata.line}: ${doc.metadata.name ?? "Entity"} (${doc.metadata.role ?? "N/A"})`);
      });
      // In real production, this is: await vectorStore.addDocuments(batch);
    },
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
