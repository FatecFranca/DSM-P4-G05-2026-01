import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { Redirect, router, type Href } from "expo-router";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const onSubmit = async () => {
    try {
      await login(username.trim(), password);
      router.replace("/" as Href);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message || "Unknown error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome back</Text>
      <TextInput placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} style={styles.input} placeholderTextColor={"#ffffff86"} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} placeholderTextColor={"#ffffff86"} />
      <Pressable onPress={onSubmit} style={{ backgroundColor: "#f14545ff", padding: 14, borderRadius: 8, alignItems: "center" }}>
        <Text style={{ color: "#ffffffff", fontWeight: "600" }}>Login</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/signup" as Href)} style={{ backgroundColor: "#f14545ff", padding: 14, borderRadius: 8, alignItems: "center" }}>
        <Text style={{ color: "#ffffffff", fontWeight: "600" }}>Create an account</Text>
      </Pressable>
      <View style={{ height: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10, justifyContent: "center", backgroundColor: "#292929ff" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 12, color: "#ffffffff" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: "#4e4e4eff", color: "#ffffffff", padding: 10 },
});