import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGym } from '../src/context/GymContext';
import { useAuth } from '../src/context/AuthContext';
import { router, type Href } from 'expo-router';

export default function Simulator() {
  const { checkIn, checkOut, sendTemperature } = useGym();
  const { isAuthenticated } = useAuth();
  const [temp, setTemp] = useState('23');

  const ensureAuth = () => {
    if (!isAuthenticated) {
      Alert.alert('Unauthorized', 'Please login first.');
      router.push('/login' as Href);
      return false;
    }
    return true;
  };

  const doCheckIn = async () => {
    if (!ensureAuth()) return;
    try {
      await checkIn();
      Alert.alert('Check-in sent');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Unknown error');
    }
  };

  const doCheckOut = async () => {
    if (!ensureAuth()) return;
    try {
      await checkOut();
      Alert.alert('Check-out sent');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Unknown error');
    }
  };

  const doSendTemp = async () => {
    if (!ensureAuth()) return;
    const c = parseFloat(temp);
    if (Number.isNaN(c)) {
      Alert.alert('Invalid temperature');
      return;
    }
    try {
      await sendTemperature(c);
      Alert.alert('Temperature sent', `${c} °C`);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>IoT Simulator</Text>
      <View style={styles.row}>
        <Button title="Check In" onPress={doCheckIn} />
        <View style={{ width: 12 }} />
        <Button title="Check Out" onPress={doCheckOut} color="#8e44ad" />
      </View>

      <View style={{ height: 20 }} />

      <Text style={styles.subheader}>Temperature (°C)</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={temp}
          onChangeText={setTemp}
          keyboardType="numeric"
          placeholder="e.g. 22.5"
        />
        <View style={{ width: 12 }} />
        <Button title="Send Temperature" onPress={doSendTemp} />
      </View>

      <View style={{ height: 20 }} />
      <Button title="Go Home" onPress={() => router.push('/' as Href)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  subheader: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});