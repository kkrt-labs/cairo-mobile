import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { colors } from "./styles/colors";

interface ActionButtonsProps {
  onRun: () => void;
  onGenerateProof: () => void;
  onVerifyProof: () => void;
  isRunDisabled: boolean;
  isProofDisabled: boolean;
  isVerifyDisabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRun,
  onGenerateProof,
  onVerifyProof,
  isRunDisabled,
  isProofDisabled,
  isVerifyDisabled,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          isRunDisabled && styles.primaryButtonDisabled,
          pressed && !isRunDisabled && styles.primaryButtonPressed,
        ]}
        onPress={onRun}
        disabled={isRunDisabled}
        android_ripple={
          !isRunDisabled ? { color: `${colors.background}4D` } : undefined
        }
      >
        <Text
          style={[
            styles.primaryButtonText,
            isRunDisabled && styles.primaryButtonTextDisabled,
          ]}
        >
          Run
        </Text>
      </Pressable>

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
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
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
});
