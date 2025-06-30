import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { colors } from "./styles/colors";
import { typography } from "./styles/typography";

export type Program = "fibonacci" | "hashes";

export interface ProgramOption {
  type: Program;
  label: string;
  available: boolean;
}

interface ProgramDropdownProps {
  selectedProgram: Program;
  onProgramSelect: (program: Program) => void;
  Programs: ProgramOption[];
}

export const ProgramDropdown: React.FC<ProgramDropdownProps> = ({
  selectedProgram,
  onProgramSelect,
  Programs,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleProgramSelect = (Program: Program) => {
    onProgramSelect(Program);
    setShowPicker(false);
  };

  const selectedProgramLabel =
    Programs.find((p) => p.type === selectedProgram)?.label ?? "Select Program";

  return (
    <View>
      <View style={styles.dropdownContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.dropdownButton,
            showPicker && styles.dropdownButtonOpen,
            pressed && styles.dropdownButtonPressed,
          ]}
          onPress={() => setShowPicker(!showPicker)}
        >
          <Text style={styles.dropdownButtonText}>{selectedProgramLabel}</Text>
          <Text
            style={[
              styles.dropdownArrow,
              showPicker && styles.dropdownArrowOpen,
            ]}
          >
            ▼
          </Text>
        </Pressable>

        {/* Dropdown List */}
        {showPicker && (
          <View style={styles.dropdownList}>
            {Programs.map((Program, index) => (
              <Pressable
                key={Program.type}
                style={({ pressed }) => [
                  styles.dropdownOption,
                  index === Programs.length - 1 && styles.dropdownOptionLast,
                  selectedProgram === Program.type &&
                    styles.dropdownOptionSelected,
                  !Program.available && styles.dropdownOptionDisabled,
                  pressed && Program.available && styles.dropdownOptionPressed,
                ]}
                onPress={() =>
                  Program.available && handleProgramSelect(Program.type)
                }
                disabled={!Program.available}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedProgram === Program.type &&
                      styles.dropdownOptionTextSelected,
                    !Program.available && styles.dropdownOptionTextDisabled,
                  ]}
                >
                  {Program.label}
                </Text>
                {!Program.available && (
                  <Text style={styles.dropdownComingSoonText}>Coming Soon</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Invisible overlay to close dropdown when tapping outside */}
      {showPicker && (
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setShowPicker(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: "transparent",
  },
  dropdownButtonPressed: {
    backgroundColor: "#F8F8F8",
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.onBackground,
    fontFamily: "Inter_500Medium",
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.onBackground,
    opacity: 0.6,
    transform: [{ rotate: "0deg" }],
  },
  dropdownArrowOpen: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 1001,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  dropdownOptionSelected: {
    backgroundColor: "#F0F8F0",
  },
  dropdownOptionDisabled: {
    backgroundColor: "#F8F8F8",
  },
  dropdownOptionPressed: {
    backgroundColor: "#F0F0F0",
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.onBackground,
    fontFamily: "Inter_500Medium",
  },
  dropdownOptionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  dropdownOptionTextDisabled: {
    color: colors.disabled,
  },
  dropdownComingSoonText: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.disabled,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});
