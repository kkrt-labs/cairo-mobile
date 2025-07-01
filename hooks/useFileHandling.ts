import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";
import { SharedProofData } from "../components/utils/proofSharing";

interface FileHandlingResult {
  incomingProofData: SharedProofData | null;
  clearIncomingData: () => void;
  isProcessingFile: boolean;
}

const isValidSharedProofData = (data: any): data is SharedProofData => {
  try {
    return (
      data != null &&
      typeof data === "object" &&
      typeof data.proof === "string" &&
      data.proof.length > 0 &&
      data.metadata != null &&
      typeof data.metadata === "object" &&
      typeof data.metadata.program === "string" &&
      data.metadata.program.length > 0 &&
      Array.isArray(data.metadata.input) &&
      Array.isArray(data.metadata.returnValues) &&
      typeof data.metadata.numSteps === "number" &&
      data.metadata.numSteps >= 0 &&
      typeof data.metadata.proofSize === "number" &&
      data.metadata.proofSize > 0 &&
      typeof data.metadata.timestamp === "string" &&
      data.metadata.timestamp.length > 0 &&
      typeof data.metadata.version === "string" &&
      data.metadata.version.length > 0
    );
  } catch (error) {
    console.error("Error in validation function:", error);
    return false;
  }
};

export const useFileHandling = (): FileHandlingResult => {
  const [incomingProofData, setIncomingProofData] =
    useState<SharedProofData | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const processFileUrl = async (url: string) => {
    try {
      setIsProcessingFile(true);
      console.log("Processing file URL:", url);
      console.log("Platform:", Platform.OS);

      // Validate URL first
      if (!url || typeof url !== "string") {
        throw new Error("Invalid URL provided");
      }

      // Handle different URL schemes
      let fileContent: string;

      if (url.startsWith("file://")) {
        console.log("Reading file:// URL");
        // Direct file path - use FileSystem
        fileContent = await FileSystem.readAsStringAsync(url);
      } else if (url.startsWith("content://")) {
        console.log("Reading content:// URL - copying to cache first");
        // Android content URI - copy to cache directory first
        const fileName = "temp_proof_" + Date.now() + ".json";
        const cacheUri = FileSystem.cacheDirectory + fileName;

        try {
          console.log("Copying from content URI to cache:", cacheUri);
          await FileSystem.copyAsync({
            from: url,
            to: cacheUri,
          });

          console.log("Reading from cache file");
          fileContent = await FileSystem.readAsStringAsync(cacheUri);

          // Clean up the temporary file
          try {
            await FileSystem.deleteAsync(cacheUri);
            console.log("Cleaned up temporary cache file");
          } catch (cleanupError) {
            console.warn("Failed to cleanup temporary file:", cleanupError);
          }
        } catch (copyError) {
          console.error("Failed to copy content URI to cache:", copyError);
          throw new Error(
            `Cannot access the selected file. Please try selecting the file again or save it to your device storage first. Error: ${copyError}`,
          );
        }
      } else if (url.startsWith("cairomobile://")) {
        // Handle our custom scheme (if needed for future enhancements)
        console.log("Custom scheme URL, skipping");
        return;
      } else {
        console.log("Unsupported URL scheme:", url);
        Alert.alert(
          "Unsupported File",
          "Only local files can be imported. Please select a file from your device storage.",
        );
        return;
      }

      // Validate file content
      if (!fileContent || typeof fileContent !== "string") {
        throw new Error("File appears to be empty or corrupted");
      }

      console.log("File content length:", fileContent.length);
      console.log("File content preview:", fileContent.substring(0, 100));

      // Try to parse the file content
      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        const errorMsg =
          parseError instanceof Error
            ? parseError.message
            : "Unknown parse error";
        Alert.alert(
          "Invalid File Format",
          `The file is not valid JSON format. Error: ${errorMsg}`,
        );
        return;
      }

      // Validate parsedData is an object
      if (!parsedData || typeof parsedData !== "object") {
        console.log("Parsed data is not an object:", typeof parsedData);
        Alert.alert(
          "Invalid File Format",
          "The file does not contain valid proof data.",
        );
        return;
      }

      console.log("Parsed data keys:", Object.keys(parsedData));

      // Validate the proof data structure
      try {
        if (!isValidSharedProofData(parsedData)) {
          console.log("Invalid proof data structure");
          Alert.alert(
            "Invalid Proof File",
            "The selected file does not contain a valid Cairo proof with the expected structure.",
          );
          return;
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        Alert.alert(
          "Validation Error",
          "Error while validating proof data structure.",
        );
        return;
      }

      console.log("Successfully validated proof data");
      setIncomingProofData(parsedData);
      Alert.alert(
        "Proof Loaded!",
        `Successfully loaded ${parsedData.metadata.program} proof from shared file.`,
      );
    } catch (error) {
      console.error("Error processing file:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const errorDetails =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack || "No stack trace available",
            }
          : { error: String(error) };

      console.error("Error details:", errorDetails);

      Alert.alert(
        "Error Loading File",
        `Failed to load proof from file: ${errorMessage}`,
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  const clearIncomingData = () => {
    setIncomingProofData(null);
  };

  useEffect(() => {
    // Handle initial URL when app is opened
    const handleInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log("App opened with URL:", initialUrl);
          await processFileUrl(initialUrl);
        }
      } catch (error) {
        console.error("Error handling initial URL:", error);
      }
    };

    // Handle URL when app is already running
    const handleUrlChange = (url: string) => {
      console.log("URL changed:", url);
      // Wrap in try-catch to prevent any unhandled errors from crashing the app
      try {
        processFileUrl(url);
      } catch (error) {
        console.error("Error in handleUrlChange:", error);
        Alert.alert(
          "Error",
          "An error occurred while processing the file. Please try again.",
        );
      }
    };

    // Handle Android intent data - expo-intent-launcher doesn't provide getInitialIntent
    // We'll rely on Linking.getInitialURL() which should handle file intents on Android

    handleInitialUrl();

    // Listen for URL changes (when app is already running)
    const subscription = Linking.addEventListener("url", ({ url }) => {
      try {
        handleUrlChange(url);
      } catch (error) {
        console.error("Error in URL event listener:", error);
        Alert.alert(
          "Error",
          "An error occurred while processing the incoming file.",
        );
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    incomingProofData,
    clearIncomingData,
    isProcessingFile,
  };
};
