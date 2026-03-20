import { createContext, useContext, useState } from 'react';

const YoloBitContext = createContext(undefined);

export function YoloBitProvider({ children }) {
  const [isConnected, setIsConnected] = useState(true); // Default to connected for demo
  const [sensorData, setSensorData] = useState({
    temperature: 24.5,
    airHumidity: 65,
    soilMoisture: 42,
    light: 850,
  });
  const [deviceControls, setDeviceControls] = useState({
    waterPump: false,
    ledGrowLight: true,
    exhaustFan: false,
    servoRoof: true,
  });

  const updateSensorData = (data) => {
    setSensorData((prev) => ({ ...prev, ...data }));
  };

  const updateDeviceControls = (controls) => {
    setDeviceControls((prev) => ({ ...prev, ...controls }));
  };

  return (
    <YoloBitContext.Provider
      value={{
        isConnected,
        setIsConnected,
        sensorData,
        updateSensorData,
        deviceControls,
        updateDeviceControls,
      }}
    >
      {children}
    </YoloBitContext.Provider>
  );
}

export function useYoloBit() {
  const context = useContext(YoloBitContext);
  if (context === undefined) {
    throw new Error('useYoloBit must be used within a YoloBitProvider');
  }
  return context;
}
