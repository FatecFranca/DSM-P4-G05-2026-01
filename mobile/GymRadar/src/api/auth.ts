import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setAuthToken } from './client';

export async function login(username: string, password: string): Promise<{ token: string }> {
  const { token } = await apiClient.post<{ token: string }>('/auth/login', { username, password });
  await AsyncStorage.setItem('token', token);
  setAuthToken(token);
  return { token };
}

export async function signup(username: string, password: string): Promise<{ token: string }> {
  const { token } = await apiClient.post<{ token: string }>('/auth/signup', { username, password });
  await AsyncStorage.setItem('token', token);
  setAuthToken(token);
  return { token };
}