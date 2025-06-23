# Cairo M for Mobile

A React Native app using Expo using
[Cairo M](https://github.com/kkrt-labs/cairo-m) to generate zero-knowledge
proofs on mobile.

## Development

### Requirements

- [Rust](https://www.rust-lang.org/tools/install)

- Node.js 22 & npm
  - It is recommended to use a version manager such as
    [nvm](https://github.com/nvm-sh/nvm).
- [Android Studio](https://developer.android.com/studio)
- [XCode](https://developer.apple.com/xcode/) (if targetting iOS)
- [CocoaPods](https://guides.cocoapods.org/using/getting-started.html#installation)

### Setup

0. Setup Rust

```bash
# Android
rustup target add aarch64-linux-android
cargo install cargo-ndk

# iOS
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
```

1. Clone the repository

```bash
git clone https://github.com/kkrt-labs/cairo-mobile.git
cd cairo-mobile
```

2. Install dependencies

```bash
npm install
```

3. Prebuild the native Android & iOS directories

```bash
npx expo prebuild --clean
```

4. **Generate Native Bindings:** This step compiles the Rust code in `cairo-m/`
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
