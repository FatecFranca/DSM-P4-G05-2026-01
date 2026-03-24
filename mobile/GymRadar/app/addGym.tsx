import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import InputGym from '@/src/components/InputGym';
import { router } from 'expo-router';

export default function AddGymScreen() {
  const [createdGym, setCreatedGym] = useState<any | null>(null);

  const handleGymAdded = async (g: any) => {
    setCreatedGym(g);
    Alert.alert('Gym added', g?.name || 'New gym created');
    
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <InputGym onGymAdded={handleGymAdded} />
      {createdGym && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700' }}>{createdGym.name}</Text>
          {'capacity' in createdGym ? <Text>Capacity: {createdGym.capacity}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
});