import { Command } from "commander";
import chalk from "chalk";
import { generateBindings } from "./generator.js";
import { cleanGeneratedFiles } from "./utils.js";
import fs from "fs-extra";
import path from "path";

export function cli(args: string[]) {
    const program = new Command();

    program
        .name("rustport")
        .description(
            "Generate TypeScript FFI bindings for Rust libraries using Bun. Created by Mycin"
        )
        .version("1.0.1");

    program
        .command("generate")
        .description("Generate TypeScript bindings for Rust files")
        .argument(
            "<dir>",
            "Directory containing Rust files (should have an rs/ subdirectory)"
        )
        .action(async (dir: string) => {
            try {
                const libDir = path.resolve(process.cwd(), dir);

                // Check if the directory exists
                if (!fs.existsSync(libDir)) {
                    console.error(
                        chalk.red(`Error: Directory ${libDir} does not exist`)
                    );
                    process.exit(1);
                }

                // Check if rs/ subdirectory exists
                const rsDir = path.join(libDir, "rs");
                if (!fs.existsSync(rsDir)) {
                    console.error(
                        chalk.red(
                            `Error: ${rsDir} directory not found. Make sure your Rust files are in the rs/ subdirectory.`
                        )
                    );
                    process.exit(1);
                }

                console.log(
                    chalk.blue(
                        `Generating bindings for Rust files in ${rsDir}...`
                    )
                );

                // Compile Rust files
                await compileRustFiles(libDir);

                // Generate TypeScript bindings
                await generateBindings(libDir);

                console.log(
                    chalk.green("✓ Successfully generated TypeScript bindings!")
                );
                
                console.log(
                    chalk.blue(
                        `You can now import your Rust functions in your TypeScript code using the following import statement:`
                    )
                );

                console.log(
                    chalk.cyan("\nimport") +
                        " " + // Cyan for keywords
                        chalk.yellow("{") +
                        " " + // Yellow for `{`
                        chalk.blue("FUNCTIONNAME") +
                        " " + // Bright blue function
                        chalk.yellow("}") +
                        " " + // Yellow for `}`
                        chalk.cyan("from") +
                        " " + // Cyan for keywords
                        chalk.magenta('"./lib";\n') // Magenta for string
                );
            } catch (error) {
                console.error(
                    chalk.red(
                        `Error generating bindings: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`
                    )
                );
                process.exit(1);
            }
        });

    program
        .command("clean")
        .description(
            "Remove generated files (mod/ and bin/ directories and index.ts)"
        )
        .argument("[dir]", "Directory to clean (defaults to lib/)", "lib")
        .action((dir: string) => {
            try {
                const libDir = path.resolve(process.cwd(), dir);
                cleanGeneratedFiles(libDir);
                console.log(
                    chalk.green(
                        `✓ Successfully cleaned generated files in ${libDir}`
                    )
                );
            } catch (error) {
                console.error(
                    chalk.red(
                        `Error cleaning files: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`
                    )
                );
                process.exit(1);
            }
        });

    program.parse(args);
}

async function compileRustFiles(libDir: string): Promise<void> {
    const { execSync } = await import("child_process");

    // Create build script content
    const buildScript = `
#!/bin/bash

LIBS_DIR="${libDir}"
BIN_DIR="$LIBS_DIR/bin"

mkdir -p "$BIN_DIR"

# Compile Rust files to dynamic libraries
for file in "$LIBS_DIR"/rs/*.rs; do
    rustc --crate-type cdylib "$file"
done

# Cleanup and move binaries
find "./" -type f -name "*.dll.a" -delete
find "./" -type f -name "*.dll.exp" -delete
find "./" -type f -name "*.dll.lib" -delete
find "./" -type f -name "*.pdb" -delete
find "./" -type f -name "*.dll" -exec mv {} "$BIN_DIR" \\;
find "./" -type f -name "*.so" -exec mv {} "$BIN_DIR" \\;
find "./" -type f -name "*.dylib" -exec mv {} "$BIN_DIR" \\;
`;

    // Write temporary build script
    const tempScriptPath = path.join(process.cwd(), "rustport-temp-build.sh");
    fs.writeFileSync(tempScriptPath, buildScript, { mode: 0o755 });

    try {
        // Execute build script
        execSync(`bash ${tempScriptPath}`, { stdio: "inherit" });
    } finally {
        // Clean up temporary script
        fs.unlinkSync(tempScriptPath);
    }
}
