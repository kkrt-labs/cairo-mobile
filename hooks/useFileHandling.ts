import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { SharedProofData } from "../components/utils/proofSharing";
import { PROOF_SHARING, MESSAGES } from "../components/utils/constants";

interface FileHandlingResult {
  incomingProofData: SharedProofData | null;
  clearIncomingData: () => void;
  isProcessingFile: boolean;
}

// Simple structure check - same as in proofSharing.ts
const hasValidStructure = (data: any): data is SharedProofData => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.proof === "string" &&
    data.metadata &&
    typeof data.metadata === "object" &&
    typeof data.metadata.program === "string" &&
    Array.isArray(data.metadata.input) &&
    Array.isArray(data.metadata.returnValues) &&
    typeof data.metadata.numSteps === "number" &&
    typeof data.metadata.proofSize === "number" &&
    typeof data.metadata.timestamp === "string" &&
    typeof data.metadata.version === "string"
  );
};

export const useFileHandling = (): FileHandlingResult => {
  const [incomingProofData, setIncomingProofData] =
    useState<SharedProofData | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const processFileUrl = async (url: string) => {
    try {
      setIsProcessingFile(true);

      if (!url || typeof url !== "string") {
        throw new Error("Invalid URL provided");
      }

      // Handle different URL schemes
      let fileContent: string;

      if (url.startsWith("file://")) {
        fileContent = await FileSystem.readAsStringAsync(url);
      } else if (url.startsWith("content://")) {
        // Android content URI - copy to cache directory first
        const fileName = `${PROOF_SHARING.TEMP_FILE_PREFIX}${Date.now()}.json`;
        const cacheUri = FileSystem.cacheDirectory + fileName;

        try {
          await FileSystem.copyAsync({
            from: url,
            to: cacheUri,
          });

          fileContent = await FileSystem.readAsStringAsync(cacheUri);

          // Clean up the temporary file
          try {
            await FileSystem.deleteAsync(cacheUri);
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
        } catch (copyError) {
          throw new Error(MESSAGES.FILE_ACCESS_ERROR);
        }
      } else if (url.startsWith("cairomobile://")) {
        // Handle our custom scheme (skip for now)
        return;
      } else {
        Alert.alert("Unsupported File", MESSAGES.UNSUPPORTED_FILE);
        return;
      }

      // Validate file content
      if (!fileContent || typeof fileContent !== "string") {
        throw new Error("File appears to be empty or corrupted");
      }

      // Parse the file content
      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (parseError) {
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

      // Check if it has the expected structure
      if (!hasValidStructure(parsedData)) {
        Alert.alert("Invalid File Format", MESSAGES.INVALID_FILE_FORMAT);
        return;
      }

      setIncomingProofData(parsedData);
      Alert.alert(
        MESSAGES.PROOF_LOADED,
        `Successfully loaded ${parsedData.metadata.program} proof from shared file.`,
      );
    } catch (error) {
      console.error("Error processing file:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      Alert.alert(
        MESSAGES.ERROR_LOADING_FILE,
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
          await processFileUrl(initialUrl);
        }
      } catch (error) {
        console.error("Error handling initial URL:", error);
      }
    };

    // Handle URL when app is already running
    const handleUrlChange = (url: string) => {
      try {
        processFileUrl(url);
      } catch (error) {
        console.error("Error in handleUrlChange:", error);
        Alert.alert("Error", MESSAGES.PROCESSING_FILE_ERROR);
      }
    };

    handleInitialUrl();

    // Listen for URL changes (when app is already running)
    const subscription = Linking.addEventListener("url", ({ url }) => {
      try {
        handleUrlChange(url);
      } catch (error) {
        console.error("Error in URL event listener:", error);
        Alert.alert("Error", MESSAGES.PROCESSING_FILE_ERROR);
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
