// useBLE.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react';
import {
  PermissionsAndroid,
  Platform,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {writeCurrentDateTimeToDevice} from './writeBLE';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const useBLE = () => {
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [desiredDeviceFound, setDesiredDeviceFound] = useState(false);

  const handleLocationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ]);

        if (
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_COARSE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_ADVERTISE'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Location and Bluetooth permissions granted');
        } else {
          console.log('Location and/or Bluetooth permissions denied');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    }
  };

  const handleGetConnectedDevices = async () => {
    try {
      const results = await BleManager.getBondedPeripherals([]);
      for (let i = 0; i < results.length; i++) {
        let peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
      }
    } catch (error) {
      console.error('Failed to get bonded peripherals:', error);
    }
  };

  useEffect(() => {
    handleLocationPermission();

    BleManager.enableBluetooth().then(() => {
      console.log('Bluetooth is turned on!');
    });

    BleManager.start({showAlert: false})
      .then(() => {
        console.log('BleManager initialized');
        handleGetConnectedDevices();
      })
      .catch(error => {
        console.error('Failed to initialize BleManager:', error);
      });

    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      async peripheral => {
        try {
          if (!peripherals.has(peripheral.id)) {
            peripherals.set(peripheral.id, peripheral);
            setDiscoveredDevices(Array.from(peripherals.values()));
            if (peripheral.name === 'Samico GL') {
              await connect(peripheral);
              console.log('Connecting to the desired device:');
              await BleManager.stopScan();
              setIsScanning(false);
              setDesiredDeviceFound(true);
            }
          }
        } catch (error) {
          console.error('Error during device discovery:', error);
        }
      },
    );

    let stopScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('scan stopped');
      },
    );

    return () => {
      stopDiscoverListener.remove();
      stopScanListener.remove();
    };
  }, []);

  const scan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  // Call the function with the peripheral ID of the connected device

  const connect = async peripheral => {
    try {
      // Connect to the peripheral
      await BleManager.connect(peripheral.id);
      peripheral.connected = true;
      peripherals.set(peripheral.id, peripheral);
      const devices = Array.from(peripherals.values());
      setConnectedDevices(devices);
      setDiscoveredDevices(devices);

      console.log('Connected to the BLE device successfully', peripheral.id);

      // Wait for another 10 seconds before calling writeCurrentDateTimeToDevice function
      await delay(5000);

      // Call the writeCurrentDateTimeToDevice function
      await writeCurrentDateTimeToDevice(peripheral.id);

      // Stop scanning for devices
      await BleManager.stopScan();
      setIsScanning(false);
      console.log('Scan stopped');
    } catch (error) {
      console.error('Failed to connect to the BLE device:', error);
    }
  };

  // Function to introduce delay using setTimeout wrapped in a Promise
  const delay = milliseconds => {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  };

  const disconnect = async peripheral => {
    try {
      await BleManager.disconnect(peripheral.id);
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      let devices = Array.from(peripherals.values());
      setConnectedDevices(Array.from(devices));
      setDiscoveredDevices(Array.from(devices));
      console.log('Disconnected from the BLE device successfully');
    } catch (error) {
      console.error('Failed to disconnect from the BLE device:', error);
    }
  };

  return {
    isScanning,
    discoveredDevices,
    connectedDevices,
    scan,
    connect,
    disconnect,
  };
};

export default useBLE;
