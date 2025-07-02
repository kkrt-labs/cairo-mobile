import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { RunProofResult } from "../../modules/cairo-m-bindings/src/CairoMBindings.types";
import { PROOF_SHARING, MESSAGES } from "./constants";

export interface SharedProofData {
  proof: string;
  metadata: {
    program: string;
    input: number[];
    returnValues: number[];
    numSteps: number;
    proofSize: number;
    timestamp: string;
    version: string;
  };
}

export const createSharedProofData = (
  proofResult: RunProofResult,
  program: string,
  input: number[],
): SharedProofData => {
  return {
    proof: proofResult.proof,
    metadata: {
      program,
      input,
      returnValues: proofResult.returnValues,
      numSteps: proofResult.numSteps,
      proofSize: proofResult.proofSize,
      timestamp: new Date().toISOString(),
      version: PROOF_SHARING.VERSION,
    },
  };
};

export const shareProofAsFile = async (
  sharedData: SharedProofData,
): Promise<void> => {
  try {
    const fileName = `${PROOF_SHARING.SHARE_FILE_PREFIX}${sharedData.metadata.program}_${Date.now()}${PROOF_SHARING.FILE_EXTENSION}`;
    const content = JSON.stringify(sharedData, null, 2);

    // Create a temporary file
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, content);

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: PROOF_SHARING.MIME_TYPE,
      dialogTitle: MESSAGES.SHARE_DIALOG_TITLE,
      UTI: PROOF_SHARING.UTI,
    });

    // Clean up the temporary file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (error) {
    console.error("Error sharing proof:", error);
    Alert.alert("Error", MESSAGES.SHARE_ERROR);
  }
};

export const importProofFromFile =
  async (): Promise<SharedProofData | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: PROOF_SHARING.MIME_TYPE,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const response = await fetch(result.assets[0].uri);
      const content = await response.text();
      const parsedData = JSON.parse(content);

      // Basic structure check - if it has the expected fields, it's valid
      if (!hasValidStructure(parsedData)) {
        Alert.alert("Error", MESSAGES.INVALID_PROOF_FORMAT);
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error("Error importing from file:", error);
      Alert.alert("Error", MESSAGES.IMPORT_ERROR);
      return null;
    }
  };

// Simple structure check - just verify expected fields exist
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
