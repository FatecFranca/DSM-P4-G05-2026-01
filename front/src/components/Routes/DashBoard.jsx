import React, { useEffect, useState, useMemo } from "react";
import { API_URL } from "../../config/api";
import { authFetch } from "../authFetch";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import "./DashBoard.css";
export default function Dashboard({ gyms = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGym, setSelectedGym] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = selectedGym ? `${API_URL}/gyms/dashboard/analytics?gymName=${encodeURIComponent(selectedGym)}` : `${API_URL}/gyms/dashboard/analytics`;
        const res = await authFetch(url);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGym]);
  const lineChartData = useMemo(() => {
    if (!data?.evolucao_hora) return [];
    const grouped = {};
    data.evolucao_hora.forEach((item) => {
      if (!grouped[item.hora]) grouped[item.hora] = { hora: item.hora };
      grouped[item.hora][item.gymName] = item.checkins;
    });
    return Object.values(grouped).sort((a, b) => a.hora - b.hora);
  }, [data]);
  const barChartData = useMemo(() => {
    if (!data?.volume_dia) return [];
    const grouped = {};
    data.volume_dia.forEach((item) => {
      if (!grouped[item.dia_semana]) grouped[item.dia_semana] = { dia_semana: item.dia_semana };
      grouped[item.dia_semana][item.gymName] = item.checkins;
    });
    const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return Object.values(grouped).sort(
      (a, b) => order.indexOf(a.dia_semana) - order.indexOf(b.dia_semana)
    );
  }, [data]);
  const chartGyms = useMemo(() => {
    if (!data?.evolucao_hora) return [];
    const g = new Set();
    data.evolucao_hora.forEach((item) => g.add(item.gymName));
    return Array.from(g);
  }, [data]);
  const predictions = useMemo(() => {
    if (!data?.evolucao_hora) return { empty: null, packed: null, forecastData: [] };
    const hourlyTotal = {};
    data.evolucao_hora.forEach(item => {
      if (selectedGym && item.gymName !== selectedGym) return;
      if (!hourlyTotal[item.hora]) hourlyTotal[item.hora] = 0;
      hourlyTotal[item.hora] += item.checkins;
    });
    const hours = Object.keys(hourlyTotal).map(Number).sort((a, b) => a - b);
    if (hours.length === 0) return { empty: null, packed: null, forecastData: [] };
    const sortedHours = [...hours].sort((a, b) => hourlyTotal[a] - hourlyTotal[b]);
    const thresholdCount = Math.max(1, Math.floor(hours.length * 0.25));
    const emptyHours = sortedHours.slice(0, thresholdCount).sort((a, b) => a - b);
    const packedHours = sortedHours.slice(-thresholdCount).sort((a, b) => a - b);
    const formatBlocks = (hrList) => {
      if (!hrList || hrList.length === 0) return "N/A";
      const blocks = [];
      let currentBlock = { start: hrList[0], end: hrList[0] };
      for (let i = 1; i < hrList.length; i++) {
        if (hrList[i] === currentBlock.end + 1) {
          currentBlock.end = hrList[i];
        } else {
          blocks.push(currentBlock);
          currentBlock = { start: hrList[i], end: hrList[i] };
        }
      }
      blocks.push(currentBlock);
      return blocks.map(b => `${b.start}:00 - ${b.end + 1}:00`).join(' || ');
    };
    return {
      empty: formatBlocks(emptyHours),
      packed: formatBlocks(packedHours),
      forecastData: hours.map(h => ({
        hora: h,
        expected: Number(hourlyTotal[h].toFixed(1))
      }))
    };
  }, [data, selectedGym]);
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];
  if (loading) return <div className="dashboard-loading">Carregando dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!data) return null;
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard de Acessos IoT - GymRadar</h1>
        <p>
          Análise estatística e acompanhamento de fluxo de alunos em tempo real usando dados reais dos
          dispositivos de catraca IoT.
        </p>
        <div className="gym-filter" style={{ marginTop: '16px' }}>
          <label htmlFor="gym-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Gym:</label>
          <select 
            id="gym-select"
            value={selectedGym} 
            onChange={(e) => setSelectedGym(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
          >
            <option value="">All Gyms</option>
            {gyms.map((g) => (
              <option key={g._id || g.id || g.name} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Total de Check-ins</h3>
          <div className="kpi-value">{data.total_checkins}</div>
        </div>
        <div className="kpi-card">
          <h3>Média de Check-ins/Hora</h3>
          <div className="kpi-value">{Number(data.media_hora).toFixed(1)}</div>
        </div>
        <div className="kpi-card">
          <h3>Mediana/Hora</h3>
          <div className="kpi-value">{Number(data.mediana_hora).toFixed(1)}</div>
        </div>
        <div className="kpi-card">
          <h3>% Acessos no Horário de Pico</h3>
          <div className="kpi-value">{Number(data.pct_pico).toFixed(1)}%</div>
        </div>
      </div>
      <div className="prediction-section">
        <div className="prediction-card">
          <h4 className="best-hours-title">Melhores horários para {selectedGym || "todas as academias"}</h4>
          <p className="prediction-text">{predictions.empty || "No data"}</p>
        </div>
        <div className="prediction-card packed">
          <h4 className="packed-hours-title">Horários de pico para {selectedGym || "todas as academias"}</h4>
          <p className="prediction-text">{predictions.packed || "No data"}</p>
        </div>
      </div>
      <div className="chart-box" style={{ background: '#111', border: '1px solid #333', marginBottom: '3rem' }}>
        <h3 style={{ color: '#eaeaea', textAlign: 'center' }}>Forecasting: Expected Demand Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={predictions.forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ee3235" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ee3235" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="hora" stroke="#888" tickFormatter={(v) => `${v}h`} />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
            <Area type="monotone" dataKey="expected" name="Expected Check-ins" stroke="#ee3235" fillOpacity={1} fill="url(#colorExpected)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: '#eaeaea', textAlign: 'center', marginBottom: '1.5rem', background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
          Lotação Futura Prevista
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {(selectedGym ? [selectedGym] : gyms.map(g => g.name)).map(gymName => (
            <div key={gymName} className="chart-box" style={{ background: '#111', border: '1px solid #333', padding: '1rem', margin: 0 }}>
              <h4 style={{ color: '#eaeaea', textAlign: 'center', marginBottom: '1rem' }}>{gymName}</h4>
              <iframe 
                src={`/heatmaps/previsao_heatmap_${gymName.replace(/ /g, '_')}.html`} 
                width="100%" 
                height="400px" 
                style={{ border: 'none', borderRadius: '8px', background: '#fff' }}
                title={`Heatmap para ${gymName}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-box">
          <h3>Evolução da Média de Check-ins por Hora do Dia</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hora" tickFormatter={(v) => `${v}h`} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartGyms.map((gym, idx) => (
                <Line
                  key={gym}
                  type="monotone"
                  dataKey={gym}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h3>Volume Total de Acessos por Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dia_semana" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartGyms.map((gym, idx) => (
                <Bar key={gym} dataKey={gym} fill={colors[idx % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}