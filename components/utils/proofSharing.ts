import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";
import { RunProofResult } from "../../modules/cairo-m-bindings/src/CairoMBindings.types";

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
      version: "1.0.0",
    },
  };
};

export const shareProofAsFile = async (
  sharedData: SharedProofData,
): Promise<void> => {
  try {
    const fileName = `cairo_proof_${sharedData.metadata.program}_${Date.now()}.cairoproof.json`;
    const content = JSON.stringify(sharedData, null, 2);

    // Create a temporary file
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, content);

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/json",
      dialogTitle: "Share Cairo Proof",
      UTI: "public.json",
    });

    // Clean up the temporary file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (error) {
    console.error("Error sharing proof:", error);
    Alert.alert("Error", "Failed to share proof. Please try again.");
  }
};

export const importProofFromFile =
  async (): Promise<SharedProofData | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const response = await fetch(result.assets[0].uri);
      const content = await response.text();
      const parsedData = JSON.parse(content);

      if (!isValidSharedProofData(parsedData)) {
        Alert.alert("Error", "Invalid proof data format in selected file.");
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error("Error importing from file:", error);
      Alert.alert(
        "Error",
        "Failed to import proof from file. Please check the file format.",
      );
      return null;
    }
  };

const isValidSharedProofData = (data: any): data is SharedProofData => {
  return (
    typeof data === "object" &&
    typeof data.proof === "string" &&
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
