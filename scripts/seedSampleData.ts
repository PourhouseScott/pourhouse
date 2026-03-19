import "dotenv/config";
import { execSync } from "node:child_process";

type Step = {
  name: string;
  script: string;
};

const steps: Step[] = [
  { name: "Seed local database sample data", script: "prisma:seed" },
  { name: "Seed Square sandbox sample catalog", script: "square:seed:sandbox" },
  { name: "Sync Square catalog into local wines", script: "square:sync:wines" }
];

function runNpmScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      execSync(`npm run ${script}`, {
        stdio: "inherit",
        shell: process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "/bin/sh"
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function main() {
  for (const step of steps) {
    console.log(`\n=== ${step.name} ===`);
    await runNpmScript(step.script);
  }

  console.log("\nSample data seed flow complete.");
}

main().catch((error) => {
  console.error("Sample data seed flow failed:", error);
  process.exit(1);
});
