import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import { authFetch } from './authFetch';
import './ExperimentResults.css';

export default function ExperimentResults({ experiment = 'home_gym_layout' }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await authFetch(
          `${API_URL}/experiments/results?experiment=${encodeURIComponent(experiment)}`
        );
        if (alive) setData(res);
      } catch (err) {
        if (alive) setError(err.message || 'Failed to load A/B test results');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [experiment]);

  const variants = data?.variants ? ['A', 'B'].filter((v) => data.variants[v]) : [];
  const totalImpressions = data?.total?.impressions ?? 0;

  return (
    <div className="experiment-results">
      <h3 className="experiment-title">
        A/B Test — <span className="experiment-name">{experiment}</span>
      </h3>
      <p className="experiment-hypothesis">
        Hipótese: layout compacto (B) aumenta a taxa de abertura do dashboard em comparação com
        o layout em cartões (A).
      </p>

      {loading && <p className="experiment-loading">Carregando resultados do experimento...</p>}
      {error && <p className="experiment-error">{error}</p>}
      {!loading && !error && data && totalImpressions === 0 && (
        <p className="experiment-empty">
          No data yet — o experimento precisa de impressions e conversions para gerar resultados.
        </p>
      )}

      {!loading && !error && variants.length > 0 && (
        <div className="experiment-table-wrap">
          <table className="experiment-table">
            <thead>
              <tr>
                <th>Variante</th>
                <th>Impressions</th>
                <th>Conversions</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => {
                const row = data.variants[v];
                return (
                  <tr key={v}>
                    <td>{v}</td>
                    <td>{row.impressions}</td>
                    <td>{row.conversions}</td>
                    <td>{(row.rate * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="experiment-summary">
            <span className={`badge ${data.significant ? 'badge-significant' : 'badge-inconclusive'}`}>
              {data.significant ? 'Significant' : 'Inconclusive'}
            </span>
            {data.winner && data.winner !== 'none' && data.winner !== 'tie' && (
              <span className="experiment-winner">Winner: {data.winner}</span>
            )}
            {typeof data.uplift === 'number' && (
              <span className="experiment-uplift">Uplift: {data.uplift.toFixed(1)}%</span>
            )}
            {typeof data.pValue === 'number' && (
              <span className="experiment-pvalue">p-value: {data.pValue.toFixed(3)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
