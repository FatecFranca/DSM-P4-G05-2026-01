import React from 'react';
import { render, screen } from '@testing-library/react';
import ExperimentResults from './ExperimentResults';

const results = {
  experiment: 'home_gym_layout',
  variants: {
    A: { variant: 'A', impressions: 120, conversions: 60, rate: 0.5 },
    B: { variant: 'B', impressions: 100, conversions: 40, rate: 0.4 },
  },
  total: { impressions: 220, conversions: 100, rate: 0.45454545454545453 },
  uplift: -20,
  pValue: 0.5,
  significant: false,
  winner: 'A',
  confidence: 50,
};

function mockFetch(payload) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve(JSON.stringify(payload)),
  });
}

describe('ExperimentResults', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the experiment name and per-variant stats', async () => {
    mockFetch(results);
    render(<ExperimentResults />);
    expect(await screen.findByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('shows significance badge and winner when the result is significant', async () => {
    mockFetch({ ...results, significant: true, pValue: 0.01, winner: 'B', confidence: 99 });
    render(<ExperimentResults />);
    expect(await screen.findByText(/Significant/i)).toBeInTheDocument();
    expect(screen.getByText(/Winner: B/i)).toBeInTheDocument();
  });

  it('renders a friendly message when there is no data yet', async () => {
    mockFetch({ experiment: 'home_gym_layout', variants: {}, total: { impressions: 0, conversions: 0, rate: 0 }, uplift: null, pValue: null, significant: null, winner: 'none', confidence: null });
    render(<ExperimentResults />);
    expect(await screen.findByText(/no data/i)).toBeInTheDocument();
  });
});
