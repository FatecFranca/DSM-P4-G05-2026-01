import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'DSM GymRadar Mobile',
  slug: 'dsm-gymradar-mobile',
  scheme: 'dsmgymradar',
  version: '1.0.0',
  orientation: 'portrait',
  platforms: ['ios', 'android', 'web'],
  extra: {
    backendUrl: process.env.BACKEND_BASE_URL || 'http://192.168.100.166:5000',
    gymId: process.env.GYM_ID || 'Gym2',
    iotMode: process.env.IOT_MODE || 'http',
    mqttUrl: process.env.MQTT_URL || '',
  },
};

export default config;