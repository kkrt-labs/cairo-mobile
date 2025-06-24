#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const PROJECT_ROOT_DIR = path.resolve(__dirname, "..");
const RUST_PROJECT_DIR = path.join(PROJECT_ROOT_DIR, "cairo-m");
const EXPO_MODULE_DIR = path.join(
  PROJECT_ROOT_DIR,
  "modules",
  "cairo-m-bindings",
);

const ANDROID_PLATFORM_VERSION = "21"; // From your module's build.gradle minSdkVersion

const ANDROID_TARGETS = [
  {
    arch: "aarch64-linux-android",
    jniLibsSubdir: "arm64-v8a",
    libName: "libcairo_m_bindings.so",
  },
];

const IOS_TARGETS = [
  {
    arch: "aarch64-apple-ios-sim",
    type: "simulator",
    libName: "libcairo_m_bindings.a",
  },
  {
    arch: "aarch64-apple-ios",
    type: "device",
    libName: "libcairo_m_bindings.a",
  },
  // TODO: Potentially x86_64-apple-ios for older simulators, but aarch64-apple-ios-sim covers modern ones
];

const DEFAULT_ANDROID_TARGET = ANDROID_TARGETS[0]; // aarch64-linux-android
const DEFAULT_IOS_SIM_TARGET = IOS_TARGETS.find((t) => t.type === "simulator");
const DEFAULT_IOS_DEVICE_TARGET = IOS_TARGETS.find((t) => t.type === "device");

// --- Helper Functions ---
function printHeader(message) {
  console.log("\n" + "-".repeat(50));
  console.log(` ${message}`);
  console.log("-".repeat(50));
}

