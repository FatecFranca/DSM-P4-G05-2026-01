import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useGym } from "@/src/context/GymContext";

type Props = {
  onClientAdded?: () => void;
  onClientDeleted?: () => void;
  username?: string;
  apiBaseUrl?: string;
};

const extra =
  (Constants as any)?.expoConfig?.extra ||
  (Constants?.manifest as any)?.extra ||
  {};
const CONFIG_BACKEND_URL: string =
  extra.backendUrl || "http://192.168.100.166:5000";

export default function CheckInNOut({
  onClientAdded,
  onClientDeleted,
  username,
  apiBaseUrl,
}: Props) {
  const [gymName, setGymName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { refresh } = useGym();

  const baseUrl = apiBaseUrl ?? CONFIG_BACKEND_URL;

  const handleCheckIn = async () => {
    setMessage("");
    const payloadGymName = (gymName || "").trim();
    if (!payloadGymName) {
      setMessage("Gym name is required.");
      return;
    }

    setSubmitting(true);
    const authToken = await AsyncStorage.getItem("auth_token");

    try {
      const res = await fetch(`${baseUrl}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ gymName: payloadGymName }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch { }

      if (!res.ok) {
        setMessage(data?.message || `Check-in failed (${res.status}).`);
        return;
      }

      setMessage("Checked in successfully!");
      alert(
        `Check-in successful on ${payloadGymName} , dont forget to check out later!`
      );

      await refresh();
      onClientAdded?.();
    } catch (err: any) {
      setMessage("Check-in failed: " + (err?.message || "error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setMessage("");
    const payloadGymName = (gymName || "").trim();
    if (!payloadGymName) {
      setMessage("Gym name is required.");
      return;
    }

    setSubmitting(true);
    const authToken = await AsyncStorage.getItem("auth_token");

    try {
      const res = await fetch(`${baseUrl}/clients/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ gymName: payloadGymName }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch { }

      if (!res.ok) {
        setMessage(data?.message || `Check-out failed (${res.status}).`);
        return;
      }

      setMessage("Checked out successfully!");
      await refresh();
      onClientDeleted?.();
    } catch (err: any) {
      setMessage("Check-out failed: " + (err?.message || "error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title1}>Client Check-In / Check-Out</Text>
      <TextInput
        style={styles.input}
        placeholder="Exprime"
        placeholderTextColor="#d6d6d6ff"
        value={gymName}
        onChangeText={setGymName}
      />

      <View style={styles.buttonsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
            submitting && styles.disabled,
          ]}
          onPress={handleCheckIn}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Check In</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressedSecondary,
            submitting && styles.disabled,
          ]}
          onPress={handleCheckOut}
          disabled={submitting}
        >
          <Text style={styles.secondaryButtonText}>Check Out</Text>
        </Pressable>
      </View>
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 12,
    backgroundColor: "#2e2e2eff",
    borderRadius: 8,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#ffffffff" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#414141ff",
    color: "#ffffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#36a40aff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    padding: 10,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    backgroundColor: "#ee3235",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    padding: 10,
  },
  secondaryButtonText: { color: "#fff", fontWeight: "700" },
  pressed: { opacity: 0.85 },
  pressedSecondary: { opacity: 0.85 },
  disabled: { opacity: 0.7 },
  message: { marginTop: 10, color: "#f7f7f7ff" },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  title1: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#ffffffff", textAlign: "center" },
});
