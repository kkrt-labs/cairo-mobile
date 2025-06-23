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
} from "@tanstack/react-query";

// Components
import { ProgramDropdown, Program } from "../components/ProgramDropdown";
import { NumberInput } from "../components/NumberInput";
import { ActionButtons } from "../components/ActionButtons";
import {
  ResultsDisplay,
  ComputationResult,
} from "../components/ResultsDisplay";

// Data and Utils
import { Programs } from "../components/data/constants";

import CairoMBindings from "@modules/cairo-m-bindings";

const fibCircuit = require("../assets/cairo-m/fib.json");

// TODO: Remove once cairo-m native module is implemented
import {
  generateFibonacciProof,
  verifyFibonacciProof,
} from "../components/utils/computation";

// Styles
import { colors } from "../components/styles/colors";
import { typography } from "../components/styles/typography";

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

type MutationType = "run" | "proof" | "verify";

function AppContent() {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Program>("fibonacci");
  const [lastMutation, setLastMutation] = useState<MutationType | null>(null);
  const [computationResult, setComputationResult] =
    useState<ComputationResult | null>(null);

  // Mutation for running computation
  const runComputationMutation = useMutation({
    mutationFn: async () => {
      const numValue = parseInt(inputValue, 10);

      if (isNaN(numValue) || numValue <= 0) {
        throw new Error("Invalid input: Please enter a positive number");
      }

      if (selectedProgram === "fibonacci") {
        const runResult = await CairoMBindings.runProgram(
          JSON.stringify(fibCircuit),
        );
        return runResult;
      }

      throw new Error("Unsupported program type");
    },
    onSuccess: (data) => {
      setLastMutation("run");
      setComputationResult({
        run: data,
        proof: undefined,
        verification: undefined,
      });
    },
    onError: (error) => {
      console.error("Run computation error:", error);
      setComputationResult(null);
    },
  });

  // Mutation for generating proof
  const generateProofMutation = useMutation({
    mutationFn: async () => {
      if (!computationResult?.run) {
        throw new Error("No computation result available for proof generation");
      }

      const numValue = parseInt(inputValue, 10);
      return generateFibonacciProof(
        numValue,
        computationResult.run.returnValue,
      );
    },
    onSuccess: (data) => {
      setLastMutation("proof");
      setComputationResult((prev) => (prev ? { ...prev, proof: data } : null));
    },
    onError: (error) => {
      console.error("Generate proof error:", error);
    },
  });

  // Mutation for verifying proof
  const verifyProofMutation = useMutation({
    mutationFn: async () => {
      if (!computationResult?.run) {
        throw new Error("No computation result available for verification");
      }

      return verifyFibonacciProof(computationResult.run.returnValue);
    },
    onSuccess: (data) => {
      setLastMutation("verify");
      setComputationResult((prev) =>
        prev ? { ...prev, verification: data } : null,
      );
    },
    onError: (error) => {
      console.error("Verify proof error:", error);
    },
  });

  const handleRunComputation = () => {
    runComputationMutation.mutate();
  };

  const handleGenerateProof = () => {
    generateProofMutation.mutate();
  };

  const handleVerifyProof = () => {
    verifyProofMutation.mutate();
  };

  const currentProgramAvailable =
    Programs.find((p) => p.type === selectedProgram)?.available ?? false;

  // Update input when program changes
  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    setComputationResult(null); // Clear results when switching programs
    setLastMutation(null); // Clear last mutation state

    // Reset mutations when switching programs
    runComputationMutation.reset();
    generateProofMutation.reset();
    verifyProofMutation.reset();

    // Reset to default value when switching programs
    if (program === "fibonacci") {
      setInputValue("");
    }
  };

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
            selectedProgram={selectedProgram}
            onProgramSelect={handleProgramSelect}
            Programs={Programs}
          />

          {/* Number Input - Only show if fibonacci is selected and available */}
          {selectedProgram === "fibonacci" && currentProgramAvailable && (
            <NumberInput
              value={inputValue}
              onValueChange={setInputValue}
              placeholder="Enter fibonacci term"
            />
          )}

          {/* Action Buttons */}
          <ActionButtons
            onRun={handleRunComputation}
            onGenerateProof={handleGenerateProof}
            onVerifyProof={handleVerifyProof}
            isRunDisabled={
              !currentProgramAvailable || runComputationMutation.isPending
            }
            isProofDisabled={
              !computationResult?.run || generateProofMutation.isPending
            }
            isVerifyDisabled={
              !computationResult?.proof || verifyProofMutation.isPending
            }
          />

          {/* Error Display */}
          {(runComputationMutation.error ||
            generateProofMutation.error ||
            verifyProofMutation.error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {runComputationMutation.error?.message ||
                  generateProofMutation.error?.message ||
                  verifyProofMutation.error?.message}
              </Text>
            </View>
          )}

          {/* Results - Only show if we have results and program is available */}
          {currentProgramAvailable && computationResult && (
            <ResultsDisplay
              result={computationResult}
              showRun={!!computationResult.run}
              showProof={!!computationResult.proof}
              showVerification={!!computationResult.verification}
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
    paddingBottom: 24, // Add bottom padding for better scrolling
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
