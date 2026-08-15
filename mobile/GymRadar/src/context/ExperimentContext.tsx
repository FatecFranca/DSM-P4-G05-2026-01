import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExperimentAPI from '../api/experiment';
import {
  assignVariant,
  buildEventPayload,
  EXPERIMENTS,
  ExperimentName,
  Variant,
} from '../experiments/experiment';
import { useAuth } from './AuthContext';

const ANON_ID_KEY = 'experiment_anon_id';
const ACTIVE_EXPERIMENT: ExperimentName = 'home_gym_layout';

type ExperimentContextType = {
  variant: Variant;
  recordImpression: () => void;
  recordConversion: () => void;
};

const ExperimentContext = createContext<ExperimentContextType>({} as ExperimentContextType);

function generateAnonId(): string {
  return `anon-${Math.random().toString(36).slice(2, 10)}`;
}

export const ExperimentProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [variant, setVariant] = useState<Variant>('A');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let anonId = await AsyncStorage.getItem(ANON_ID_KEY);
        if (!anonId) {
          anonId = generateAnonId();
          await AsyncStorage.setItem(ANON_ID_KEY, anonId);
        }
        setVariant(assignVariant(ACTIVE_EXPERIMENT, user?.username ?? anonId));
      } catch {
        setVariant('A');
      }
      setReady(true);
    })();
  }, [user?.username]);

  const track = useCallback(
    async (eventType: 'impression' | 'conversion') => {
      if (!ready) return;
      let userId = user?.username ?? '';
      if (!userId) {
        userId = (await AsyncStorage.getItem(ANON_ID_KEY)) ?? 'anon';
      }
      const payload = buildEventPayload(ACTIVE_EXPERIMENT, variant, eventType, userId);
      ExperimentAPI.recordEvent(payload).catch(() => {});
    },
    [ready, variant, user?.username]
  );

  const recordImpression = useCallback(() => {
    track('impression');
  }, [track]);

  const recordConversion = useCallback(() => {
    track('conversion');
  }, [track]);

  const value = useMemo(
    () => ({ variant, recordImpression, recordConversion }),
    [variant, recordImpression, recordConversion]
  );

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
};

export function useExperiment() {
  return useContext(ExperimentContext);
}

export { EXPERIMENTS };
