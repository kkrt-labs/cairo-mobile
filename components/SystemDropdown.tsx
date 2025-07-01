import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "./styles/colors";
import { typography } from "./styles/typography";
import { SystemType } from "../hooks/types";
import { SystemOption } from "./data/constants";

export interface SystemDropdownProps {
  selectedSystem: SystemType;
  onSystemSelect: (system: SystemType) => void;
  systems: SystemOption[];
}

export const SystemDropdown: React.FC<SystemDropdownProps> = ({
  selectedSystem,
  onSystemSelect,
  systems,
}) => {
  const availableSystems = systems.filter((system) => system.available);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>System</Text>
      <View style={styles.optionsContainer}>
        {availableSystems.map((system) => (
          <TouchableOpacity
            key={system.type}
            style={[
              styles.option,
              selectedSystem === system.type && styles.selectedOption,
            ]}
            onPress={() => onSystemSelect(system.type)}
          >
            <Text
              style={[
                styles.optionText,
                selectedSystem === system.type && styles.selectedOptionText,
              ]}
            >
              {system.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    ...typography.inputLabel,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.onSurface,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: colors.surface,
    fontWeight: "600",
  },
});
