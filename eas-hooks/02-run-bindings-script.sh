#!/bin/bash
set -ex # Exit on error, print commands

echo "Running Rust bindings setup script..."
echo "EAS_BUILD_PLATFORM: $EAS_BUILD_PLATFORM"
echo "EAS_BUILD_PROFILE: $EAS_BUILD_PROFILE"

# Ensure cargo is in PATH (it might have been set by a previous hook's shell)
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
elif [ -d "$HOME/.cargo/bin" ] && [[ ":$PATH:" != *":$HOME/.cargo/bin:"* ]]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Verify cargo is available
if ! command -v cargo &> /dev/null; then
    echo "Error: cargo command not found. Ensure Rust was installed correctly in a previous step."
    exit 1
fi

PLATFORM_ARGS=""
if [ "$EAS_BUILD_PLATFORM" == "android" ]; then
  PLATFORM_ARGS="--android"
elif [ "$EAS_BUILD_PLATFORM" == "ios" ]; then
  PLATFORM_ARGS="--ios-device"
elif [[ "$EAS_BUILD_PROFILE" == "ios-simulator" ]]; then
  PLATFORM_ARGS="--ios-sim"
else
  echo "Error: EAS_BUILD_PLATFORM ('$EAS_BUILD_PLATFORM') is not 'android' or 'ios' or 'ios-simulator'. Cannot determine build arguments."
  exit 1
fi

echo "Running Cairo M bindings script with arguments: $PLATFORM_ARGS"
node scripts/setup_rust_bindings.mjs $PLATFORM_ARGS

echo "Running Noir ProveKit bindings script with arguments: $PLATFORM_ARGS"
node scripts/setup_noir_provekit_bindings.mjs $PLATFORM_ARGS

echo "Rust bindings setup script finished."
