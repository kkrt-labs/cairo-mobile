import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { typography } from "./styles/typography";
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
    <Text style={typography.resultLabel}>{label}</Text>
    <Text style={typography.resultValue}>{value}</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.accordionContainer}>
        {/* Proof Results */}
        {showProof && (
          <Accordion title="Proof Results" defaultExpanded={true}>
            <ResultItem
              label="Result"
              value={result.runProofResult.returnValues[0]}
            />
            <ResultItem
              label="Overall Frequency"
              value={formatFrequency(result.runProofResult.overallFrequency)}
            />
            <ResultItem
              label="Execution Frequency"
              value={formatFrequency(result.runProofResult.executionFrequency)}
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
    paddingVertical: 8,
  },
});
