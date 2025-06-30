#!/usr/bin/env node
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const PROJECT_ROOT_DIR = path.resolve(__dirname, "..");
const ANDROID_PLATFORM_VERSION = "21"; // From your module's build.gradle minSdkVersion

// Module configurations
const MODULES = {
  "cairo-m": {
    rustProjectDir: "cairo-m",
    expoModuleDir: "cairo-m-bindings",
    libBaseName: "cairo_m_bindings",
  },
  "noir-provekit": {
    rustProjectDir: "noir_provekit",
    expoModuleDir: "noir-provekit",
    libBaseName: "noir_provekit",
  },
};

const ANDROID_TARGETS = [
  {
    arch: "aarch64-linux-android",
    jniLibsSubdir: "arm64-v8a",
  },
];

const IOS_TARGETS = [
  {
    arch: "aarch64-apple-ios-sim",
    type: "simulator",
  },
  {
    arch: "aarch64-apple-ios",
    type: "device",
  },
];

const DEFAULT_ANDROID_TARGET = ANDROID_TARGETS[0];
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
async function setupAndroidPlatform(moduleConfig, rustTarget) {
  const { rustProjectDir, expoModuleDir, libBaseName } = moduleConfig;
  const rustProjectPath = path.join(PROJECT_ROOT_DIR, rustProjectDir);
  const expoModulePath = path.join(PROJECT_ROOT_DIR, "modules", expoModuleDir);

  printHeader(
    `Android: Building ${libBaseName} for ${rustTarget.arch} and Generating Kotlin Bindings`,
  );

  console.log(`Compiling Rust for Android target: ${rustTarget.arch}`);
  const buildArgs = [
    "ndk",
    "--target",
    rustTarget.arch,
    "--platform",
    ANDROID_PLATFORM_VERSION,
    "--", // Separator for cargo build args
    "build",
    "--profile",
    "android-release",
    "--lib",
  ];

  await executeCommand("cargo", buildArgs, { cwd: rustProjectPath });
  console.log("Rust compilation for Android complete.");

  const libName = `lib${libBaseName}.so`;
  const libraryPath = path.join(
    rustProjectPath,
    "target",
    rustTarget.arch,
    "android-release",
    libName,
  );

  console.log("Generating Kotlin bindings for Android");
  // Generate directly to the Android module's Java source directory
  const kotlinDestDir = path.join(
    expoModulePath,
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
    { cwd: rustProjectPath },
  );
  console.log("Kotlin bindings generated directly to module.");

  console.log(`Copying Android artifacts to ${expoModuleDir} module`);
  const androidJniDir = path.join(
    expoModulePath,
    "android",
    "src",
    "main",
    "jniLibs",
    rustTarget.jniLibsSubdir,
  );
  await copyFile(libraryPath, path.join(androidJniDir, libName));

  await checkFileContent(
    path.join(expoModulePath, "android", "build.gradle"),
    "net.java.dev.jna:jna",
    "JNA dependency 'net.java.dev.jna:jna'",
  );
  console.log(
    `Android setup for ${libBaseName} (${rustTarget.arch}) complete.`,
  );
}

