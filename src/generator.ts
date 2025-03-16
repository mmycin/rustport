import fs from "fs-extra";
import path from "path";
import { parseRustFile } from "./parser.js";
import { glob } from "glob";

export async function generateBindings(libDir: string): Promise<void> {
    // Create mod directory if it doesn't exist
    const modDir = path.join(libDir, "mod");
    fs.ensureDirSync(modDir);

    // Get all Rust files
    const rustFiles = await glob(`${libDir}/rs/**/*.rs`);

    // Track all exports for index.ts
    const exports: Record<string, string[]> = {};

    // Process each Rust file
    for (const rustFile of rustFiles) {
        const fileName = path.basename(rustFile, ".rs");
        const relativePath = path.relative(path.join(libDir, "rs"), rustFile);
        const relativeDir = path.dirname(relativePath);

        // Create subdirectories in mod/ if needed
        const targetDir = path.join(modDir, relativeDir);
        fs.ensureDirSync(targetDir);

        // Parse Rust file to extract function signatures
        const functions = parseRustFile(rustFile);

        if (functions.length === 0) {
            console.warn(`Warning: No exported functions found in ${rustFile}`);
            continue;
        }

        // Generate TypeScript binding file
        const tsFilePath = path.join(targetDir, `${fileName}.ts`);
        const tsContent = generateTypeScriptBinding(fileName, functions);
        fs.writeFileSync(tsFilePath, tsContent);

        // Track exports for index.ts
        const modulePath = path.join(
            relativeDir === "." ? "" : relativeDir,
            fileName
        );
        const importPath = `./${path.join("mod", modulePath)}`;

        exports[importPath] = functions.map((fn) => fn.name);
    }

    // Generate index.ts
    generateIndexFile(libDir, exports);
}

function generateTypeScriptBinding(
    fileName: string,
    functions: Array<{
        name: string;
        args: Array<{ type: string }>;
        returnType: string;
    }>
): string {
    let content = `import { dlopen, FFIType, suffix } from "bun:ffi";\n\n`;
    content += `const BASE_DIR = "lib/bin";\n\n`;

    // Map Rust types to FFI types
    const typeMapping: Record<string, string> = {
        u8: "u8",
        u16: "u16",
        u32: "u32",
        u64: "u64",
        i8: "i8",
        i16: "i16",
        i32: "i32",
        i64: "i64",
        f32: "f32",
        f64: "f64",
        bool: "bool",
        void: "void",
        char: "char",
        ptr: "ptr",
        cstring: "cstring",
    };

    // First create the FFI binding
    content += `const lib = dlopen(\`\${BASE_DIR}/${fileName}.\${suffix}\`, {\n`;

    for (const fn of functions) {
        content += `  ${fn.name}: {\n`;
        content += `    args: [${fn.args
            .map((arg) => `FFIType.${typeMapping[arg.type] || "u64"}`)
            .join(", ")}],\n`;
        content += `    returns: FFIType.${
            typeMapping[fn.returnType] || "u64"
        },\n`;
        content += `  },\n`;
    }

    content += `});\n\n`;

    // Then export each function individually
    for (const fn of functions) {
        content += `export const ${fn.name} = lib.symbols.${fn.name};\n`;
    }

    return content;
}

function generateIndexFile(
    libDir: string,
    exports: Record<string, string[]>
): void {
    let content = "";

    // Generate imports
    for (const [importPath, functionNames] of Object.entries(exports)) {
        const moduleName = path.basename(importPath);
        
        // Append to content instead of overwriting it
        content += `export * from "./mod/${moduleName}";\n`;
    }

    content += "\n";

    // Write index.ts
    fs.writeFileSync(path.join(libDir, "index.ts"), content);
}
