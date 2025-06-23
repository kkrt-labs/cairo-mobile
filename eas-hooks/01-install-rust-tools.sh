#!/bin/bash
set -ex # Exit on error, print commands

echo "Installing Rust and required tools for EAS Build..."

# Install Rust if not present (EAS images might already have it)
if ! command -v rustc &> /dev/null; then
    echo "Rust not found, installing..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain nightly
    # Add cargo to PATH for this script session and subsequent processes in the same job if possible
    # Sourcing .cargo/env is the standard way
    if [ -f "$HOME/.cargo/env" ]; then
        source "$HOME/.cargo/env"
    else
        export PATH="$HOME/.cargo/bin:$PATH"
    fi
else
    echo "Rust is already installed - Installing latest nightly."
    # Ensure cargo is in PATH if Rust was pre-installed
    if ! command -v cargo &> /dev/null && [ -d "$HOME/.cargo/bin" ]; then
        export PATH="$HOME/.cargo/bin:$PATH"
        source "$HOME/.cargo/env" # Try sourcing again
    fi
    rustup update nightly
    rustup default nightly
fi

echo "Rust version: $(rustc --version || echo 'rustc not found')"
echo "Cargo version: $(cargo --version || echo 'cargo not found')"
echo "rustup version: $(rustup --version || echo 'rustup not found')"

# Install Rust targets needed by setup_rust_bindings.mjs
# The script checks for: aarch64-linux-android, aarch64-apple-ios-sim, aarch64-apple-ios
echo "Adding Rust targets..."
rustup target add aarch64-linux-android
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim # For completeness, though EAS device builds won't use it directly

# Install cargo-ndk
echo "Installing cargo-ndk..."
if ! cargo-ndk --version &> /dev/null; then
    cargo install cargo-ndk
else
    echo "cargo-ndk is already installed."
fi

echo "Rust tools installation complete."
