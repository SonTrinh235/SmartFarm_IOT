import { Card, Row, Col, Switch, Statistic, Typography, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Thermometer, Droplets, Sprout, Sun, Power } from 'lucide-react';
import { useYoloBit } from '../context/YoloBitContext.jsx';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { sensorApi, deviceApi } from '../api/api';

const { Title, Text } = Typography;

export function Dashboard() {
  const { setSensorData } = useYoloBit();
  const [localData, setLocalData] = useState(null); 
  const [historicalData, setHistoricalData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  
  const [deviceStatus, setDeviceStatus] = useState({
    waterPump: false,
    ledGrowLight: false,
    exhaustFan: false,
    servoRoof: false,
  });

  const fetchHistory = useCallback(async () => {
    try {
      const res = await sensorApi.getHistory();
      const formatted = res.data.slice(-24).reverse().map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        temperature: item.temperature,
        humidity: item.airHumidity,
        soilMoisture: item.soilMoisture,
        light: item.light,
      }));
      setHistoricalData(formatted);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await sensorApi.getLatest();
      setLocalData(res.data);
      if (setSensorData) setSensorData(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [setSensorData]);

  useEffect(() => {
    fetchLatest();
    fetchHistory();
    const interval = setInterval(() => {
      fetchLatest();
      fetchHistory();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLatest, fetchHistory]);

  const handleToggle = async (key, val) => {
    try {
      const valueToSend = val ? 1 : 0;
      if (key === 'exhaustFan') await deviceApi.controlFan(valueToSend);
      else if (key === 'waterPump') await deviceApi.controlPump(valueToSend);

      setDeviceStatus(prev => ({ ...prev, [key]: val }));
      messageApi.success(`Đã ${val ? 'bật' : 'tắt'} thành công`);
    } catch (err) {
      messageApi.error("Điều khiển thất bại");
    }
  };

  const renderStatCard = (title, value, suffix, color, bgColor, description, IconComponent) => {
    const isAvailable = value !== null && value !== undefined;
    return (
      <Col xs={24} sm={12} lg={6} key={title}>
        <Card 
          variant="none"
          styles={{ body: { padding: '20px' } }} 
          style={{ borderRadius: '12px', height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              width: '48px', height: '48px', background: bgColor, borderRadius: '10px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
            }}>
              <IconComponent size={24} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>{title}</Text>
              {isAvailable ? (
                <Statistic value={Number(value)} suffix={suffix} precision={1}
                  styles={{ content: { fontSize: '24px', fontWeight: 600, color: color, lineHeight: 1.2 } }} 
                />
              ) : (
                <Text strong style={{ fontSize: '18px', color: '#9ca3af', lineHeight: '32px' }}>Unavailable</Text>
              )}
              <Text style={{ fontSize: '12px', color: '#9ca3af' }}>{description}</Text>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  // Logic mới: Thiết bị chỉ available khi trạm sensor đang online (res.data.isOnline === true)
  const devices = useMemo(() => {
    const isOnline = localData?.isOnline;
    return [
      { key: 'waterPump', label: 'Máy bơm', pin: 'P1', isAvailable: isOnline },
      { key: 'ledGrowLight', label: 'Đèn LED', pin: 'P2', isAvailable: isOnline },
      { key: 'exhaustFan', label: 'Quạt hút', pin: 'P8', isAvailable: isOnline },
      { key: 'servoRoof', label: 'Mái che', pin: 'P12', isAvailable: isOnline }
    ];
  }, [localData]);

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Hệ thống giám sát</Title>
        <Text type="secondary">
            {localData?.isOnline ? "Trạm đang kết nối" : "Mất kết nối với thiết bị"}
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {renderStatCard('Nhiệt độ', localData?.temperature, '°C', '#3B82F6', '#EFF6FF', 'Môi trường hiện tại', Thermometer)}
        {renderStatCard('Độ ẩm khí', localData?.airHumidity, '%', '#10B981', '#F0FDF4', 'Độ ẩm không khí', Droplets)}
        {renderStatCard('Độ ẩm đất', localData?.soilMoisture, '%', '#F59E0B', '#FFFBEB', 'Cảm biến đất P0', Sprout)}
        {renderStatCard('Ánh sáng', localData?.light, ' lux', '#6366F1', '#EEF2FF', 'Cảm biến ánh sáng', Sun)}
      </Row>

      <Card title={<Text strong>Biểu đồ xu hướng thực tế</Text>} variant="none" style={{ borderRadius: '12px', marginBottom: '24px' }}>
        <div style={{ width: '100%', height: 350, minWidth: 0 }}> 
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="temperature" stroke="#3B82F6" strokeWidth={3} dot={false} name="Nhiệt độ (°C)" />
              <Line type="monotone" dataKey="humidity" stroke="#10B981" strokeWidth={3} dot={false} name="Độ ẩm khí (%)" />
              <Line type="monotone" dataKey="soilMoisture" stroke="#F59E0B" strokeWidth={3} dot={false} name="Độ ẩm đất (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title={<Text strong>Điều khiển thiết bị</Text>} variant="none" style={{ borderRadius: '12px' }}>
        <Row gutter={[16, 16]}>
          {devices.map(device => {
            const active = !!deviceStatus[device.key];
            const isUnavailable = !device.isAvailable;
            return (
              <Col xs={24} sm={12} lg={6} key={device.key}>
                <div style={{ 
                  padding: '20px', 
                  background: isUnavailable ? '#f5f5f5' : (active ? '#F0FDF4' : '#F9FAFB'), 
                  borderRadius: '12px', 
                  border: `2px solid ${isUnavailable ? '#d9d9d9' : (active ? '#22C55E' : '#E5E7EB')}`,
                  opacity: isUnavailable ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Power size={20} color={isUnavailable ? '#bfbfbf' : (active ? '#22C55E' : '#6B7280')} />
                      <Text strong style={{ color: isUnavailable ? '#bfbfbf' : (active ? '#16A34A' : 'inherit') }}>{device.label}</Text>
                    </div>
                    <Switch 
                      checked={active} 
                      onChange={(val) => handleToggle(device.key, val)} 
                      disabled={isUnavailable} 
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {isUnavailable ? 'Disconnected' : `Chân cắm: ${device.pin}`}
                  </Text>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    </div>
  );
}