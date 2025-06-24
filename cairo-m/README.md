# Cairo-M (mobile)

Rust crate that exposes a minimal **Cairo M runner** to mobile (or any FFI
consumer) through [UniFFI](https://github.com/mozilla/uniffi-rs). The current
focus: load a program and execute it inside the VM and return:

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
  --library target/release/libcairo_m_bindings.dylib \
  --language kotlin \
  --out-dir out/kotlin
```

```bash
# Swift example
cargo run --package uniffi-bindgen \
  generate \
  --library target/release/libcairo_m_bindings.a \
  --language swift \
  --out-dir out/swift
```
