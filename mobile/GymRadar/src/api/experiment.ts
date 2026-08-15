import apiClient from './client';
import { ExperimentEvent } from '../experiments/experiment';

export function recordEvent(payload: ExperimentEvent): Promise<unknown> {
  return apiClient.post('/experiments/event', payload);
}

export function getResults(experiment: string): Promise<unknown> {
  return apiClient.get(
    `/experiments/results?experiment=${encodeURIComponent(experiment)}`
  );
}
