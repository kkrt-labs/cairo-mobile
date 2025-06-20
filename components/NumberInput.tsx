import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { colors } from "./styles/colors";

interface NumberInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onValueChange,
  placeholder = "Enter a number",
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onValueChange}
        placeholder={placeholder}
        placeholderTextColor={colors.disabled}
        keyboardType="numeric"
        returnKeyType="done"
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
});
