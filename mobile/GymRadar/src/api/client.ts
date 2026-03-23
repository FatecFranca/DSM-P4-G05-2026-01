import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const extra =
  (Constants?.manifest as any)?.extra ||
  (Constants as any)?.expoConfig?.extra ||
  {};
const backendUrl: string = extra.backendUrl || 'http://192.168.100.166:5000';

let authToken: string | null = null;
export function setAuthToken(token: string | null) { authToken = token; }

export async function hydrateAuthToken() {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) setAuthToken(token);
  } catch {}
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${backendUrl}${path}`;
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(url, { ...init, headers });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    try {
      const json = JSON.parse(text);
      throw new Error(json?.message || `HTTP ${res.status} ${url}`);
    } catch {
      throw new Error(text || `HTTP ${res.status} ${url}`);
    }
  }
  try { return JSON.parse(text) as T; } catch { return {} as T; }
}

const apiClient = {
  get<T>(path: string) { return request<T>(path, { method: 'GET' }); },
  post<T>(path: string, body?: any) {
    return request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
};

export default apiClient;