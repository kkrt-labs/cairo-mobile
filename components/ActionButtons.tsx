import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Easing,
} from "react-native";
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
  // Loading states
  isGenerating: boolean;
  isVerifying: boolean;
  isImporting: boolean;
  // Add proof data for sharing
  proofResult?: RunProofResult;
  selectedProgram: string;
  inputValue: string;
}

interface LoadingButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
  title: string;
  loadingTitle: string;
  isPrimary?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onPress,
  disabled,
  isLoading,
  title,
  loadingTitle,
  isPrimary = true,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setElapsedTime(0);

      // Start progress animation (indeterminate)
      const progressLoop = () => {
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start(() => {
          if (isLoading) progressLoop();
        });
      };
      progressLoop();

      // Timer
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);
    } else {
      progressAnim.setValue(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, progressAnim]);

  const formatTime = (seconds: number): string => {
    return `${seconds.toFixed(1)}s`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Use consistent styling whether loading or not
  const buttonStyle = isPrimary ? styles.primaryButton : styles.secondaryButton;
  const textStyle = isPrimary
    ? styles.primaryButtonText
    : styles.secondaryButtonText;
  const disabledTextStyle = isPrimary
    ? styles.disabledButtonText
    : styles.disabledSecondaryButtonText;

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyle,
        disabled &&
          (isPrimary
            ? styles.primaryButtonDisabled
            : styles.disabledSecondaryButton),
        isLoading &&
          (isPrimary
            ? styles.primaryButtonLoading
            : styles.secondaryButtonLoading),
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={
        !disabled ? { color: `${colors.background}4D` } : undefined
      }
    >
      {isLoading && (
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: isPrimary
                  ? `${colors.surface}30`
                  : `${colors.primary}30`,
              },
            ]}
          />
        </View>
      )}

      <View style={styles.buttonContent}>
        <Text
          style={[
            disabled ? disabledTextStyle : textStyle,
            isLoading && styles.loadingText,
          ]}
        >
          {isLoading ? loadingTitle : title}
        </Text>

        {isLoading && (
          <Text style={[textStyle, styles.timerText]}>
            {formatTime(elapsedTime)}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onGenerateProof,
  onVerifyProof,
  onImportProof,
  isProofDisabled,
  isVerifyDisabled,
  isImportDisabled,
  isGenerating,
  isVerifying,
  isImporting,
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
        <LoadingButton
          onPress={onGenerateProof}
          disabled={isProofDisabled}
          isLoading={isGenerating}
          title="Generate Proof"
          loadingTitle="Generating..."
          isPrimary={true}
        />

        <LoadingButton
          onPress={onVerifyProof}
          disabled={isVerifyDisabled}
          isLoading={isVerifying}
          title="Verify Proof"
          loadingTitle="Verifying..."
          isPrimary={true}
        />
      </View>

      {/* Secondary Actions - Side by side */}
      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            isShareDisabled
              ? styles.disabledSecondaryButton
              : styles.secondaryButton,
            pressed && !isShareDisabled && { transform: [{ scale: 0.98 }] },
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

        <LoadingButton
          onPress={onImportProof}
          disabled={isImportDisabled}
          isLoading={isImporting}
          title="Import Proof"
          loadingTitle="Importing..."
          isPrimary={false}
        />
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
    overflow: "hidden",
    position: "relative",
  },
  primaryButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  primaryButtonLoading: {
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressBar: {
    height: "100%",
    borderRadius: 24,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 1,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  loadingText: {
    fontWeight: "700",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  disabledButtonText: {
    color: colors.surface,
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
    overflow: "hidden",
    position: "relative",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  secondaryButtonLoading: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    opacity: 0.7,
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
