import { useMutation } from "@tanstack/react-query";
import CairoMBindings from "@modules/cairo-m-bindings";
import { RunProofResult } from "../modules/cairo-m-bindings/src/CairoMBindings.types";
import { verifyFibonacciProof } from "../components/utils/computation";
import { AppState } from "./types";

// Constants
const fibCircuit = require("../assets/cairo-m/fib.json");

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
      );
      return result;
    },
    onSuccess: (data) => {
      setState({
        lastMutation: "generateProof",
        computationResult: {
          runAndProof: data,
          verification: undefined,
        },
      });
    },
    onError: (error) => {
      console.error("Generate proof error:", error);
      setState({ computationResult: null });
    },
  });

  const verifyProofMutation = useMutation({
    mutationFn: async () => {
      if (!state.computationResult?.runAndProof) {
        throw new Error("No computation result available for verification");
      }

      return verifyFibonacciProof(
        state.computationResult.runAndProof.returnValue,
      );
    },
    onSuccess: (data) => {
      setState({
        lastMutation: "verify",
        computationResult: state.computationResult
          ? { ...state.computationResult, verification: data }
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
