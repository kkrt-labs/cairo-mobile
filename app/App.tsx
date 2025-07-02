import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import * as Font from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Components
import { ProgramDropdown, Program } from "../components/ProgramDropdown";
import { FIBONACCI_MAX_INPUT, NumberInput } from "../components/NumberInput";
import { ActionButtons } from "../components/ActionButtons";
import { ResultsDisplay } from "../components/ResultsDisplay";

// Data and Utils
import { Programs } from "../components/data/constants";

// Styles
import { colors } from "../components/styles/colors";
import { typography } from "../components/styles/typography";

// Hooks
import { useComputationMutations } from "../hooks/useComputationMutations";
import { useAppState } from "../hooks/useAppState";
import { useErrorHandling } from "../hooks/useErrorHandling";
import { useFileHandling } from "../hooks/useFileHandling";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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

function AppContent() {
  const { state, setState, handleProgramSelect } = useAppState();
  const mutations = useComputationMutations(state, setState);
  const { errorMessage, hasError } = useErrorHandling(mutations);
  const { incomingProofData, clearIncomingData, isProcessingFile } =
    useFileHandling();

  const { generateProofMutation, verifyProofMutation, importProofMutation } =
    mutations;

  // Handle incoming file data
  useEffect(() => {
    try {
      if (incomingProofData && !importProofMutation.isPending) {
        // Process the incoming proof data
        const runProofResult = {
          returnValues: incomingProofData.metadata.returnValues,
          numSteps: incomingProofData.metadata.numSteps,
          overallDuration: 0,
          executionDuration: 0,
          proofDuration: 0,
          overallFrequency: 0,
          executionFrequency: 0,
          proofFrequency: 0,
          proofSize: incomingProofData.metadata.proofSize,
          proof: incomingProofData.proof,
        };

        setState({
          lastMutation: "importProof",
          selectedProgram: incomingProofData.metadata.program as any,
          inputValue: "", // Reset input value when importing via file association
          computationResult: {
            runProofResult,
            verifyResult: undefined,
            isImported: true,
            sharedData: incomingProofData,
          },
        });

        // Clear the incoming data so it doesn't process again
        clearIncomingData();
      }
    } catch (error) {
      console.error("Error processing incoming proof data:", error);
      Alert.alert(
        "Error",
        "Failed to process the imported proof data. Please try importing again.",
      );
      clearIncomingData(); // Clear the problematic data
    }
  }, [
    incomingProofData,
    clearIncomingData,
    setState,
    importProofMutation.isPending,
  ]);

  const currentProgramAvailable =
    Programs.find((p) => p.type === state.selectedProgram)?.available ?? false;

  const handleGenerateProof = () => {
    // Dismiss keyboard before generating proof
    Keyboard.dismiss();

    if (state.selectedProgram === "fibonacci") {
      const numValue = parseInt(state.inputValue, 10);

      if (numValue > FIBONACCI_MAX_INPUT) {
        Alert.alert(
          "Input Limit Exceeded",
          `Program execution capped at 2^20 steps.

Please use an input inferior to ${FIBONACCI_MAX_INPUT}.`,
          [{ text: "OK" }],
        );
        return; // Don't proceed with proof generation
      }
    }

    generateProofMutation.mutate();
  };

  const handleVerifyProof = () => {
    // Dismiss keyboard before verifying proof
    Keyboard.dismiss();
    verifyProofMutation.mutate();
  };

  const handleImportProof = () => {
    // Dismiss keyboard before importing proof
    Keyboard.dismiss();
    importProofMutation.mutate();
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
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerContent}>
              {/* Program Selection and Input Section */}
              <View style={styles.inputSection}>
                {/* Program Selection */}
                <ProgramDropdown
                  selectedProgram={state.selectedProgram}
                  onProgramSelect={(program) =>
                    handleProgramSelect(program, mutations)
                  }
                  Programs={Programs}
                />

                {/* Number Input - Only show if fibonacci is selected and available */}
                {state.selectedProgram === "fibonacci" &&
                  currentProgramAvailable && (
                    <NumberInput
                      value={state.inputValue}
                      onValueChange={(value) => setState({ inputValue: value })}
                      placeholder="Enter fibonacci term"
                    />
                  )}
              </View>

              {/* Action Buttons */}
              <ActionButtons
                onGenerateProof={handleGenerateProof}
                onVerifyProof={handleVerifyProof}
                onImportProof={handleImportProof}
                isProofDisabled={
                  !currentProgramAvailable || generateProofMutation.isPending
                }
                isVerifyDisabled={
                  !state.computationResult?.runProofResult ||
                  verifyProofMutation.isPending
                }
                isImportDisabled={importProofMutation.isPending}
                proofResult={state.computationResult?.runProofResult}
                selectedProgram={state.selectedProgram}
                inputValue={state.inputValue}
              />

              {/* File Processing Indicator */}
              {isProcessingFile && (
                <View style={styles.processingContainer}>
                  <Text style={styles.processingText}>
                    📁 Loading proof from file...
                  </Text>
                </View>
              )}

              {/* Error Display */}
              {hasError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Results - Only show if we have results and program is available */}
              {currentProgramAvailable && state.computationResult && (
                <View style={styles.resultsSection}>
                  <ResultsDisplay
                    result={state.computationResult}
                    showProof={!!state.computationResult.runProofResult}
                    showVerification={!!state.computationResult.verifyResult}
                  />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppContent />
      </View>
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
    gap: 16,
    paddingBottom: 24,
  },
  innerContent: {
    gap: 16,
  },
  processingContainer: {
    backgroundColor: `${colors.primary}20`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    marginTop: 16,
  },
  processingText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 20,
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
  inputSection: {
    gap: 12,
  },
  resultsSection: {
    marginTop: -8,
  },
});
