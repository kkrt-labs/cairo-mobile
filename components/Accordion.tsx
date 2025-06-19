import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, Animated } from "react-native";
import { colors } from "./styles/colors";
import { typography } from "./styles/typography";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [animation] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

  const toggleAccordion = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.timing(animation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.header,
          pressed && styles.headerPressed,
        ]}
        onPress={toggleAccordion}
      >
        <Text style={[typography.accordionTitle, styles.title]}>{title}</Text>
        <Animated.View
          style={[
            styles.chevron,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        >
          <Text style={styles.chevronText}>▼</Text>
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          styles.content,
          {
            maxHeight: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000], // Adjust max height as needed
            }),
            opacity: animation,
          },
        ]}
      >
        <View style={styles.contentInner}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  headerPressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
  },
  chevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 12,
    color: colors.onBackground,
    opacity: 0.6,
  },
  content: {
    overflow: "hidden",
  },
  contentInner: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
});
