// Add a listener for write operation
//   BleManagerEmitter.addListener(
//     'BleManagerWriteCharacteristic',
//     ({peripheral, characteristic, value}) => {
//       if (peripheral.id === peripheralId && characteristic === 'fff1') {
//         console.log('Write operation successful:', value);
//       }
//     },
//   );
// };

// const subscribeToNotify = peripheralId => {
//   BleManager.retrieveServices(peripheralId)
//     .then(peripheralInfo => {
//       const serviceUUID = 'fff0';
//       const characteristicUUID = 'fff4';

//       BleManager.startNotification(
//         peripheralId,
//         serviceUUID,
//         characteristicUUID,
//       )
//         .then(() => {
//           console.log('Started receiving notifications');
//         })
//         .catch(error => {
//           console.error('Failed to start notifications:', error);
//         });

//       BleManagerEmitter.addListener(
//         'BleManagerDidUpdateValueForCharacteristic',
//         ({value, peripheral}) => {
//           if (peripheral.id === peripheralId) {
//             const receivedData = String.fromCharCode.apply(null, value);
//             console.log('Received data:', `${receivedData}`);
//           }
//         },
//       );
//     })
//     .catch(error => {
//       console.error('Failed to retrieve services:', error);
//     });
// };

// const now = new Date();

//   // Extract year, month, day, hour, minute, and second
//   const year = now.getFullYear() - 2000; // Convert to 2-digit year (00H - 63H)
//   const month = now.getMonth() + 1; // Month is zero-based (01H - 0CH)
//   const day = now.getDate(); // Day of the month (01H - 1FH)
//   const hour = now.getHours(); // Hours (00H - 17H)
//   const minute = now.getMinutes(); // Minutes (00H - 3BH)
//   const second = now.getSeconds(); // Seconds (00H - 3BH)

//   //   Calculate checksum
//   const checksum = (year + month + day + hour + minute + second + 2) & 0xff; // Ensure checksum is 8-bit

//   // Construct the data packet as a string
//   const dataPacket = [
//     0x5a,
//     0x0a,
//     0x00,
//     year,
//     month,
//     day,
//     hour,
//     minute,
//     second,
//     checksum,
//   ]
//     .map(byte => byte.toString(16).padStart(2, '0'))
//     .join('');

//   // Convert data packet to byte array
//   const data = dataPacket.match(/.{1,2}/g).map(byte => parseInt(byte, 16));



// const scanForDevice = async () => {
    //   if (!isScanning) {
    //     console.log('Scanning for device...');
    //     setIsScanning(true);
    //     try {
    //       await BleManager.scan([], 1, true);
    //       setTimeout(() => {
    //         console.log('Stopping scan...');
    //         BleManager.stopScan()
    //           .then(() => {
    //             setIsScanning(false);
    //             console.log('Scan stopped');
    //             if (!desiredDeviceFound) {
    //               setTimeout(() => {
    //                 console.log('Scanning...');
    //                 scanForDevice();
    //               }, 10000);
    //             }
    //           })
    //           .catch(error => {
    //             console.error('Failed to stop scanning:', error);
    //             setIsScanning(false);
    //             setTimeout(scanForDevice, 10000);
    //           });
    //       }, 1000);
    //     } catch (error) {
    //       console.error('Scan error:', error);
    //       setIsScanning(false);
    //       setTimeout(scanForDevice, 10000);
    //     }
    //   } else {
    //     console.log('Device already connected, not scanning');
    //   }
    // };



    // const addListener = () => {
    //     if (!listenerAdded) {
    //       BleManagerEmitter.addListener(
    //         'BleManagerDidUpdateValueForCharacteristic',
    //         async ({value, peripheral}) => {
    //           console.log('Received data:', value);
    //           const parsedData = parseReceivedData(value);
    //           if (parsedData) {
    //             console.log('Parsed data:', parsedData);

    //             // Extract relevant information from parsed data
    //             const extractedData = extractData(parsedData);

    //             // Construct JSON object in desired format
    //             const jsonData = {
    //               IMEI: peripheral.IMEI,
    //               SN: peripheral.SN,
    //               Check_Time: `${extractedData.year}-${extractedData.month}-${extractedData.day} ${extractedData.hour}:${extractedData.minute}:${extractedData.second}`,
    //               Check_Data: {
    //                 Blood_sugar_value: `${extractedData.glucoseValue} mg/dl`,
    //                 Before_or_after_meals: 1,
    //               },
    //             };

    //             try {
    //               const response = await fetch(
    //                 'http://localhost:5000/app/ble-glucose',
    //                 {
    //                   method: 'POST',
    //                   headers: {
    //                     'Content-Type': 'application/json',
    //                   },
    //                   body: JSON.stringify(jsonData),
    //                 },
    //               );

    //               if (!response.ok) {
    //                 throw new Error('Failed to send data to endpoint');
    //               }

    //               console.log('Data sent successfully');
    //             } catch (error) {
    //               console.error('Failed to send data:', error);
    //             }
    //           }
    //         },
    //       );
    //       listenerAdded = true;
    //     }
    //   };