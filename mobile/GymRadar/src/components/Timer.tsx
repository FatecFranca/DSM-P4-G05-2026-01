import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Timer = () => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

const hh = now.getHours().toString().padStart(2, '0');
const mm = now.getMinutes().toString().padStart(2, '0');
const ss = now.getSeconds().toString().padStart(2, '0');
const timeStr = `${hh}:${mm}:${ss}`;

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{timeStr}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    padding: 10,
  },
  container:{
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    borderColor: '#ff0000ff',
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  }
});

export default Timer;