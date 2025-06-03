import { dlopen, FFIType, suffix } from "bun:ffi";
import path from "path";

const BASE_DIR = path.join(__dirname, "..", "bin");

const lib = dlopen(path.join(BASE_DIR, `add.${suffix}`), {
  add: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.i32,
  },
});

export const add = lib.symbols.add;