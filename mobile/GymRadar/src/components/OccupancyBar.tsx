import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
const DeleteButton = require("@/Assets/DeleteButton.png");

export type Gym = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  capacity: number;
  occupancy: number;
};

type Props = {
  gym: Gym;
  children?: React.ReactNode;
  onDelete?: (id: string) => void | Promise<void>;
};

export default function OccupancyBar({ gym, children, onDelete }: Props) {
  const safeCapacity =
    typeof gym.capacity === "number" && gym.capacity > 0 ? gym.capacity : 50;
  const safeCurrent = Math.max(
    0,
    typeof gym.occupancy === "number" ? gym.occupancy : 0
  );

  const progress = Math.max(0, Math.min(1, safeCurrent / safeCapacity));
  const percentage = progress * 100;

  const barColor =
    percentage < 50 ? "#4CAF50" : percentage < 90 ? "#FF9800" : "#EE3235";

  const effectColor =
    percentage < 50 ? "#388E3C" : percentage < 90 ? "#F57C00" : "#B71C1C";

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 70,
      friction: 12,
    }).start();
  }, [progress, anim]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  function confirmDelete() {
    if (!onDelete) return;
    Alert.alert(
      "Delete gym",
      `Are you sure you want to delete "${gym.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(gym.id),
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <View style={[styles.wrapper, { borderColor: effectColor }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {gym.name} — Occupancy: {safeCurrent}/{safeCapacity}
        </Text>
        <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
          <Image
            source={DeleteButton}
            style={{ width: 15, height: 24, padding: 4, marginRight: 15 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, { width, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.helper}>{percentage.toFixed(1)}%</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingVertical: 18,
    gap: 18,
    backgroundColor: "#383838",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,

  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    paddingRight: 8,
    color: "#fff",
  },
  barBg: {
    width: "100%",
    height: 10,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    overflow: "hidden",
  },
  barFill: { height: "100%" },
  helper: { color: "#c2bebeff" },
});