function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const commandStr = `${command} ${args.join(" ")}`;
    console.log(
      `🔩 Executing: ${commandStr}` + (options.cwd ? ` in ${options.cwd}` : ""),
    );

    // Use 'pipe' for stdout/stderr when capturing output, otherwise 'inherit'
    const stdio = options.captureOutput
      ? ["inherit", "pipe", "pipe"]
      : "inherit";

    const proc = spawn(command, args, {
      stdio,
      cwd: options.cwd,
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    if (options.captureOutput) {
      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    proc.on("error", (error) => {
      console.error(`❌ Error executing: ${commandStr}`);
      console.error(`Error: ${error.message}`);
      reject(error);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ Success: ${commandStr}`);
        resolve({ stdout, stderr });
      } else {
        const error = new Error(
          `Command failed with code ${code}: ${commandStr}`,
        );
        error.stdout = stdout;
        error.stderr = stderr;
        console.error(`❌ Error executing: ${commandStr}`);
        if (stderr) console.error("Stderr:", stderr);
        if (stdout) console.error("Stdout:", stdout);
        reject(error);
      }
    });
  });
}

async function checkRustTarget(target) {
  try {
    const result = await executeCommand(
      "rustup",
      ["target", "list", "--installed"],
      {
        captureOutput: true,
      },
    );
    if (!result.stdout.includes(target)) {
      console.error(`❌ Error: Rust target "${target}" is not installed.`);
      console.error(`💡 Please install it with: rustup target add ${target}`);
      process.exit(1);
    }
    console.log(`✅ Rust target "${target}" is installed.`);
  } catch (error) {
    console.error(
      `❌ Error checking Rust target "${target}": ${error.message}`,
    );
    if (error.stderr) console.error("Stderr:", error.stderr);
    if (error.stdout) console.error("Stdout:", error.stdout);
    process.exit(1);
  }
}

async function checkCommand(commandName, installHint = "") {
  try {
    // Split the command into executable and arguments
    const [executable, ...args] = commandName.split(" ");
    await executeCommand(executable, [...args, "--version"]);
  } catch (_error) {
    console.error(
      `❌ Error: Command "${commandName}" not found or not executable.`,
    );
    if (installHint) console.error(`💡 Hint: ${installHint}`);
    process.exit(1);
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyFile(source, destination) {
  await ensureDir(path.dirname(destination));
  await fs.copyFile(source, destination);
  console.log(
    `Copied ${path.relative(PROJECT_ROOT_DIR, source)} to ${path.relative(PROJECT_ROOT_DIR, destination)}`,
  );
}

async function checkFileContent(filePath, searchString, expectedMessage) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    if (!content.includes(searchString)) {
      console.warn(
        `⚠️ Warning: ${expectedMessage} might be missing or incorrect.`,
      );
      console.warn(`  Expected to find "${searchString}" in ${filePath}`);
    } else {
      console.log(
        `✅ Content check passed for "${searchString}" in ${filePath}.`,
      );
    }
  } catch (error) {
    console.warn(
      `⚠️ Warning: Could not read file ${filePath} to check for "${searchString}". ${error.message}`,
    );
  }
}

// --- Platform Specific Setup ---

async function setupAndroidPlatform(rustTarget) {
  printHeader(
    `Android: Building Rust for ${rustTarget.arch} and Generating Kotlin Bindings`,
  );

  console.log(`Compiling Rust for Android target: ${rustTarget.arch}`);
  await executeCommand(
    "cargo",
    [
      "ndk",
      "--target",
      rustTarget.arch,
      "--platform",
      ANDROID_PLATFORM_VERSION,
      "--", // Separator for cargo build args
      "build",
      "--release",
      "--lib",
    ],
    { cwd: RUST_PROJECT_DIR },
  );
  console.log("Rust compilation for Android complete.");

  const libraryPath = path.join(
    RUST_PROJECT_DIR,
    "target",
    rustTarget.arch,
    "release",
    rustTarget.libName,
  );

  console.log("Generating Kotlin bindings for Android");
  // Generate directly to the Android module's Java source directory
  const kotlinDestDir = path.join(
    EXPO_MODULE_DIR,
    "android",
    "src",
    "main",
    "java",
  );

  await executeCommand(
    "cargo",
    [
      "run",
      "--package",
      "uniffi-bindgen",
      "generate",
      "--library",
      libraryPath,
      "--language",
      "kotlin",
      "--out-dir",
      kotlinDestDir,
    ],
    { cwd: RUST_PROJECT_DIR },
  );
  console.log("Kotlin bindings generated directly to module.");

  console.log("Copying Android artifacts to zk-bindings module");
  const androidJniDir = path.join(
    EXPO_MODULE_DIR,
    "android",
    "src",
    "main",
    "jniLibs",
    rustTarget.jniLibsSubdir,
  );
  await copyFile(libraryPath, path.join(androidJniDir, rustTarget.libName));

  await checkFileContent(
    path.join(EXPO_MODULE_DIR, "android", "build.gradle"),
    "net.java.dev.jna:jna",
    "JNA dependency 'net.java.dev.jna:jna:5.13.0@aar'",
  );
  console.log(`Android setup for ${rustTarget.arch} complete.`);
}

async function setupIOSPlatform(rustTarget) {
  const platformType =
    rustTarget.type === "simulator" ? "iOS Simulator" : "iOS Device";
  printHeader(
    `iOS: Building Rust for ${platformType} (${rustTarget.arch}) and Generating Swift Bindings`,
  );

  console.log(`Compiling Rust for ${platformType} target: ${rustTarget.arch}`);
  await executeCommand(
    "cargo",
    ["build", "--release", "--target", rustTarget.arch, "--lib"],
    { cwd: RUST_PROJECT_DIR },
  );
  console.log(`Rust compilation for ${platformType} complete.`);

  const libraryPath = path.join(
    RUST_PROJECT_DIR,
    "target",
    rustTarget.arch,
    "release",
    rustTarget.libName,
  );

  console.log(`Generating Swift bindings for ${platformType}`);
  // Generate directly to the iOS module's Swift directory
  const iosRustSwiftDir = path.join(EXPO_MODULE_DIR, "ios", "rust", "swift");
  await ensureDir(iosRustSwiftDir);

  // NOTE: Bindings are not universal for simulator and device.
  // For now, we'll just copy the specific target's .a file.
  // A real setup might involve creating a universal binary (lipo) if both sim and device are built.
  // The Podspec would need to be adjusted or use a universal binary.
  // For simplicity, let's assume the Podspec points to a generic name and we overwrite it
  // or that the user manages which .a file to use (e.g. via XCode build settings or a universal binary step)
  await executeCommand(
    "cargo",
    [
      "run",
      "--package",
      "uniffi-bindgen",
      "generate",
      "--library",
      libraryPath,
      "--language",
      "swift",
      "--out-dir",
      iosRustSwiftDir,
    ],
    { cwd: RUST_PROJECT_DIR },
  );
  console.log("Swift bindings generated directly to module.");

  // For now, we'll just copy the specific target's .a file.
  // A real setup might involve creating a universal binary (lipo) if both sim and device are built.
  const iosRustLibDir = path.join(EXPO_MODULE_DIR, "ios", "rust");
  await copyFile(
    libraryPath,
    path.join(iosRustLibDir, `libcairo_m_bindings.a`),
  ); // Distinguish by type for now

  await checkFileContent(
    path.join(EXPO_MODULE_DIR, "ios", "CairoM.podspec"),
    "s.vendored_libraries",
    "Podspec `s.vendored_libraries`",
  );
  console.log(
    `iOS setup for ${platformType} (${rustTarget.arch}) complete. Pod install will run if any iOS target was processed.`,
  );
}

// --- Main Script ---
async function main() {
  // Manual argument parsing
  const args = process.argv.slice(2);
  const argv = {
    all: args.includes("--all"),
    android: args.includes("--android"),
    "ios-sim": args.includes("--ios-sim"),
    "ios-device": args.includes("--ios-device"),
    help: args.includes("--help") || args.includes("-h"),
  };

  if (argv.help) {
    console.log(`
Usage: node scripts/setup_rust_bindings.mjs [options]

Options:
  --all           Build for Android (default arch) and iOS Simulator (default arch). This is the default if no specific platform is chosen.
  --android       Build for Android (default: ${DEFAULT_ANDROID_TARGET.arch}).
  --ios-sim       Build for iOS Simulator (default: ${DEFAULT_IOS_SIM_TARGET.arch}).
  --ios-device    Build for iOS Device (default: ${DEFAULT_IOS_DEVICE_TARGET.arch}).
  --help, -h      Show this help message.

Note:
- You can configure specific architectures within the script.
- Ensure Rust targets are installed (e.g., 'rustup target add <target_arch>').
- This script assumes 'cargo-ndk' is installed for Android builds.
    `);
    process.exit(0);
  }

  // Determine what to run
  const runAll =
    argv.all || (!argv.android && !argv["ios-sim"] && !argv["ios-device"]);
  const runAndroid = argv.android || runAll;
  const runIOSSim = argv["ios-sim"] || runAll;
  const runIOSDevice = argv["ios-device"];

  printHeader("Starting Rust Bindings Setup for Cairo Mobile");
  process.chdir(PROJECT_ROOT_DIR);
  console.log(`Working directory: ${process.cwd()}`);

  printHeader("Checking Prerequisites");
  await checkCommand("rustup");
  await checkCommand("cargo");
  if (runAndroid) {
    await checkCommand("cargo ndk", "cargo install cargo-ndk");
    await checkRustTarget(DEFAULT_ANDROID_TARGET.arch);
  }
  let iOSNeedsPodInstall = false;
  if (runIOSSim) {
    await checkRustTarget(DEFAULT_IOS_SIM_TARGET.arch);
    iOSNeedsPodInstall = true;
  }
  if (runIOSDevice) {
    await checkRustTarget(DEFAULT_IOS_DEVICE_TARGET.arch);
    iOSNeedsPodInstall = true;
  }
  if (iOSNeedsPodInstall) {
    await checkCommand(
      "pod",
      "sudo gem install cocoapods (or brew install cocoapods)",
    );
  }
  console.log("Prerequisites met.");

  if (runAndroid) {
    await setupAndroidPlatform(DEFAULT_ANDROID_TARGET);
  }
  if (runIOSSim) {
    await setupIOSPlatform(DEFAULT_IOS_SIM_TARGET);
  }
  if (runIOSDevice) {
    // Note: Building for both sim and device might require creating a universal binary (fat lib) for libcairo_m.a
    // This script currently overwrites libcairo_m.a with the last built target.
    // For a robust setup, you'd use `lipo` to combine device and simulator .a files.
    console.warn(
      "⚠️ Building for iOS device. If also building for simulator, the `libcairo_m_bindings.a` might be overwritten. Consider a universal binary build step.",
    );
    await setupIOSPlatform(DEFAULT_IOS_DEVICE_TARGET);
  }

  if (iOSNeedsPodInstall) {
    printHeader("iOS: Running pod install");
    await executeCommand("pod", ["install"], {
      cwd: path.join(PROJECT_ROOT_DIR, "ios"),
    });
    console.log("Pod install complete.");
  }

  printHeader("Rust Bindings Setup for Cairo Mobile Finished Successfully!");
  console.log("💡 You can now try building your app:");
  console.log("   npm run android");
  console.log("   npm run ios-sim");
  console.log("   npm run ios-device");
}

main().catch((err) => {
  console.error("❌ Script failed:", err.message || err);
  if (err.stack && !err.message.includes(err.stack)) {
    // Avoid duplicate stack if already in message
    console.error(err.stack);
  }
  process.exit(1);
});
