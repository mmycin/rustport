# 🚀 RustPort 

RustPort is an NPM package as well as a command-line tool that automates the creation of TypeScript Foreign Function Interface (FFI) bindings for Rust libraries created by Tahcin Ul Karim (Mycin). This means you can call blazing-fast Rust functions from your JavaScript or TypeScript projects effortlessly.

Perfect for **Bun-powered** apps, RustPort takes care of all the annoying binding work, so you don’t have to.

---

## 🧐 Why RustPort?

Because manually writing FFI bindings is like writing assembly—painful and unnecessary. RustPort offers:

✅ **Zero-Hassle Rust FFI Binding Generation** – Just run a command, and boom, your Rust functions are ready in TypeScript.

✅ **Flawless Integration with Bun** – If you’re using Bun, RustPort is your new best friend.

✅ **Effortless Type Mapping** – Converts Rust types into TypeScript like magic.

✅ **Super Simple CLI** – Generate and clean bindings in seconds with **one** command.

---

## 📦 Installation

RustPort can be installed globally via your favorite package manager:

```bash
# Using npm
npm install -g rustport

# Using yarn
yarn global add rustport

# Using bun
bun add -g rustport
```

---

## 🚀 Getting Started

### Step 1: Set Up Your Project

Inside your project, create a `lib/` directory where RustPort will generate its magic:

```bash
mkdir -p lib/rs
```

### Step 2: Write Some Rust Code

Create a Rust file, say `hello.rs`, inside `lib/rs/`:

```rust
#[no_mangle]
pub extern "C" fn say_hello() {
    println!("Hello, Rustacean! 🦀");
}
```

Yes, that’s all you need. No weird macros, no painful setup.

### Step 3: Generate the Bindings

Now, let RustPort do its thing:

```bash
rustport generate lib/
```


This will:

✅ Compile your Rust functions into dynamic libraries (`.so` / `.dll` / `.dylib`).  
✅ Generate TypeScript FFI bindings.  
✅ Create an `index.ts` file inside `lib/`.  

### Step 4: Use Rust Functions in TypeScript

Now, call Rust functions as if they were just another JavaScript function:

```typescript
import { sayHello } from "./lib";

sayHello(); // Prints: Hello, Rustacean! 🦀
```

### Step-5. Run it!
Note that for now it only supports **Bun**, but we’re working on supporting Deno and Node.js. For this, you'll need Bun installed on your machine.
Install Bun using `npm`, `yarn`, or `bun`:  
```bash
npm install -g bun
```
Now run the file.

```bash
bun run fileName.ts
```

**That’s it!** You just called Rust from TypeScript without touching a single binding manually. 🎉

---

## 🔥 CLI Commands

### `rustport generate <path>`
Generates Rust FFI bindings and compiles Rust files to dynamic libraries.

```bash
rustport generate lib/
```

### `rustport clean`
Wipes out all generated files and libraries, leaving no trace of your sins. 😈

```bash
rustport clean
```

### `rustport help`
Displays the help menu.

```bash
rustport help
```

---

## ⚡ Advanced Usage

### 🏗️ Customizing Bindings

Want to rename functions or create wrappers? Just tweak the generated `index.ts`:

```typescript
import { sayHello as rustSayHello } from "./lib";

export function sayHello() {
    rustSayHello();
}
```

### 🧮 Passing & Returning Numbers

Rust loves numbers. So do we. Let's make them talk:

#### Rust (`math.rs`):
```rust
#[no_mangle]
pub extern "C" fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}
```

Generate bindings:
```bash
rustport generate lib/
```

#### TypeScript:
```typescript
import { addNumbers } from "./lib";

console.log("5 + 3 =", addNumbers(5, 3));
```

### 📝 Passing & Returning Strings

Rust can return strings too, but remember: **memory management is a thing!**

#### Rust (`string_utils.rs`):
```rust
use std::ffi::{CString, CStr};
use std::os::raw::c_char;

#[no_mangle]
pub extern "C" fn greet(name: *const c_char) -> *mut c_char {
    let c_str = unsafe { CStr::from_ptr(name) };
    let r_str = format!("Hello, {}!", c_str.to_str().unwrap());
    CString::new(r_str).unwrap().into_raw()
}
```

Generate bindings:
```bash
rustport generate lib/
```

#### TypeScript:
```typescript
import { greet } from "./lib";

console.log(greet("Alice")); // Prints: Hello, Alice!
```

Yes, Rust just greeted Alice from TypeScript. Wild, huh? 😲

---

## 🛠️ Troubleshooting

**1. RustPort fails to generate bindings**  
- Make sure Rust and Cargo are installed.  
- Check if `lib/rs/` contains valid Rust files.  
- Run `cargo build` inside `lib/rs/` to debug compilation issues.  

**2. TypeScript FFI calls fail**  
- Ensure that Rust functions are exported with `#[no_mangle]`.  
- Verify the correct function signatures in TypeScript.  

**3. Dynamic libraries not loading?**  
- On **Windows**, ensure `.dll` files are in the correct directory.  
- On **macOS**, use `install_name_tool` to set the correct paths.  
- On **Linux**, check `LD_LIBRARY_PATH`.  

---

## 🏗️ Example Project

Here’s what a simple RustPort-powered Bun project might look like:

```
my-project/
├── lib/
│   ├── rs/
│   │   ├── hello.rs
│   │   ├── math.rs
│   │   ├── string_utils.rs
│   │   ├── Cargo.toml
├── src/
│   ├── main.ts
├── package.json
```

### `main.ts`
```typescript
import { sayHello, addNumbers, greet } from "../lib";

sayHello();
console.log(addNumbers(10, 20));
console.log(greet("Bob"));
```

---

## 💖 Contributing

If you love RustPort and want to make it even better, open an issue or send a PR on GitHub! If this tool saved you time, consider buying us a virtual coffee. ☕

---

## 📜 License

RustPort is licensed under MIT. See the [LICENSE](LICENSE) file for details.

**Now go forth and build fast, Rust-powered Bun projects! 🚀**

Note: Also check out [ZigPort](https://github.com/mmycin/zigport) for a similar tool that generates TypeScript FFI bindings for Zig libraries.