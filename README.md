# Cairo M for Mobile

A React Native app using Expo using
[Cairo M](https://github.com/kkrt-labs/cairo-m) to generate zero-knowledge
proofs on mobile.

## Development

### Requirements

1.  **Node.js & npm:** Install [Node.js](https://nodejs.org/en/download) (LTS
    version recommended, e.g., 18.x or later) and npm.
2.  **Rust (Nightly Toolchain):** Install
    [Rust](https://www.rust-lang.org/tools/install).

    - The project uses the **nightly** toolchain for Rust. The
      `rust-toolchain.toml` file will typically set this up for you.

3.  **Expo CLI:** Install the Expo CLI: `npm install -g expo-cli`.
4.  **Platform-Specific Tooling:** - **Android:** Android Studio (for SDK,
    emulator, and build tools). - **iOS:** Xcode (for SDK, simulator, and build
    tools) and CocoaPods (`sudo gem install cocoapods`).
    [CocoaPods](https://guides.cocoapods.org/using/getting-started.html#installation)
    recommends not using the MacOS system's version of Ruby, and install it
    through other means, e.g. homebrew.
5.  **Rust Targets:** Install the necessary targets for cross-compilation:
    ```bash
    rustup target add aarch64-linux-android
    rustup target add aarch64-apple-ios
    rustup target add aarch64-apple-ios-sim
    ```
6.  **`cargo-ndk`:** For Android Rust builds:
    ```bash
    cargo install cargo-ndk
    ```

### Setup

1. Clone the repository

```bash
git clone https://github.com/kkrt-labs/cairo-mobile.git
cd cairo-mobile
```

2. Install dependencies

```bash
npm install
```

3.  **Generate Native Bindings:** This step compiles the Rust code in `cairo-m/`
    and prepares the native modules (`cairo-m-bindings`). ⚠️ Running
    `npm run generate-bindings` will generate ios bindings simulator, not for
    device. For ios devices, run
    `node scripts/setup_rust_bindings.mjs --ios-device`

    ```bash
    npm run generate-bindings
    # or specifically:
    # node scripts/setup_rust_bindings.mjs --all
    ```

    _You'll need to re-run this command whenever you make changes to the Rust
    code in `cairo-m/` folder._

4.  Prebuild the native Android & iOS directories

```bash
npx expo prebuild --clean
```

5. Run the app

- **Android**: Run on Android device if connected, fallbacks to Android
  Simulator
  ```bash
  npx expo run:android
  ```
- **iOS**
  ```bash
  npx expo run:ios # Run on iOS Simulator
  npx expo run:ios --device # Run on iOS device
  ```
