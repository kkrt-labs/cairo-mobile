import { UseMutationResult } from "@tanstack/react-query";

// Custom hook for error handling
export const useErrorHandling = (mutations: {
  runComputationMutation: UseMutationResult<any, Error, void, unknown>;
  generateProofMutation: UseMutationResult<any, Error, void, unknown>;
  verifyProofMutation: UseMutationResult<any, Error, void, unknown>;
}) => {
  const errorMessage =
    mutations.runComputationMutation.error?.message ||
    mutations.generateProofMutation.error?.message ||
    mutations.verifyProofMutation.error?.message ||
    null;

  const hasError = !!(
    mutations.runComputationMutation.error ||
    mutations.generateProofMutation.error ||
    mutations.verifyProofMutation.error
  );

  return { errorMessage, hasError };
};
