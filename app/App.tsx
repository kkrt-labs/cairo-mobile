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

// Components
import { ProgramDropdown, Program } from "../components/ProgramDropdown";
import { NumberInput } from "../components/NumberInput";
import { ActionButtons } from "../components/ActionButtons";
import {
  ResultsDisplay,
  ComputationResult,
} from "../components/ResultsDisplay";
import { ComingSoon } from "../components/ComingSoon";

// Data and Utils
// TODO: Remove once cairo-m native module is implemented
import { Programs } from "../components/data/constants";
import {
  getFibonacciRunResult,
  generateFibonacciProof,
  verifyFibonacciProof,
} from "../components/utils/computation";

// Styles
import { colors } from "../components/styles/colors";
import { typography } from "../components/styles/typography";

function AppContent() {
  const [computationResult, setComputationResult] =
    useState<ComputationResult | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Program>("fibonacci");

  // Progressive workflow states
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [hasProof, setHasProof] = useState<boolean>(false);
  const [hasVerification, setHasVerification] = useState<boolean>(false);

  const handleRunComputation = () => {
    // TODO: Update once cairo-m native module is implemented
    const numValue = parseInt(inputValue, 10);

    if (isNaN(numValue) || numValue <= 0) {
      // Handle invalid input - could show an error or use default
      return;
    }

    if (selectedProgram === "fibonacci") {
      const runResult = getFibonacciRunResult(numValue);
      setComputationResult({
        run: runResult,
        proof: undefined,
        verification: undefined,
      });
      setHasRun(true);
      setHasProof(false);
      setHasVerification(false);
    }
  };

  const handleGenerateProof = () => {
    if (computationResult?.run) {
      const proofResult = generateFibonacciProof(
        parseInt(inputValue, 10),
        computationResult.run.result,
      );
      setComputationResult((prev) =>
        prev
          ? {
              ...prev,
              proof: proofResult,
            }
          : null,
      );
      setHasProof(true);
      setHasVerification(false);
    }
  };

  const handleVerifyProof = () => {
    if (computationResult?.run) {
      const verificationResult = verifyFibonacciProof(
        computationResult.run.result,
      );
      setComputationResult((prev) =>
        prev
          ? {
              ...prev,
              verification: verificationResult,
            }
          : null,
      );
      setHasVerification(true);
    }
  };

  const currentProgramAvailable =
    Programs.find((p) => p.type === selectedProgram)?.available ?? false;

  // Update input when program changes
  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    setComputationResult(null); // Clear results when switching programs
    setHasRun(false);
    setHasProof(false);
    setHasVerification(false);

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
            isRunDisabled={!currentProgramAvailable}
            isProofDisabled={!hasRun}
            isVerifyDisabled={!hasProof}
          />

          {/* Results - Only show if we have results and program is available */}
          {currentProgramAvailable && computationResult && (
            <ResultsDisplay
              result={computationResult}
              showRun={hasRun}
              showProof={hasProof}
              showVerification={hasVerification}
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

  return <AppContent />;
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
});
