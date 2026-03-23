import Constants from "expo-constants";
import apiClient from "./client";

const extra =
  (Constants?.manifest as any)?.extra ||
  (Constants as any)?.expoConfig?.extra ||
  {};
const gymId: string = extra.gymId || "Academia Centro";

export type Gym = { id: string; name: string; capacity: number; occupancy: number };

export async function getGyms(): Promise<Gym[]> {
  const gyms = await apiClient.get<Gym[]>(`/gyms?ts=${Date.now()}`);
  return gyms;
}

export async function getOccupancy(): Promise<{ current: number; capacity: number; name: string }> {
  const gyms = await getGyms();
  const target = gymId.trim().toLowerCase();
  const gym = gyms.find(g => g.name.trim().toLowerCase() === target);
  const current = typeof gym?.occupancy === "number" ? gym!.occupancy : 0;
  const capacity = typeof gym?.capacity === "number" && gym!.capacity > 0 ? gym!.capacity : 50;
  return { current, capacity, name: gym?.name ?? gymId };
}

export async function addClient(name: string, email: string, phone: string) {
  const body = { name, gymName: gymId, email, phone };
  await apiClient.post("/clients", body);
}

export async function checkoutClient(name: string) {
  const body = { name, gymName: gymId };
  await apiClient.post("/clients/checkout", body);
}

export async function deleteGym(id: string) {
  await apiClient.delete(`/gyms/${id}`);
}