import { createContext, useContext, useState, useEffect } from 'react';
import { sensorApi } from '../api/api';

const YoloBitContext = createContext();

export const YoloBitProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({
    temperature: 0, airHumidity: 0, soilMoisture: 0, light: 0
  });

  const updateData = async () => {
    try {
      const res = await sensorApi.getHistory();
      if (res.data && res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        setSensorData(latest);
      }
    } catch (err) {
      console.error("Kết nối Backend thất bại");
    }
  };

  // useEffect(() => {
  //   updateData();
  //   const timer = setInterval(updateData, 5000);
  //   return () => clearInterval(timer);
  // }, []);
  useEffect(() => {
    updateData();
    const REFRESH_INTERVAL = 5 * 60 * 1000; 

    const timer = setInterval(updateData, REFRESH_INTERVAL);
    return () => clearInterval(timer);
}, []);

  return (
    <YoloBitContext.Provider value={{ sensorData }}>
      {children}
    </YoloBitContext.Provider>
  );
};

export const useYoloBit = () => useContext(YoloBitContext);