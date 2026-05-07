import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import * as GymAPI from '../src/api/gym';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
const screenWidth = Dimensions.get("window").width;
export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<any[]>([]);
  const [selectedGym, setSelectedGym] = useState<string>('');
  useEffect(() => {
    const init = async () => {
      try {
        const list = await GymAPI.getGyms();
        setGyms(list);
      } catch (e) {
        console.error("Failed to fetch gyms", e);
      }
    };
    init();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await GymAPI.getDashboardAnalytics(selectedGym);
        setData(res.data ? res.data : res); // Axios returns inside .data usually, but apiClient might unwrap
      } catch (e) {
        console.error("Dashboard analytics error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGym]);
  const lineChartData = useMemo(() => {
    const targetData = data?.data || data;
    if (!targetData?.evolucao_hora || targetData.evolucao_hora.length === 0) return null;
    const grouped: any = {};
    targetData.evolucao_hora.forEach((item: any) => {
      if (!grouped[item.hora]) grouped[item.hora] = 0;
      grouped[item.hora] += item.checkins;
    });
    const sortedHours = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    const labels = sortedHours.map(h => `${h}h`);
    const dataset = sortedHours.map(h => grouped[h]);
    return {
      labels: labels.length > 0 ? labels : ['0h'],
      datasets: [
        {
          data: dataset.length > 0 ? dataset : [0],
          color: (opacity = 1) => `rgba(238, 50, 53, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  }, [data]);
  const barChartData = useMemo(() => {
    const targetData = data?.data || data;
    if (!targetData?.volume_dia || targetData.volume_dia.length === 0) return null;
    const grouped: any = {};
    targetData.volume_dia.forEach((item: any) => {
      if (!grouped[item.dia_semana]) grouped[item.dia_semana] = 0;
      grouped[item.dia_semana] += item.checkins;
    });
    const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const labels = [];
    const dataset = [];
    for (let i = 0; i < order.length; i++) {
       if (grouped[order[i]] !== undefined) {
         labels.push(shortDays[i]);
         dataset.push(grouped[order[i]]);
       }
    }
    if (labels.length === 0) return null;
    return {
      labels,
      datasets: [
        {
          data: dataset
        }
      ]
    };
  }, [data]);
  const predictions = useMemo(() => {
    const targetData = data?.data || data;
    if (!targetData?.evolucao_hora || targetData.evolucao_hora.length === 0) return { empty: null, packed: null };
    const grouped: { [key: number]: number } = {};
    targetData.evolucao_hora.forEach((item: any) => {
      const h = Number(item.hora);
      if (!grouped[h]) grouped[h] = 0;
      grouped[h] += item.checkins;
    });
    const hours = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    if (hours.length === 0) return { empty: null, packed: null };
    const values = hours.map(h => grouped[h]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stddev = Math.sqrt(variance);
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    const emptyThreshold = Math.max(q1, mean - stddev * 0.5);
    const packedThreshold = Math.min(q3, mean + stddev * 0.5);
    const emptyHours = hours.filter(h => grouped[h] <= emptyThreshold);
    const packedHours = hours.filter(h => grouped[h] >= packedThreshold);
    const formatBlocks = (hrList: number[]) => {
      if (!hrList || hrList.length === 0) return "N/A";
      const blocks: {start: number, end: number}[] = [];
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
      packed: formatBlocks(packedHours)
    };
  }, [data]);
  const chartConfig = {
    backgroundGradientFrom: "#1e1e1e",
    backgroundGradientTo: "#1e1e1e",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#ee3235"
    }
  };
  const targetData = data?.data || data || {};
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>
      <View style={styles.pillContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
          <Pressable 
            style={[styles.pill, selectedGym === '' && styles.pillActive]}
            onPress={() => setSelectedGym('')}
          >
            <Text style={[styles.pillText, selectedGym === '' && styles.pillTextActive]}>All Gyms</Text>
          </Pressable>
          {gyms.map(g => (
            <Pressable 
              key={g.id || g._id} 
              style={[styles.pill, selectedGym === g.name && styles.pillActive]}
              onPress={() => setSelectedGym(g.name)}
            >
              <Text style={[styles.pillText, selectedGym === g.name && styles.pillTextActive]}>{g.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#ee3235" style={{ marginTop: 50 }} />
        ) : !data ? (
          <Text style={styles.errorText}>No data available</Text>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Check-ins</Text>
                <Text style={styles.kpiValue}>{targetData.total_checkins || 0}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Avg / Hour</Text>
                <Text style={styles.kpiValue}>{Number(targetData.media_hora || 0).toFixed(1)}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Median / Hour</Text>
                <Text style={styles.kpiValue}>{Number(targetData.mediana_hora || 0).toFixed(1)}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Peak Time %</Text>
                <Text style={styles.kpiValue}>{Number(targetData.pct_pico || 0).toFixed(1)}%</Text>
              </View>
            </View>
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionTitle}>best hours for {selectedGym || 'all gyms'}</Text>
              <Text style={styles.predictionText}>{predictions?.empty || "No data available"}</Text>
              <Text style={[styles.predictionTitle, styles.packedTitle]}>busiest hours for {selectedGym || 'all gyms'}</Text>
              <Text style={styles.predictionText}>{predictions?.packed || "No data available"}</Text>
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Hourly Check-ins</Text>
              {lineChartData ? (
                <LineChart
                  data={lineChartData}
                  width={screenWidth - 48}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chartStyle}
                />
              ) : (
                <Text style={styles.noData}>No hourly data available.</Text>
              )}
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Daily Volume</Text>
              {barChartData ? (
                <BarChart
                  data={barChartData}
                  width={screenWidth - 48}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  style={styles.chartStyle}
                  showBarTops={false}
                  showValuesOnTopOfBars={true}
                  withInnerLines={false}
                />
              ) : (
                <Text style={styles.noData}>No daily data available.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  backButton: {
    padding: 8,
    marginRight: 10
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700'
  },
  pillContainer: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  pillScroll: {
    paddingHorizontal: 20,
    gap: 10
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a'
  },
  pillActive: {
    backgroundColor: 'rgba(238, 50, 53, 0.2)',
    borderColor: '#ee3235'
  },
  pillText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 14
  },
  pillTextActive: {
    color: '#ee3235',
    fontWeight: '700'
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ee3235',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  kpiLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  kpiValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800'
  },
  chartCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 12,
    marginLeft: -10
  },
  errorText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16
  },
  noData: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic'
  },
  predictionContainer: {
    backgroundColor: '#0a0a0a',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6
  },
  predictionTitle: {
    color: '#ee3235',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'lowercase',
    letterSpacing: 0.5
  },
  packedTitle: {
    color: '#ff9800',
    marginTop: 20
  },
  predictionText: {
    color: '#eaeaea',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1
  }
});
