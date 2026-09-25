import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document } from "@langchain/core/documents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Project {
  name: string;
  status: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  skills: string[];
  projects: Project[];
}

interface Department {
  head: string;
  budget: number;
  team_size: number;
}

interface CompanyData {
  company: string;
  employees: Employee[];
  departments: Record<string, Department>;
}

/**
 * 3. Entity-Level RAG JSON Processor
 * 
 * The Industry Standard for Hierarchical JSON in RAG:
 * - Avoids the "isolated leaf string" problem of naive JSON loaders.
 * - Serializes each complete entity (Employee, Department) into a natural,
 *   cohesive text representation for the embedding model.
 * - Extracts structured fields (id, name, skills, budget) into Document metadata
 *   so you can perform hybrid search (vector similarity + SQL/metadata filtering).
 */
export class EntityJSONProcessor {
  /**
   * Processes company_data.json into entity-level RAG Documents.
   */
  public async processCompanyData(filePath: string): Promise<Document[]> {
    console.log(`\n--- [EntityJSONProcessor] Processing: ${path.basename(filePath)} ---`);

    const rawContent = await fs.readFile(filePath, "utf-8");
    const data: CompanyData = JSON.parse(rawContent);

    const documents: Document[] = [];
    const source = path.basename(filePath);

    // 1. Process Employee Entities
    for (const emp of data.employees) {
      const projectList = emp.projects
        .map((p) => `  - ${p.name} (Status: ${p.status})`)
        .join("\n");

      const pageContent = [
        `Company: ${data.company}`,
        `Employee Name: ${emp.name} (ID: ${emp.id})`,
        `Role: ${emp.role}`,
        `Skills: ${emp.skills.join(", ")}`,
        `Assigned Projects:`,
        projectList,
      ].join("\n");

      documents.push(
        new Document({
          pageContent,
          metadata: {
            source,
            entityType: "employee",
            id: emp.id,
            name: emp.name,
            role: emp.role,
            skills: emp.skills,
            projectCount: emp.projects.length,
          },
        })
      );
    }

    // 2. Process Department Entities
    for (const [deptName, dept] of Object.entries(data.departments)) {
      const formattedDeptName = deptName
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const pageContent = [
        `Company: ${data.company}`,
        `Department: ${formattedDeptName}`,
        `Department Head: ${dept.head}`,
        `Annual Budget: $${dept.budget.toLocaleString()}`,
        `Team Size: ${dept.team_size} members`,
      ].join("\n");

      documents.push(
        new Document({
          pageContent,
          metadata: {
            source,
            entityType: "department",
            department: deptName,
            head: dept.head,
            budget: dept.budget,
            teamSize: dept.team_size,
          },
        })
      );
    }

    console.log(`Successfully generated ${documents.length} entity documents (${data.employees.length} employees, ${Object.keys(data.departments).length} departments).`);
    return documents;
  }
}

// Self-executing runner for demonstration
async function main() {
  const jsonPath = path.resolve(__dirname, "../../json_files/company_data.json");

  console.log("==================================================");
  console.log("    3. Entity-Level RAG JSON Processor Demo       ");
  console.log("==================================================");

  const processor = new EntityJSONProcessor();
  const docs = await processor.processCompanyData(jsonPath);

  // Inspect Employee Document
  console.log("\nSample Employee Entity Document:");
  console.log("--------------------------------------------------");
  console.log("Metadata:", JSON.stringify(docs[0].metadata, null, 2));
  console.log("PageContent:\n" + docs[0].pageContent);

  // Inspect Department Document
  const deptDoc = docs.find((d) => d.metadata.entityType === "department");
  if (deptDoc) {
    console.log("\nSample Department Entity Document:");
    console.log("--------------------------------------------------");
    console.log("Metadata:", JSON.stringify(deptDoc.metadata, null, 2));
    console.log("PageContent:\n" + deptDoc.pageContent);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