async function setupIOSPlatform(moduleConfig, rustTarget) {
  const { rustProjectDir, expoModuleDir, libBaseName } = moduleConfig;
  const rustProjectPath = path.join(PROJECT_ROOT_DIR, rustProjectDir);
  const expoModulePath = path.join(PROJECT_ROOT_DIR, "modules", expoModuleDir);

  const platformType =
    rustTarget.type === "simulator" ? "iOS Simulator" : "iOS Device";
  printHeader(
    `iOS: Building ${libBaseName} for ${platformType} (${rustTarget.arch}) and Generating Swift Bindings`,
  );

  console.log(`Compiling Rust for ${platformType} target: ${rustTarget.arch}`);
  await executeCommand(
    "cargo",
    ["build", "--release", "--target", rustTarget.arch, "--lib"],
    { cwd: rustProjectPath },
  );
  console.log(`Rust compilation for ${platformType} complete.`);

  const libName = `lib${libBaseName}.a`;
  const libraryPath = path.join(
    rustProjectPath,
    "target",
    rustTarget.arch,
    "release",
    libName,
  );

  console.log(`Generating Swift bindings for ${platformType}`);
  // Generate directly to the iOS module's Swift directory
  const iosRustSwiftDir = path.join(expoModulePath, "ios", "rust", "swift");
  await ensureDir(iosRustSwiftDir);

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
    { cwd: rustProjectPath },
  );
  console.log("Swift bindings generated directly to module.");

  // Copy the library to the iOS module
  const iosRustLibDir = path.join(expoModulePath, "ios", "rust");
  await copyFile(libraryPath, path.join(iosRustLibDir, libName));

  // Check for podspec file (different naming conventions)
  const podspecFiles = [
    `${expoModuleDir
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")}.podspec`,
    `${libBaseName}.podspec`,
  ];

  for (const podspecFile of podspecFiles) {
    const podspecPath = path.join(expoModulePath, "ios", podspecFile);
    try {
      await fs.access(podspecPath);
      await checkFileContent(
        podspecPath,
        "s.vendored_libraries",
        "Podspec `s.vendored_libraries`",
      );
      break;
    } catch {
      // File doesn't exist, try next one
    }
  }

  console.log(
    `iOS setup for ${libBaseName} (${platformType}, ${rustTarget.arch}) complete.`,
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
    module: args.find((arg) => arg.startsWith("--module="))?.split("=")[1],
    help: args.includes("--help") || args.includes("-h"),
  };

  if (argv.help) {
    console.log(`
Usage: node scripts/setup_bindings.mjs [options]

Options:
  --all           Build for Android (default arch) and iOS Simulator (default arch). This is the default if no specific platform is chosen.
  --android       Build for Android (default: ${DEFAULT_ANDROID_TARGET.arch}).
  --ios-sim       Build for iOS Simulator (default: ${DEFAULT_IOS_SIM_TARGET.arch}).
  --ios-device    Build for iOS Device (default: ${DEFAULT_IOS_DEVICE_TARGET.arch}).
  --module=NAME   Build only the specified module. Available modules: ${Object.keys(MODULES).join(", ")}
  --help, -h      Show this help message.

Available modules:
${Object.entries(MODULES)
  .map(
    ([name, config]) =>
      `  ${name}: ${config.rustProjectDir} -> ${config.expoModuleDir}`,
  )
  .join("\n")}

Note:
- You can configure specific architectures within the script.
- Ensure Rust targets are installed (e.g., 'rustup target add <target_arch>').
- This script assumes 'cargo-ndk' is installed for Android builds.
    `);
    process.exit(0);
  }

  // Determine which modules to build
  const modulesToBuild = argv.module
    ? MODULES[argv.module]
      ? [argv.module]
      : []
    : Object.keys(MODULES);

  if (modulesToBuild.length === 0) {
    console.error(`❌ Error: Module "${argv.module}" not found.`);
    console.error(`Available modules: ${Object.keys(MODULES).join(", ")}`);
    process.exit(1);
  }

  // Determine what platforms to run
  const runAll =
    argv.all || (!argv.android && !argv["ios-sim"] && !argv["ios-device"]);
  const runAndroid = argv.android || runAll;
  const runIOSSim = argv["ios-sim"] || runAll;
  const runIOSDevice = argv["ios-device"];

  printHeader("Starting Rust Bindings Setup");
  process.chdir(PROJECT_ROOT_DIR);
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`Modules to build: ${modulesToBuild.join(", ")}`);

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

  // Build each module
  for (const moduleName of modulesToBuild) {
    const moduleConfig = MODULES[moduleName];
    printHeader(`Processing Module: ${moduleName}`);

    if (runAndroid) {
      await setupAndroidPlatform(moduleConfig, DEFAULT_ANDROID_TARGET);
    }
    if (runIOSSim) {
      await setupIOSPlatform(moduleConfig, DEFAULT_IOS_SIM_TARGET);
    }
    if (runIOSDevice) {
      if (runIOSSim) {
        console.warn(
          "⚠️ Building for iOS device. If also building for simulator, the library might be overwritten. Consider a universal binary build step.",
        );
      }
      await setupIOSPlatform(moduleConfig, DEFAULT_IOS_DEVICE_TARGET);
    }
  }

  if (iOSNeedsPodInstall) {
    printHeader("Running Pod Install for iOS");
    await executeCommand("pod", ["install"], {
      cwd: path.join(PROJECT_ROOT_DIR, "ios"),
    });
    console.log("Pod install complete.");
  }

  printHeader("Rust Bindings Setup Complete!");
  console.log(
    `✅ All requested modules (${modulesToBuild.join(", ")}) have been processed.`,
  );
  console.log("💡 You can now try building your app:");
  console.log("   npm run android");
  console.log("   npm run ios-sim");
  console.log("   npm run ios-device");
}

main().catch((error) => {
  console.error("❌ Error in main script:", error.message);
  process.exit(1);
});
