import path from "node:path";
import { fileURLToPath } from "node:url";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import type { Document } from "@langchain/core/documents";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DirectoryLoaderOptions {
  recursive?: boolean;
  unknown?: "warn" | "error" | "ignore";
}

/**
 * Loads all supported documents from a directory using LangChain's DirectoryLoader.
 * 
 * @param dirPath Path to the target directory.
 * @param options Loader options (recursive traversal, handling unknown file types).
 * @returns Array of LangChain Document objects loaded across all matching files.
 */
export async function loadDirectory(
  dirPath: string,
  options: DirectoryLoaderOptions = { recursive: true, unknown: "warn" }
): Promise<Document[]> {
  try {
    console.log(`\n--- Scanning directory: ${dirPath} ---`);
    console.log(`Recursive: ${options.recursive}, Unknown files: ${options.unknown}`);

    // 1. Initialize DirectoryLoader with file extension mapping
    // Maps each file extension to its corresponding loader factory
    const directoryLoader = new DirectoryLoader(
      dirPath,
      {
        ".txt": (filePath: string) => new TextLoader(filePath),
        ".md": (filePath: string) => new TextLoader(filePath),
      },
      options.recursive ?? true,
      options.unknown ?? "warn"
    );

    // 2. Load all documents in the directory
    const docs = await directoryLoader.load();

    console.log(` Successfully loaded a total of ${docs.length} document(s).`);
    return docs;
  } catch (error) {
    console.error(` Error reading directory "${dirPath}":`, error);
    throw error;
  }
}

// Self-executing runner for demonstration
async function main() {
  const sampleDirPath = path.resolve(__dirname, "../sample-data");

  const docs = await loadDirectory(sampleDirPath, {
    recursive: true,
    unknown: "warn",
  });

  console.log("\n Summary of Loaded Documents:");
  console.log("=================================================");
  docs.forEach((doc, idx) => {
    const relativeSource = path.relative(sampleDirPath, doc.metadata.source || "");
    console.log(`[${idx + 1}] Source: ${relativeSource}`);
    console.log(`    Characters: ${doc.pageContent.length}`);
    console.log(`    First line: "${doc.pageContent.split("\n")[0].trim()}"`);
    console.log("-------------------------------------------------");
  });
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
