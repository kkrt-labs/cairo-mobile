# Cairo M for Mobile

A React Native app using Expo using [Cairo M](https://github.com/kkrt-labs/cairo-m) to generate zero-knowledge proofs on mobile.

## Development

### Requirements

- Node.js 22 & npm
  - It is recommended to use a version manager such as [nvm](https://github.com/nvm-sh/nvm).
- [Android Studio](https://developer.android.com/studio)
- [XCode](https://developer.apple.com/xcode/) (if targetting iOS)
  - [CocoaPods](https://guides.cocoapods.org/using/getting-started.html#installation) (CocoaPods recommends not using the macOS system version of ruby)

### Setup
1. Clone the repository
```bash
git clone https://github.com/kkrt-labs/zink.git
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

4. Run the app
  - **Android**: Run on Android device if connected, fallbacks to Android Simulator
    ```bash
    npx expo run:android
    ```
  - **iOS**
    ```bash
    npx expo run:ios # Run on iOS Simulator
    npx expo run:ios --device # Run on iOS device
    ```
