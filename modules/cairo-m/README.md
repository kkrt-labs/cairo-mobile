# Cairo-M (mobile)

Rust crate that exposes a minimal **Cairo M runner** to mobile (or
any FFI consumer) through [UniFFI](https://github.com/mozilla/uniffi-rs). The current focus is demonstration: we
ship a pre-compiled Fibonacci program, execute it inside the VM and return:

- the program's return value,
- execution speed (steps / s) for the VM itself,
- end-to-end speed including JSON loading, execution and trace export.

## 1. Requirements

- Rust **nightly** (edition 2024) – see `rust-toolchain.toml`.
- `clang` / `lld` for cross-platform linking.
- (Optional) Java / Kotlin or Swift tool-chains if you want mobile bindings.

---

## 2. Building & testing the Rust crate

```bash
# Build native library (static + cdylib)
cargo build --release

# Run unit tests (executes the Fibonacci program and asserts result == 55)
cargo test --release
```

---

## 3. Generating UniFFI bindings

1. **Build the library** first (see step 2).
2. **Generate bindings** for the language of your choice:

```bash
# Kotlin example
cargo run --package uniffi-bindgen \
  generate \
  --library target/release/libcairo_m.dylib \
  --language kotlin \
  --out-dir out/kotlin
```

---

## 4. Public API (FFI safe)

```rust
/// Runs the bundled Fibonacci program.
///
/// On success returns:
///     - return_value  = 55
///     - steps_per_second_execution
///     - steps_per_second_e2e
#[uniffi::export]
fn run_program() -> Result<RunResult, MobileVmError>
```

### `RunResult`

| field                        | type | description                          |
| ---------------------------- | ---- | ------------------------------------ |
| `return_value`               | u32  | Program exit value (`fib(10) == 55`) |
| `steps_per_second_execution` | f64  | VM core performance                  |
| `steps_per_second_e2e`       | f64  | End-to-end performance               |

### `MobileVmError`

| variant | Typical cause                            |
| ------- | ---------------------------------------- |
| `Vm`    | Cairo M VM error                         |
| `Io`    | File read / write error (JSON or traces) |
| `Json`  | Malformed `*.json` compiled program      |
