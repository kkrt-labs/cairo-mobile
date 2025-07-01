import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, ScrollView, Alert } from "react-native";
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
import { SystemDropdown } from "../components/SystemDropdown";
import { FIBONACCI_MAX_INPUT, NumberInput } from "../components/NumberInput";
import { ActionButtons } from "../components/ActionButtons";
import { ResultsDisplay } from "../components/ResultsDisplay";

// Data and Utils
import {
  Systems,
  SystemPrograms,
  SystemConfigurations,
} from "../components/data/constants";

// Styles
import { colors } from "../components/styles/colors";
import { typography } from "../components/styles/typography";

// Hooks
import { useComputationMutations } from "../hooks/useComputationMutations";
import { useAppState } from "../hooks/useAppState";
import { useErrorHandling } from "../hooks/useErrorHandling";

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
  const {
    state,
    setState,
    getCurrentInputValue,
    setCurrentInputValue,
    getCurrentComputationResult,
    setCurrentComputationResult,
    handleProgramSelect,
    handleSystemSelect,
  } = useAppState();
  const mutations = useComputationMutations(
    state,
    setState,
    setCurrentComputationResult,
    getCurrentComputationResult,
    getCurrentInputValue,
  );
  const { errorMessage, hasError } = useErrorHandling(mutations);

  const { generateProofMutation, verifyProofMutation } = mutations;
  const currentComputationResult = getCurrentComputationResult();

  const currentSystemConfig = SystemConfigurations[state.selectedSystem];
  const currentSystemPrograms = SystemPrograms[state.selectedSystem];
  const currentProgramAvailable =
    currentSystemPrograms.find((p) => p.type === state.selectedProgram)
      ?.available ?? false;

  // Get the current system label for the header
  const currentSystemLabel =
    Systems.find((s) => s.type === state.selectedSystem)?.label || "Unknown";

  const handleGenerateProof = () => {
    if (
      state.selectedProgram === "fibonacci" &&
      state.selectedSystem === "cairo-m"
    ) {
      const numValue = parseInt(getCurrentInputValue(), 10);

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />

        {/* App Title */}
        <View style={styles.header}>
          <Text style={typography.appTitle}>{currentSystemLabel}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* System and Program Selection Section */}
          <View style={styles.inputSection}>
            {/* System Selection */}
            <SystemDropdown
              selectedSystem={state.selectedSystem}
              onSystemSelect={(system) => handleSystemSelect(system, mutations)}
              systems={Systems}
            />

            {/* Program Selection */}
            <ProgramDropdown
              selectedProgram={state.selectedProgram}
              onProgramSelect={(program) =>
                handleProgramSelect(program, mutations)
              }
              Programs={currentSystemPrograms}
            />

            {/* Number Input - Only show if system supports input and fibonacci is selected */}
            {currentSystemConfig.supportsInput &&
              state.selectedProgram === "fibonacci" &&
              currentProgramAvailable && (
                <NumberInput
                  value={getCurrentInputValue()}
                  onValueChange={(value) => setCurrentInputValue(value)}
                  placeholder={
                    currentSystemConfig.inputPlaceholder || "Enter input"
                  }
                />
              )}
          </View>

          {/* Action Buttons */}
          <ActionButtons
            onGenerateProof={handleGenerateProof}
            onVerifyProof={verifyProofMutation.mutate}
            isProofDisabled={
              !currentProgramAvailable ||
              generateProofMutation.isPending ||
              (currentSystemConfig.supportsInput &&
                !getCurrentInputValue().trim())
            }
            isVerifyDisabled={
              !currentComputationResult?.runProofResult ||
              verifyProofMutation.isPending
            }
          />

          {/* Error Display */}
          {hasError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Results - Only show if we have results and program is available */}
          {currentProgramAvailable && currentComputationResult && (
            <View style={styles.resultsSection}>
              <ResultsDisplay
                result={currentComputationResult}
                showProof={!!currentComputationResult.runProofResult}
                showVerification={!!currentComputationResult.verifyResult}
                systemType={state.selectedSystem}
              />
            </View>
          )}
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
