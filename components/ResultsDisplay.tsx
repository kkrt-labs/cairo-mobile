import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { typography } from "./styles/typography";
import { colors } from "./styles/colors";
import { Accordion } from "./Accordion";
import { formatFrequency, formatTime } from "./utils/computation";
import {
  RunProofResult,
  VerifyResult,
} from "../modules/cairo-m-bindings/src/CairoMBindings.types";

export interface ComputationResult {
  runProofResult: RunProofResult;
  verifyResult?: VerifyResult;
}

interface ResultsDisplayProps {
  result: ComputationResult;
  showProof: boolean;
  showVerification: boolean;
}

const ResultItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <View style={styles.resultItem}>
    <Text style={styles.compactResultLabel}>{label}</Text>
    <Text style={styles.compactResultValue}>{value}</Text>
  </View>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  showProof,
  showVerification,
}) => {
  const formatProofSize = (sizeInBytes: number): string => {
    const sizeInKB = sizeInBytes / 1024;
    if (sizeInKB < 1) {
      return `${sizeInBytes} B`;
    }
    return `${sizeInKB.toFixed(2)} KB`;
  };

  const formatSteps = (steps: number): string => {
    return steps.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.accordionContainer}>
        {/* Overall Results */}
        {showProof && (
          <Accordion title="Overall Results" defaultExpanded={true}>
            <ResultItem
              label="Result"
              value={result.runProofResult.returnValues[0]}
            />
            <ResultItem
              label="Number of Steps"
              value={formatSteps(result.runProofResult.numSteps)}
            />
            <ResultItem
              label="Overall Duration"
              value={formatTime(result.runProofResult.overallDuration)}
            />
            <ResultItem
              label="Overall Frequency"
              value={formatFrequency(result.runProofResult.overallFrequency)}
            />
          </Accordion>
        )}

        {/* Execution Results */}
        {showProof && (
          <Accordion title="Execution Results" defaultExpanded={true}>
            <ResultItem
              label="Execution Duration"
              value={formatTime(result.runProofResult.executionDuration)}
            />
            <ResultItem
              label="Execution Frequency"
              value={formatFrequency(result.runProofResult.executionFrequency)}
            />
          </Accordion>
        )}

        {/* Proving Results */}
        {showProof && (
          <Accordion title="Proving Results" defaultExpanded={true}>
            <ResultItem
              label="Proof Duration"
              value={formatTime(result.runProofResult.proofDuration)}
            />
            <ResultItem
              label="Proof Frequency"
              value={formatFrequency(result.runProofResult.proofFrequency)}
            />
            <ResultItem
              label="Proof Size"
              value={formatProofSize(result.runProofResult.proofSize)}
            />
          </Accordion>
        )}

        {/* Verification Results */}
        {showVerification && result.verifyResult && (
          <Accordion title="Verification Results" defaultExpanded={true}>
            <ResultItem
              label="Verification Time"
              value={formatTime(result.verifyResult.verificationTime)}
            />
          </Accordion>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accordionContainer: {
    gap: 0, // Remove gap between accordions
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingVertical: 4, // Reduced from 8 to 4
  },
  compactResultLabel: {
    fontSize: 14, // Reduced from 16
    fontWeight: "400",
    color: colors.onBackground,
    fontFamily: "Inter_400Regular",
    opacity: 0.8,
    letterSpacing: 0.1,
  },
  compactResultValue: {
    fontSize: 18, // Reduced from 24
    fontWeight: "700",
    color: colors.secondary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
});
