import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { colors } from "./styles/colors";
import { shareProofAsFile, createSharedProofData } from "./utils/proofSharing";
import { RunProofResult } from "../modules/cairo-m-bindings/src/CairoMBindings.types";

interface ActionButtonsProps {
  onGenerateProof: () => void;
  onVerifyProof: () => void;
  onImportProof: () => void;
  isProofDisabled: boolean;
  isVerifyDisabled: boolean;
  isImportDisabled: boolean;
  // Add proof data for sharing
  proofResult?: RunProofResult;
  selectedProgram: string;
  inputValue: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onGenerateProof,
  onVerifyProof,
  onImportProof,
  isProofDisabled,
  isVerifyDisabled,
  isImportDisabled,
  proofResult,
  selectedProgram,
  inputValue,
}) => {
  const handleShareAsFile = async () => {
    if (!proofResult) return;

    const input =
      selectedProgram === "fibonacci" ? [parseInt(inputValue, 10)] : [];
    const sharedData = createSharedProofData(
      proofResult,
      selectedProgram,
      input,
    );
    await shareProofAsFile(sharedData);
  };

  const isShareDisabled = !proofResult;

  return (
    <View style={styles.container}>
      {/* Primary Actions */}
      <View style={styles.primaryActions}>
        <Pressable
          style={({ pressed }) => [
            isProofDisabled ? styles.disabledButton : styles.primaryButton,
            isProofDisabled && styles.primaryButtonDisabled,
            pressed && !isProofDisabled && styles.primaryButtonPressed,
          ]}
          onPress={onGenerateProof}
          disabled={isProofDisabled}
          android_ripple={
            !isProofDisabled ? { color: `${colors.background}4D` } : undefined
          }
        >
          <Text
            style={[
              isProofDisabled
                ? styles.disabledButtonText
                : styles.primaryButtonText,
            ]}
          >
            Generate Proof
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            isVerifyDisabled ? styles.disabledButton : styles.primaryButton,
            isVerifyDisabled && styles.primaryButtonDisabled,
            pressed && !isVerifyDisabled && styles.primaryButtonPressed,
          ]}
          onPress={onVerifyProof}
          disabled={isVerifyDisabled}
          android_ripple={
            !isVerifyDisabled ? { color: `${colors.background}4D` } : undefined
          }
        >
          <Text
            style={[
              isVerifyDisabled
                ? styles.disabledButtonText
                : styles.primaryButtonText,
            ]}
          >
            Verify Proof
          </Text>
        </Pressable>
      </View>

      {/* Secondary Actions - Side by side */}
      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            isShareDisabled
              ? styles.disabledSecondaryButton
              : styles.secondaryButton,
            pressed && !isShareDisabled && styles.secondaryButtonPressed,
          ]}
          onPress={handleShareAsFile}
          disabled={isShareDisabled}
        >
          <Text
            style={[
              isShareDisabled
                ? styles.disabledSecondaryButtonText
                : styles.secondaryButtonText,
            ]}
          >
            Share Proof
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            isImportDisabled
              ? styles.disabledSecondaryButton
              : styles.secondaryButton,
            pressed && !isImportDisabled && styles.secondaryButtonPressed,
          ]}
          onPress={onImportProof}
          disabled={isImportDisabled}
        >
          <Text
            style={[
              isImportDisabled
                ? styles.disabledSecondaryButtonText
                : styles.secondaryButtonText,
            ]}
          >
            Import Proof
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  primaryActions: {
    gap: 12,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  primaryButtonTextDisabled: {
    color: colors.surface,
    opacity: 0.8,
  },
  disabledButton: {
    backgroundColor: colors.surfaceDisabled,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderDisabled,
  },
  disabledButtonText: {
    color: colors.onBackground,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.primary,
    flex: 1,
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.background,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  disabledSecondaryButton: {
    backgroundColor: colors.surfaceDisabled,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.borderDisabled,
    flex: 1,
  },
  disabledSecondaryButtonText: {
    color: colors.onBackground,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
    opacity: 0.6,
  },
});
