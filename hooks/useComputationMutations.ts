import { useMutation } from "@tanstack/react-query";
import CairoMBindings from "@modules/cairo-m-bindings";
import NoirProveKitModule from "@modules/noir-provekit";
import {
  AppState,
  UnifiedProofResult,
  UnifiedVerifyResult,
  convertCairoMResult,
  convertNoirResult,
  convertVerifyResult,
} from "./types";
import { SystemConfigurations } from "../components/data/constants";

// Import circuit data
const fibCircuit = require("../assets/cairo-m/fibonacci_loop.json");
const noirFibCircuit = require("../assets/noir/noir_fib.json");

// Custom hook for managing computation mutations
export const useComputationMutations = (
  state: AppState,
  setState: (updates: Partial<AppState>) => void,
) => {
  const generateProofMutation = useMutation({
    mutationFn: async (): Promise<UnifiedProofResult> => {
      const systemConfig = SystemConfigurations[state.selectedSystem];

      if (state.selectedProgram !== "fibonacci") {
        throw new Error("Unsupported program type");
      }

      if (state.selectedSystem === "cairo-m") {
        const numValue = parseInt(state.inputValue, 10);

        if (isNaN(numValue) || numValue <= 0) {
          throw new Error("Invalid input: Please enter a positive number");
        }

        const result = await CairoMBindings.runAndGenerateProof(
          JSON.stringify(fibCircuit),
          "fibonacci_loop",
          [numValue],
        );
        return convertCairoMResult(result);
      } else if (state.selectedSystem === "noir-provekit") {
        // Noir uses empty inputs for this circuit
        const result = await NoirProveKitModule.generateProof(
          JSON.stringify(noirFibCircuit),
          "{}",
        );
        return convertNoirResult(result);
      } else {
        throw new Error(`Unsupported system: ${state.selectedSystem}`);
      }
    },
    onSuccess: (data) => {
      setState({
        lastMutation: "generateProof",
        computationResult: {
          runProofResult: data,
          verifyResult: undefined,
        },
      });
    },
    onError: (error) => {
      console.error("Generate proof error:", error);
      setState({ computationResult: null });
    },
  });

  const verifyProofMutation = useMutation({
    mutationFn: async (): Promise<UnifiedVerifyResult> => {
      if (!state.computationResult?.runProofResult) {
        throw new Error("No computation result available for verification");
      }

      const proof = state.computationResult.runProofResult.proof;

      if (state.selectedSystem === "cairo-m") {
        const result = await CairoMBindings.verifyProof(proof);
        return convertVerifyResult(result);
      } else if (state.selectedSystem === "noir-provekit") {
        const result = await NoirProveKitModule.verifyProof(
          JSON.stringify(noirFibCircuit),
          proof,
        );
        return convertVerifyResult(result);
      } else {
        throw new Error(`Unsupported system: ${state.selectedSystem}`);
      }
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

  return {
    generateProofMutation,
    verifyProofMutation,
  };
};
