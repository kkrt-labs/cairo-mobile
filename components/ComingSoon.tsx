import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { typography } from "./styles/typography";

interface ComingSoonProps {
  title: string;
  message: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title, message }) => {
  return (
    <View style={styles.container}>
      <Text style={typography.comingSoonTitle}>{title}</Text>
      <Text style={[typography.comingSoonMessage, styles.message]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
  },
  message: {
    textAlign: "center",
  },
});
