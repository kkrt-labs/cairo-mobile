import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";

// Components
import { ProgramDropdown, Program } from "../components/ProgramDropdown";
import { NumberInput } from "../components/NumberInput";
import { ActionButtons } from "../components/ActionButtons";
import {
  ResultsDisplay,
  ComputationResult,
  RunResult,
} from "../components/ResultsDisplay";

// Data and Utils
import { Programs } from "../components/data/constants";
import CairoMBindings from "@modules/cairo-m-bindings";
import {
  generateFibonacciProof,
  verifyFibonacciProof,
} from "../components/utils/computation";

// Styles
import { colors } from "../components/styles/colors";
import { typography } from "../components/styles/typography";

// Constants
const fibCircuit = require("../assets/cairo-m/fib.json");

// Types
type MutationType = "run" | "proof" | "verify";

interface AppState {
  inputValue: string;
  selectedProgram: Program;
  lastMutation: MutationType | null;
  computationResult: ComputationResult | null;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Custom hook for managing computation mutations
const useComputationMutations = (
  state: AppState,
  setState: (updates: Partial<AppState>) => void,
) => {
  const runComputationMutation = useMutation({
    mutationFn: async (): Promise<RunResult> => {
      const numValue = parseInt(state.inputValue, 10);

      if (isNaN(numValue) || numValue <= 0) {
        throw new Error("Invalid input: Please enter a positive number");
      }

      if (state.selectedProgram === "fibonacci") {
        const runResult = await CairoMBindings.runProgram(
          JSON.stringify(fibCircuit),
        );
        return runResult;
      }

      throw new Error("Unsupported program type");
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

// Custom hook for managing app state
const useAppState = () => {
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

// Custom hook for error handling
const useErrorHandling = (mutations: {
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

function AppContent() {
  const { state, setState, handleProgramSelect } = useAppState();
  const mutations = useComputationMutations(state, setState);
  const { errorMessage, hasError } = useErrorHandling(mutations);

  const { runComputationMutation, generateProofMutation, verifyProofMutation } =
    mutations;

  const currentProgramAvailable =
    Programs.find((p) => p.type === state.selectedProgram)?.available ?? false;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />

        {/* App Title */}
        <View style={styles.header}>
          <Text style={typography.appTitle}>Cairo M</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Program Selection */}
          <ProgramDropdown
            selectedProgram={state.selectedProgram}
            onProgramSelect={(program) =>
              handleProgramSelect(program, mutations)
            }
            Programs={Programs}
          />

          {/* Number Input - Only show if fibonacci is selected and available */}
          {state.selectedProgram === "fibonacci" && currentProgramAvailable && (
            <NumberInput
              value={state.inputValue}
              onValueChange={(value) => setState({ inputValue: value })}
              placeholder="Enter fibonacci term"
            />
          )}

          {/* Action Buttons */}
          <ActionButtons
            onRun={runComputationMutation.mutate}
            onGenerateProof={generateProofMutation.mutate}
            onVerifyProof={verifyProofMutation.mutate}
            isRunDisabled={
              !currentProgramAvailable || runComputationMutation.isPending
            }
            isProofDisabled={
              !state.computationResult?.run || generateProofMutation.isPending
            }
            isVerifyDisabled={
              !state.computationResult?.proof || verifyProofMutation.isPending
            }
          />

          {/* Error Display */}
          {hasError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Results - Only show if we have results and program is available */}
          {currentProgramAvailable && state.computationResult && (
            <ResultsDisplay
              result={state.computationResult}
              showRun={!!state.computationResult.run}
              showProof={!!state.computationResult.proof}
              showVerification={!!state.computationResult.verification}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
    paddingBottom: 24,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "500",
  },
});
