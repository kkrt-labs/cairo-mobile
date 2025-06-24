import { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { Program } from "../components/ProgramDropdown";
import { AppState, MutationType } from "./types";

// Custom hook for managing app state
export const useAppState = () => {
  const [state, setStateInternal] = useState<AppState>({
    inputValue: "",
    selectedProgram: "fibonacci",
    lastMutation: null,
    computationResult: null,
  });

  const setState = (updates: Partial<AppState>) => {
    setStateInternal((prev) => ({ ...prev, ...updates }));
  };

  const handleProgramSelect = (
    program: Program,
    mutations: {
      runComputationMutation: UseMutationResult<any, Error, void, unknown>;
      generateProofMutation: UseMutationResult<any, Error, void, unknown>;
      verifyProofMutation: UseMutationResult<any, Error, void, unknown>;
    },
  ) => {
    setState({
      selectedProgram: program,
      inputValue: program === "fibonacci" ? "" : state.inputValue,
      computationResult: null,
      lastMutation: null,
    });

    // Reset mutations when switching programs
    mutations.runComputationMutation.reset();
    mutations.generateProofMutation.reset();
    mutations.verifyProofMutation.reset();
  };

  return {
    state,
    setState,
    handleProgramSelect,
  };
};

// Re-export the types for convenience
export type { AppState, MutationType } from "./types";
