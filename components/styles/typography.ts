import { TextStyle } from "react-native";
import { colors } from "./colors";

export const typography: Record<string, TextStyle> = {
  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.onBackground,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.onBackground,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.onBackground,
    fontFamily: "Inter_400Regular",
    opacity: 0.8,
    letterSpacing: 0.1,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.secondary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  resultValueLarge: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.secondary,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.onBackground,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  comingSoonMessage: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.onBackground,
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.onBackground,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  inputHelper: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.onBackground,
    fontFamily: "Inter_400Regular",
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onBackground,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },
};
