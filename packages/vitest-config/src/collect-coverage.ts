import fs from "node:fs/promises";
import path from "node:path";

import { glob } from "glob";

async function collectCoverageFiles() {
  try {
    // Define the patterns to search
    const patterns = ["../../apps/*", "../../packages/*"];

    // Define the destination directory (you can change this as needed)
    const destinationDir = path.join(process.cwd(), "coverage/raw");

    // Create the destination directory if it doesn't exist
    await fs.mkdir(destinationDir, { recursive: true });

    // Arrays to collect all directories and directories with coverage.json
    const allDirectories = [];
    const directoriesWithCoverage = [];

    // Process each pattern
    for (const pattern of patterns) {
      // Find all paths matching the pattern
      const matches = await glob(pattern);

      // Filter to only include directories
      for (const match of matches) {
        const stats = await fs.stat(match);

        if (stats.isDirectory()) {
          allDirectories.push(match);

          // ✅ Path to the coverage file Vitest actually generates
          const coverageFilePath = path.join(
            match,
            "coverage",
            "coverage-final.json"
          );
          const coverageDir = path.join(match, "coverage");

          try {
            // First check if coverage directory exists (faster than checking file)
            const dirStats = await fs.stat(coverageDir);

            if (dirStats.isDirectory()) {
              // Now check if the specific file exists
              await fs.access(coverageFilePath);

              // ✅ File exists - proceed with copying
              directoriesWithCoverage.push(match);

              const directoryName = path.basename(match);
              const destinationFile = path.join(
                destinationDir,
                `${directoryName}-coverage.json`
              );

              await fs.copyFile(coverageFilePath, destinationFile);
              console.log(`✓ Copied: ${directoryName}`);
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    }

    // Create clean patterns for display (without any "../" prefixes)
    const replaceDotPatterns = (str: string) => {
      // Normalize and remove any ".." or "." path segments for safe display
      const normalized = path.normalize(str);
      const parts = normalized.split(path.sep);
      const filteredParts = parts.filter(
        (part) => part !== ".." && part !== "."
      );
      return filteredParts.join(path.sep);
    };

    if (directoriesWithCoverage.length > 0) {
      console.log(
        `Found coverage.json in: ${directoriesWithCoverage
          .map(replaceDotPatterns)
          .join(", ")}`
      );
    }

    console.log(`Coverage collected into: ${path.join(process.cwd())}`);
  } catch (error) {
    console.error("Error collecting coverage files:", error);
  }
}

collectCoverageFiles().catch(() => {
  process.exit(1);
});
