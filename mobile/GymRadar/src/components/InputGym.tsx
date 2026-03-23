import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";

type Gym = { name: string };
type Props = {
  gyms?: Gym[];
  onGymAdded?: (gym: any) => void;
  token?: string;
  apiBaseUrl?: string;
};

const extra =
  (Constants as any)?.expoConfig?.extra ||
  (Constants?.manifest as any)?.extra ||
  {};
const CONFIG_BACKEND_URL: string =
  extra.backendUrl || "http://192.168.100.166:5000";

const InputGym: React.FC<Props> = ({
  gyms = [],
  onGymAdded,
  token,
  apiBaseUrl,
}) => {
  const [form, setForm] = useState({
    address: "",
    phone: "",
    capacity: "",
    name: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const baseUrl = apiBaseUrl ?? CONFIG_BACKEND_URL;

  const handleSubmit = async () => {
    setMessage("");

    const name = form.name.trim();
    const capNum = Number(form.capacity);
    if (!name) {
      setMessage("Name is required.");
      return;
    }
    if (!Number.isFinite(capNum) || capNum <= 0) {
      setMessage("Capacity must be a positive number.");
      return;
    }
    if (gyms.find((g) => g.name.trim().toLowerCase() === name.toLowerCase())) {
      setMessage("Gym with this name already exists.");
      return;
    }

    setSubmitting(true);
    const authToken = token ?? (await AsyncStorage.getItem("auth_token")); 

    try {
      const res = await fetch(`${baseUrl}/gyms`, {
        method: "POST",
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify({
          name,
          address: form.address.trim(),
          phone: form.phone.trim(),
          capacity: Math.floor(capNum),
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        setMessage(data?.message || `Failed to add gym (${res.status}).`);
        setSubmitting(false);
        return;
      }

    
      onGymAdded?.(data);
      setForm({ address: "", phone: "", capacity: "", name: "" });
      setMessage("Gym added successfully!");

      Alert.alert("Success", "Gym added successfully!", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (err) {
      setMessage("Network error: Could not add gym.");
      console.error("Error adding gym:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Gym</Text>
      <TextInput
        style={styles.input}
        placeholder="Endereço"
        placeholderTextColor="#999"
        value={form.address}
        onChangeText={handleChange("address")}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={handleChange("phone")}
      />
      <TextInput
        style={styles.input}
        placeholder="Capacity"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        value={form.capacity}
        onChangeText={handleChange("capacity")}
      />
      <TextInput
        style={styles.input}
        placeholder="Nome da Academia"
        placeholderTextColor="#999"
        value={form.name}
        onChangeText={handleChange("name")}
      />
      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Gym</Text>
        )}
      </Pressable>
      <TouchableOpacity
        onPress={() => router.replace("/")}
        style={styles.backButton}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>back</Text>
      </TouchableOpacity>
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    height: "100%",
    padding: 16,
    width: "100%",
    backgroundColor: "#292929ff",
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#ffffffff", textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#4e4e4eff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: "#111",
  },
  button: {
    backgroundColor: "#ee3235",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700" },
  message: { marginTop: 10, color: "#333" },
  backButton: {
    marginTop: 12,
    alignItems: "center",
    backgroundColor: "#ee3235",
    padding: 10,
    borderRadius: 8,
    width: 80,
  },
});

export default InputGym;
