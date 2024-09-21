import BleManager from 'react-native-ble-manager';
import {NativeEventEmitter, NativeModules} from 'react-native';
import parseReceivedData from './processDATA';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const writeCurrentDateTimeToDevice = async peripheralId => {
  const currentDate = new Date();
  const year = currentDate.getFullYear() - 2000; // Local year
  const month = currentDate.getMonth() + 1;      // Local month (0-indexed, hence +1)
  const day = currentDate.getDate();             // Local day of the month
  const hour = currentDate.getHours();           // Local hour
  const minute = currentDate.getMinutes();       // Local minute
  const second = currentDate.getSeconds(); // Second

  // Calculate checksum
  let checksum = 0;
  for (let i = 1; i <= 9; i++) {
    checksum += i === 1 ? 0x5a : i === 9 ? 2 : 0; // 0x5A for Initial Byte Code, 2 for Check Sum
    switch (i) {
      case 2:
        checksum += 0x0a;
        break; // Packet Length
      case 3:
        checksum += 0x00;
        break; // Packet Type
      case 4:
        checksum += year;
        break;
      case 5:
        checksum += month;
        break;
      case 6:
        checksum += day;
        break;
      case 7:
        checksum += hour;
        break;
      case 8:
        checksum += minute;
        break;
      case 9:
        checksum += second;
        break;
    }
  }

  // Construct data packet
  const dataPacket = [
    0x5a,
    0x0a,
    0x00,
    year,
    month,
    day,
    hour,
    minute,
    second,
    checksum,
  ];

  const serviceUUID = '0000fff0-0000-1000-8000-00805f9b34fb';
  const writeUUID = '0000fff1-0000-1000-8000-00805f9b34fb';
  const notifyUUID = '0000fff4-0000-1000-8000-00805f9b34fb';

  try {
    BleManager.retrieveServices(peripheralId).then(async peripheralInfo => {
      console.log('Device info received:');

      let listenerAdded = false;

      const addListener = () => {
        if (!listenerAdded) {
          BleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({value, peripheral}) => {
              console.log('Received data:', value);
              const parsedData = parseReceivedData(value);
              if (parsedData) {
                console.log('Parsed data:', parsedData);
              }
            },
          );
          listenerAdded = true;
        }
      };

      try {
        await BleManager.startNotification(
          peripheralId,
          serviceUUID,
          notifyUUID,
        );
        console.log('Started receiving notifications');
      } catch (error) {
        console.error(
          'Could not start notifications for the characteristic:',
          error,
        );
        throw error;
      }

      // Write data to the write characteristic
      try {
        await BleManager.writeWithoutResponse(
          peripheralId,
          serviceUUID,
          writeUUID,
          dataPacket,
        );
        console.log('Data written successfully:', `${dataPacket}`);
        addListener();
      } catch (error) {
        console.error('Failed to write data:', error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Failed:', error);
  }
};

export {writeCurrentDateTimeToDevice};
