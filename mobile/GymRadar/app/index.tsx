import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGym } from "../src/context/GymContext";
import OccupancyBar from "../src/components/OccupancyBar";
import { useAuth } from "../src/context/AuthContext";
import { router, type Href } from "expo-router";
import Timer from "../src/components/Timer";
import CheckInNOut from "@/src/components/CheckInNOut";
import * as GymAPI from "../src/api/gym";

type Gym = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  capacity: number;
  occupancy: number;
};

export default function Home() {
  const { gym: gymState, refresh } = useGym();
  const { logout, user } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);

  async function reloadGyms() {
    try {
      const list = await GymAPI.getGyms();
      setGyms(list);
    } catch (e) {
      console.log("Failed to fetch gyms", e);
    }
  }

  useEffect(() => {
    reloadGyms();
  }, []);

  async function handleDeleteGym(id: string) {
    try {

      setGyms(prev => prev.filter(g => g.id !== id));
      await GymAPI.deleteGym(id);
      Alert.alert("Deleted", "Gym deleted successfully");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Delete failed", err?.message ?? String(err));
     reloadGyms();
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerImg}>
          <ImageBackground
            source={{ uri: "https://t3.ftcdn.net/jpg/08/27/87/60/360_F_827876077_k0EWo3jSiWZPR8fRgsSbZFT9SkrozNuj.jpg" }}
            style={styles.imageBackground}
            imageStyle={styles.imageStyle}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.25)", "transparent"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.hero}>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Hi {user?.username ?? "Member"}</Text>
                <Pressable
                  style={styles.logOutButton}
                  onPress={() => {
                    logout();
                    router.push("/login" as Href);
                  }}
                >
                  <Text style={styles.logOutText}>Logout</Text>
                </Pressable>
              </View>
              <Timer />
              <Text style={styles.heroTitle}>
                Push Your <Text style={styles.highlight}>Limits</Text>
              </Text>
            </View>
          </ImageBackground>
        </View>

        {gyms.map(g => (
          <View key={g.id} style={{ marginBottom: 12 }}>
            <OccupancyBar gym={g} onDelete={handleDeleteGym} />
          </View>
        ))}

        {gyms.length === 0 && (
          <OccupancyBar
            gym={{
              id: "context-fallback",
              name: gymState.name ?? "Configured Gym",
              address: "",
              phone: "",
              capacity: gymState.capacity,
              occupancy: gymState.current,
            }}
          />
        )}

        <View style={{ height: 12 }} />

      
        <Pressable
          style={styles.registerGymButton}
          onPress={() => router.push("/addGym" as Href)}
        >
          <Text style={styles.registerGymText}>Register New Gym</Text>
        </Pressable>

        <CheckInNOut
          username={user?.username ?? undefined}
          onClientAdded={() => { refresh(); reloadGyms(); }}
          onClientDeleted={() => { refresh(); reloadGyms(); }}
        />

        
        <View style={{ height: 12 }} />

        <Pressable
          style={styles.openSimButton}
          onPress={() => router.push("/simulator" as Href)}
        >
          <Text style={styles.openSimText}>Open IoT Simulator</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 12, paddingBottom: 32, backgroundColor: "#292929ff" },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    zIndex: 1,
  },
  header: { fontSize: 24, fontWeight: "700", color: "#fff", padding: 14 },
  logOutButton: {
    backgroundColor: "#ee3235",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  logOutText: { color: "#fff", fontWeight: "600" },
  containerImg: {
    height: 250,
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
  },
  imageBackground: { flex: 1, padding: 12, justifyContent: "space-between" },
  imageStyle: { borderRadius: 8 },
  hero: { paddingHorizontal: 18, paddingBottom: Platform.OS === "ios" ? 18 : 14 },
  heroTitle: { color: "#fff", fontSize: 34, fontWeight: "700", lineHeight: 38 },
  highlight: { color: "#ee3235" },
  refreshButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  refreshText: { color: "#111", fontWeight: "600" },
  openSimButton: {
    backgroundColor: "#ee3235",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    opacity: 0.3 ,
  },
  openSimText: { color: "#ffffffff", fontWeight: "600", padding: 4,  },
  registerGymButton: {
    backgroundColor: "#ee3235",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  registerGymText: { color: "#ffffffff", fontWeight: "600", padding: 4, },
});