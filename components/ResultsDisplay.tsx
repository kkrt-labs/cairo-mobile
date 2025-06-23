import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { typography } from "./styles/typography";
import { Accordion } from "./Accordion";

export interface RunResult {
  returnValue: number;
  frequency: number;
}

export interface ProofResult {
  proofSize: string; // in KB
  provingTime: string;
}

export interface VerificationResult {
  result: number;
  verificationTime: string;
}

export interface ComputationResult {
  run: RunResult;
  proof?: ProofResult;
  verification?: VerificationResult;
}

interface ResultsDisplayProps {
  result: ComputationResult;
  showRun: boolean;
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
  showRun,
  showProof,
  showVerification,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.accordionContainer}>
        {/* Run Results */}
        {showRun && (
          <Accordion title="Run Results" defaultExpanded={true}>
            <ResultItem label="Result" value={result.run.returnValue} />
            <ResultItem label="Frequency" value={result.run.frequency} />
          </Accordion>
        )}

        {/* Proof Results */}
        {showProof && result.proof && (
          <Accordion title="Proof Results" defaultExpanded={true}>
            <ResultItem label="Proof Size" value={result.proof.proofSize} />
            <ResultItem label="Proving Time" value={result.proof.provingTime} />
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
