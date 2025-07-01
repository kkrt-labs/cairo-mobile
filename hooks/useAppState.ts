import { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { Program } from "../components/ProgramDropdown";
import { AppState, MutationType, SystemType, ComputationResult } from "./types";

// Custom hook for managing app state
export const useAppState = () => {
  const [state, setStateInternal] = useState<AppState>({
    selectedProgram: "fibonacci",
    selectedSystem: "cairo-m",
    lastMutation: null,
    inputValues: {
      "cairo-m": "",
      "noir-provekit": "",
    },
    computationResults: {
      "cairo-m": {},
      "noir-provekit": {},
    },
  });

  const setState = (updates: Partial<AppState>) => {
    setStateInternal((prev) => ({ ...prev, ...updates }));
  };

  // Helper function to get current input value
  const getCurrentInputValue = (): string => {
    return state.inputValues[state.selectedSystem];
  };

  // Helper function to set input value for current system
  const setCurrentInputValue = (value: string) => {
    setStateInternal((prev) => ({
      ...prev,
      inputValues: {
        ...prev.inputValues,
        [prev.selectedSystem]: value,
      },
    }));
  };

  // Helper function to get current computation result
  const getCurrentComputationResult = (): ComputationResult | null => {
    return (
      state.computationResults[state.selectedSystem][state.selectedProgram] ||
      null
    );
  };

  // Helper function to set computation result for current system/program
  const setCurrentComputationResult = (result: ComputationResult | null) => {
    setStateInternal((prev) => ({
      ...prev,
      computationResults: {
        ...prev.computationResults,
        [prev.selectedSystem]: {
          ...prev.computationResults[prev.selectedSystem],
          [prev.selectedProgram]: result || undefined,
        },
      },
    }));
  };

  const handleProgramSelect = (
    program: Program,
    mutations: {
      generateProofMutation: UseMutationResult<any, Error, void, unknown>;
      verifyProofMutation: UseMutationResult<any, Error, void, unknown>;
    },
  ) => {
    // Clear input value only for fibonacci program when switching
    if (program === "fibonacci") {
      setCurrentInputValue("");
    }

    setState({
      selectedProgram: program,
      lastMutation: null,
    });

    // Reset mutations when switching programs
    mutations.generateProofMutation.reset();
    mutations.verifyProofMutation.reset();
  };

  const handleSystemSelect = (
    system: SystemType,
    mutations: {
      generateProofMutation: UseMutationResult<any, Error, void, unknown>;
      verifyProofMutation: UseMutationResult<any, Error, void, unknown>;
    },
  ) => {
    setState({
      selectedSystem: system,
      lastMutation: null,
    });

    // Reset mutations when switching systems
    mutations.generateProofMutation.reset();
    mutations.verifyProofMutation.reset();
  };

  return {
    state,
    setState,
    getCurrentInputValue,
    setCurrentInputValue,
    getCurrentComputationResult,
    setCurrentComputationResult,
    handleProgramSelect,
    handleSystemSelect,
  };
};

// Re-export the types for convenience
export type { AppState, MutationType } from "./types";
