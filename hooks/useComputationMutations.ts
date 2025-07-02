import { useMutation } from "@tanstack/react-query";
import CairoMBindings from "@modules/cairo-m-bindings";
import {
  RunProofResult,
  VerifyResult,
} from "../modules/cairo-m-bindings/src/CairoMBindings.types";
import { AppState } from "./types";
import {
  SharedProofData,
  importProofFromFile,
} from "../components/utils/proofSharing";

// Constants
const fibCircuit = require("../assets/cairo-m/fibonacci_loop.json");

// Custom hook for managing computation mutations
export const useComputationMutations = (
  state: AppState,
  setState: (updates: Partial<AppState>) => void,
) => {
  const generateProofMutation = useMutation({
    mutationFn: async (): Promise<RunProofResult> => {
      const numValue = parseInt(state.inputValue, 10);

      if (isNaN(numValue) || numValue <= 0) {
        throw new Error("Invalid input: Please enter a positive number");
      }

      if (state.selectedProgram !== "fibonacci") {
        throw new Error("Unsupported program type");
      }

      const result = await CairoMBindings.runAndGenerateProof(
        JSON.stringify(fibCircuit),
        "fibonacci_loop",
        [numValue],
      );
      return result;
    },
    onSuccess: (data) => {
      setState({
        lastMutation: "generateProof",
        computationResult: {
          runProofResult: data,
          verifyResult: undefined,
          isImported: false,
        },
      });
    },
    onError: (error) => {
      console.error("Generate proof error:", error);
      setState({ computationResult: null });
    },
  });

  const verifyProofMutation = useMutation({
    mutationFn: async (): Promise<VerifyResult> => {
      if (!state.computationResult?.runProofResult) {
        throw new Error("No computation result available for verification");
      }

      const proof = state.computationResult.runProofResult.proof;
      return CairoMBindings.verifyProof(proof);
    },
    onSuccess: (data) => {
      setState({
        lastMutation: "verify",
        computationResult: state.computationResult
          ? { ...state.computationResult, verifyResult: data }
          : null,
      });
    },
    onError: (error) => {
      console.error("Verify proof error:", error);
    },
  });

  const importProofMutation = useMutation({
    mutationFn: async (): Promise<SharedProofData> => {
      const sharedData = await importProofFromFile();

      if (!sharedData) {
        throw new Error("Failed to import proof");
      }

      return sharedData;
    },
    onSuccess: (sharedData) => {
      // Create a RunProofResult from the shared data
      const runProofResult: RunProofResult = {
        returnValues: sharedData.metadata.returnValues,
        numSteps: sharedData.metadata.numSteps,
        overallDuration: 0, // Not available from shared data
        executionDuration: 0,
        proofDuration: 0,
        overallFrequency: 0,
        executionFrequency: 0,
        proofFrequency: 0,
        proofSize: sharedData.metadata.proofSize,
        proof: sharedData.proof,
      };

      setState({
        lastMutation: "importProof",
        selectedProgram: sharedData.metadata.program as any,
        inputValue: "", // Reset input value when importing
        computationResult: {
          runProofResult,
          verifyResult: undefined,
          isImported: true,
          sharedData,
        },
      });
    },
    onError: (error) => {
      console.error("Import proof error:", error);
    },
  });

  return {
    generateProofMutation,
    verifyProofMutation,
    importProofMutation,
  };
};
