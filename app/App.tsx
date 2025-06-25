import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Components
import { ProgramDropdown, Program } from "../components/ProgramDropdown";
import { NumberInput } from "../components/NumberInput";
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

  const { generateProofMutation, verifyProofMutation } = mutations;

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
            onGenerateProof={generateProofMutation.mutate}
            onVerifyProof={verifyProofMutation.mutate}
            isProofDisabled={
              !currentProgramAvailable || generateProofMutation.isPending
            }
            isVerifyDisabled={
              !state.computationResult?.runProofResult ||
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
          {currentProgramAvailable && state.computationResult && (
            <ResultsDisplay
              result={state.computationResult}
              showProof={!!state.computationResult.runProofResult}
              showVerification={!!state.computationResult.verifyResult}
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
