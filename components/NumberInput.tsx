import React, { useRef } from "react";
import { StyleSheet, View, TextInput, Keyboard } from "react-native";
import { colors } from "./styles/colors";

interface NumberInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const FIBONACCI_MAX_INPUT = 116507;

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onValueChange,
  placeholder = "Enter a number",
}) => {
  const inputRef = useRef<TextInput>(null);

  // Check if the current value is valid for fibonacci input
  const isValidFibonacci = () => {
    if (!value) return true; // Empty input is valid (allows user to type)
    const numValue = parseInt(value, 10);
    return !isNaN(numValue) && numValue >= 0 && numValue <= FIBONACCI_MAX_INPUT;
  };

  const handleSubmitEditing = () => {
    // Dismiss keyboard when user presses "done"
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const isValid = isValidFibonacci();

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, !isValid && styles.inputInvalid]}
        value={value}
        onChangeText={onValueChange}
        onSubmitEditing={handleSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.disabled}
        keyboardType="numeric"
        returnKeyType="done"
        blurOnSubmit={true}
        enablesReturnKeyAutomatically={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: colors.onBackground,
    textAlign: "center",
  },
  inputInvalid: {
    borderColor: "#ef4444", // Red border for invalid input
    backgroundColor: "#fef2f2", // Light red background
  },
});
