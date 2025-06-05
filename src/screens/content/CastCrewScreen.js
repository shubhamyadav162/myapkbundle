import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CastCrewScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cast & Crew Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CastCrewScreen; 
