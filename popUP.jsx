import React from 'react';
import {View, Text} from 'react-native';
import {styles} from './src/styles/styles'; // Import your styles from the appropriate location

const BluetoothStatusPopup = () => {
  return (
    <View style={styles.popup}>
      <Text style={styles.popupText}>
        Now connected to Bluetooth Glucometer
      </Text>
      <Text style={styles.popupText}>Waiting for data...</Text>
    </View>
  );
};

export default BluetoothStatusPopup;
