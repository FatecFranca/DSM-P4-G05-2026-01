import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type Gym = {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
};

type Props = {
  gym: Gym;
  onPress?: () => void;
};

export default function GymRow({ gym, onPress }: Props) {
  const capacity = typeof gym.capacity === 'number' && gym.capacity > 0 ? gym.capacity : 50;
  const current = Math.max(0, typeof gym.occupancy === 'number' ? gym.occupancy : 0);
  const pct = Math.min(100, (current / capacity) * 100);

  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.info}>
        <Text style={styles.name}>{gym.name}</Text>
        <Text style={styles.sub}>
          {current}/{capacity}
        </Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.pct}>{pct.toFixed(0)}%</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#383838',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    padding: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    color: '#c2bebe',
    fontSize: 13,
    marginTop: 2,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#ee3235',
  },
  pct: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    width: 44,
    textAlign: 'right',
  },
});
