import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { colors } from "./styles/colors";
import { Accordion } from "./Accordion";
import { formatFrequency, formatTime } from "./utils/computation";
import { ComputationResult } from "../hooks/types";

export interface BaseResultsDisplayProps {
  result: ComputationResult;
  showProof: boolean;
  showVerification: boolean;
}

export const ResultItem: React.FC<{
  label: string;
  value: string | number;
}> = ({ label, value }) => (
  <View style={styles.resultItem}>
    <Text style={styles.compactResultLabel}>{label}</Text>
    <Text style={styles.compactResultValue}>{value}</Text>
  </View>
);

export const JsonResultItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.resultItem}>
    <Text style={styles.compactResultLabel}>{label}</Text>
    <Text style={styles.jsonResultValue}>{value}</Text>
  </View>
);

export const formatProofSize = (sizeInBytes: number): string => {
  const sizeInKB = sizeInBytes / 1024;
  if (sizeInKB < 1) {
    return `${sizeInBytes} B`;
  }
  return `${sizeInKB.toFixed(2)} KB`;
};

export const formatSteps = (steps: number): string => {
  return steps.toLocaleString();
};

interface AccordionSectionProps {
  title: string;
  showSection: boolean;
  children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  showSection,
  children,
}) => {
  if (!showSection) return null;

  return (
    <Accordion title={title} defaultExpanded={true}>
      {children}
    </Accordion>
  );
};

export const BaseResultsContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <View style={styles.container}>
    <View style={styles.accordionContainer}>{children}</View>
  </View>
);

// Shared verification results component
export const VerificationResults: React.FC<{
  result: ComputationResult;
  showVerification: boolean;
}> = ({ result, showVerification }) => {
  if (!showVerification || !result.verifyResult) {
    return null;
  }

  return (
    <AccordionSection title="Verification Results" showSection={true}>
      <ResultItem
        label="Verification Duration"
        value={formatTime(result.verifyResult.verificationDuration)}
      />
    </AccordionSection>
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
