import { UseMutationResult } from "@tanstack/react-query";

// Custom hook for error handling
export const useErrorHandling = (mutations: {
  generateProofMutation: UseMutationResult<any, Error, void, unknown>;
  verifyProofMutation: UseMutationResult<any, Error, void, unknown>;
}) => {
  const errorMessage =
    mutations.generateProofMutation.error?.message ||
    mutations.verifyProofMutation.error?.message ||
    null;

  const hasError = !!(
    mutations.generateProofMutation.error || mutations.verifyProofMutation.error
  );

  return { errorMessage, hasError };
};
