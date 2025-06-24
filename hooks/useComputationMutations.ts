import { useMutation } from "@tanstack/react-query";
import CairoMBindings from "@modules/cairo-m-bindings";
import { RunResult } from "../components/ResultsDisplay";
import {
  generateFibonacciProof,
  verifyFibonacciProof,
} from "../components/utils/computation";
import { AppState } from "./types";

// Constants
const fibCircuit = require("../assets/cairo-m/fib.json");

// Custom hook for managing computation mutations
export const useComputationMutations = (
  state: AppState,
  setState: (updates: Partial<AppState>) => void,
) => {
  const runComputationMutation = useMutation({
    mutationFn: async (): Promise<RunResult> => {
      const numValue = parseInt(state.inputValue, 10);

      if (isNaN(numValue) || numValue <= 0) {
        throw new Error("Invalid input: Please enter a positive number");
      }

      if (state.selectedProgram !== "fibonacci") {
        throw new Error("Unsupported program type");
      }

      const runResult = await CairoMBindings.runProgram(
        JSON.stringify(fibCircuit),
      );
      return runResult;
    },
    onSuccess: (data) => {
      setState({
        lastMutation: "run",
        computationResult: {
          run: data,
          proof: undefined,
          verification: undefined,
        },
      });
    },
    onError: (error) => {
      console.error("Run computation error:", error);
      setState({ computationResult: null });
    },
  });

  const generateProofMutation = useMutation({
    mutationFn: async () => {
      if (!state.computationResult?.run) {
        throw new Error("No computation result available for proof generation");
      }

      const numValue = parseInt(state.inputValue, 10);
      return generateFibonacciProof(
        numValue,
        state.computationResult.run.returnValue,
      );
    },
    onSuccess: (data) => {
      setState({
        lastMutation: "proof",
        computationResult: state.computationResult
          ? { ...state.computationResult, proof: data }
          : null,
      });
    },
    onError: (error) => {
      console.error("Generate proof error:", error);
    },
  });

  const verifyProofMutation = useMutation({
    mutationFn: async () => {
      if (!state.computationResult?.run) {
        throw new Error("No computation result available for verification");
      }

      return verifyFibonacciProof(state.computationResult.run.returnValue);
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
    runComputationMutation,
    generateProofMutation,
    verifyProofMutation,
  };
};
