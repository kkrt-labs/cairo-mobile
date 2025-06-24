import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { typography } from "./styles/typography";
import { Accordion } from "./Accordion";
import { formatFrequency } from "./utils/computation";
import { RunProofResult } from "../modules/cairo-m-bindings/src/CairoMBindings.types";

export interface VerificationResult {
  result: number;
  verificationTime: string;
}

export interface ComputationResult {
  runAndProof: RunProofResult;
  verification?: VerificationResult;
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
            <ResultItem label="Result" value={result.runAndProof.returnValue} />
            <ResultItem
              label="Overall Frequency"
              value={formatFrequency(result.runAndProof.overallFrequency)}
            />
            <ResultItem
              label="Execution Frequency"
              value={formatFrequency(result.runAndProof.executionFrequency)}
            />
            <ResultItem
              label="Proof Frequency"
              value={formatFrequency(result.runAndProof.proofFrequency)}
            />
            <ResultItem
              label="Proof Size"
              value={formatProofSize(result.runAndProof.proofSize)}
            />
          </Accordion>
        )}

        {/* Verification Results */}
        {showVerification && result.verification && (
          <Accordion title="Verification Results" defaultExpanded={true}>
            <ResultItem label="Result" value={result.verification.result} />
            <ResultItem
              label="Verification Time"
              value={result.verification.verificationTime}
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
