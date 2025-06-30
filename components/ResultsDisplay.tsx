import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { typography } from "./styles/typography";
import { colors } from "./styles/colors";
import { Accordion } from "./Accordion";
import { formatFrequency, formatTime } from "./utils/computation";
import { ComputationResult, SystemType } from "../hooks/types";

interface ResultsDisplayProps {
  result: ComputationResult;
  showProof: boolean;
  showVerification: boolean;
  systemType: SystemType;
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

const JsonResultItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.resultItem}>
    <Text style={styles.compactResultLabel}>{label}</Text>
    <Text style={styles.jsonResultValue}>{value}</Text>
  </View>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  showProof,
  showVerification,
  systemType,
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

  const isCairoM = systemType === "cairo-m";
  const isNoir = systemType === "noir-provekit";

  return (
    <View style={styles.container}>
      <View style={styles.accordionContainer}>
        {/* Global Results */}
        {showProof && (
          <Accordion title="Global Results" defaultExpanded={true}>
            {/* Show fibonacci value only for Cairo M */}
            {isCairoM && result.runProofResult.returnValues && (
              <ResultItem
                label="Fibonacci Value"
                value={result.runProofResult.returnValues[0]}
              />
            )}
            {/* Show return value for Noir */}
            {isNoir && result.runProofResult.returnValue && (
              <JsonResultItem
                label="Return Value"
                value={result.runProofResult.returnValue}
              />
            )}
            {/* Show steps for Cairo M */}
            {isCairoM && result.runProofResult.numSteps && (
              <ResultItem
                label="Number of Steps"
                value={formatSteps(result.runProofResult.numSteps)}
              />
            )}
            {/* Show constraint count for Noir */}
            {isNoir && result.runProofResult.constraintCount && (
              <ResultItem
                label="Constraint Count"
                value={formatSteps(result.runProofResult.constraintCount)}
              />
            )}
            <ResultItem
              label={
                isCairoM ? "Execution + Proof Duration" : "Overall Duration"
              }
              value={formatTime(result.runProofResult.overallDuration)}
            />
            {result.runProofResult.overallFrequency && (
              <ResultItem
                label={
                  isCairoM ? "Execution + Proof Frequency" : "Overall Frequency"
                }
                value={formatFrequency(result.runProofResult.overallFrequency)}
              />
            )}
          </Accordion>
        )}

        {/* Execution Results (Cairo M) / Witness Generation (Noir) */}
        {showProof && (
          <Accordion
            title={
              isCairoM ? "Execution Results" : "Witness Generation Results"
            }
            defaultExpanded={true}
          >
            {isCairoM && result.runProofResult.executionDuration && (
              <>
                <ResultItem
                  label="Execution Duration"
                  value={formatTime(result.runProofResult.executionDuration)}
                />
                <ResultItem
                  label="Execution Frequency"
                  value={formatFrequency(
                    result.runProofResult.executionFrequency!,
                  )}
                />
              </>
            )}
            {isNoir && result.runProofResult.witnessGenerationDuration && (
              <>
                <ResultItem
                  label="Witness Generation Duration"
                  value={formatTime(
                    result.runProofResult.witnessGenerationDuration,
                  )}
                />
                {result.runProofResult.witnessGenerationFrequency && (
                  <ResultItem
                    label="Witness Generation Frequency"
                    value={formatFrequency(
                      result.runProofResult.witnessGenerationFrequency,
                    )}
                  />
                )}
              </>
            )}
          </Accordion>
        )}

        {/* Proving Results */}
        {showProof && (
          <Accordion title="Proving Results" defaultExpanded={true}>
            {isCairoM && result.runProofResult.proofDuration && (
              <>
                <ResultItem
                  label="Proof Duration"
                  value={formatTime(result.runProofResult.proofDuration)}
                />
                <ResultItem
                  label="Proof Frequency"
                  value={formatFrequency(result.runProofResult.proofFrequency!)}
                />
              </>
            )}
            {isNoir && result.runProofResult.proofGenerationDuration && (
              <>
                <ResultItem
                  label="Proof Generation Duration"
                  value={formatTime(
                    result.runProofResult.proofGenerationDuration,
                  )}
                />
                {result.runProofResult.proofGenerationFrequency && (
                  <ResultItem
                    label="Proof Generation Frequency"
                    value={formatFrequency(
                      result.runProofResult.proofGenerationFrequency,
                    )}
                  />
                )}
              </>
            )}
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
              label="Verification Duration"
              value={formatTime(result.verifyResult.verificationDuration)}
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
    paddingVertical: 4,
  },
  compactResultLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.onBackground,
    fontFamily: "Inter_400Regular",
    opacity: 0.8,
    letterSpacing: 0.1,
  },
  compactResultValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  jsonResultValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondary,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
    flexShrink: 1,
    maxWidth: 200,
  },
});
