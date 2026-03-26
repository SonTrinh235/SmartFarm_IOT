import { Card, Row, Col, Switch, Statistic, Typography, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Thermometer, Droplets, Sprout, Sun, Power } from 'lucide-react';
import { useYoloBit } from '../context/YoloBitContext.jsx';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { sensorApi, deviceApi } from '../api/api';
import './CSS/Dashboard.css';

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

  const fetchData = useCallback(async () => {
    try {
      const [latest, history] = await Promise.all([
        sensorApi.getLatest(),
        sensorApi.getHistory()
      ]);

      setLocalData(latest.data);
      if (setSensorData) setSensorData(latest.data);

      const formatted = history.data.slice(-24).reverse().map(item => ({
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
  }, [setSensorData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
        <Card className="stat-card" variant="none" styles={{ body: { padding: '20px' } }}>
          <div className="stat-content">
            <div className="icon-box" style={{ background: bgColor }}>
              <IconComponent size={24} color={color} />
            </div>
            <div className="stat-info">
              <Text type="secondary" className="stat-label">{title}</Text>
              {isAvailable ? (
                <Statistic 
                  value={Number(value)} 
                  suffix={suffix} 
                  precision={1}
                  valueStyle={{ fontSize: '24px', fontWeight: 600, color: color, lineHeight: 1.2 }} 
                />
              ) : (
                <Text strong className="stat-unavailable">Unavailable</Text>
              )}
              <Text className="stat-desc">{description}</Text>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

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
    <div className="dashboard-container">
      {contextHolder}
      <div className="header-section">
        <Title level={3} style={{ margin: 0 }}>Hệ thống giám sát</Title>
        <Text type="secondary">
          {localData?.isOnline ? "Trạm đang kết nối" : "Mất kết nối với thiết bị"}
        </Text>
      </div>

      <Row gutter={[16, 16]} className="stat-row">
        {renderStatCard('Nhiệt độ', localData?.temperature, '°C', '#3B82F6', '#EFF6FF', 'Môi trường hiện tại', Thermometer)}
        {renderStatCard('Độ ẩm khí', localData?.airHumidity, '%', '#10B981', '#F0FDF4', 'Độ ẩm không khí', Droplets)}
        {renderStatCard('Độ ẩm đất', localData?.soilMoisture, '%', '#F59E0B', '#FFFBEB', 'Cảm biến đất P0', Sprout)}
        {renderStatCard('Ánh sáng', localData?.light, ' lux', '#6366F1', '#EEF2FF', 'Cảm biến ánh sáng', Sun)}
      </Row>

      <Card title={<Text strong>Biểu đồ xu hướng thực tế</Text>} variant="none" className="chart-card">
        <div className="chart-wrapper">
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

      <Card title={<Text strong>Điều khiển thiết bị</Text>} variant="none" className="device-card">
        <Row gutter={[16, 16]}>
          {devices.map(device => {
            const active = !!deviceStatus[device.key];
            const isUnavailable = !device.isAvailable;
            return (
              <Col xs={24} sm={12} lg={6} key={device.key}>
                <div className="device-item" style={{ 
                  background: isUnavailable ? '#f5f5f5' : (active ? '#F0FDF4' : '#F9FAFB'), 
                  borderColor: isUnavailable ? '#d9d9d9' : (active ? '#22C55E' : '#E5E7EB'),
                  opacity: isUnavailable ? 0.7 : 1,
                }}>
                  <div className="device-item-top">
                    <div className="device-label-group">
                      <Power size={20} color={isUnavailable ? '#bfbfbf' : (active ? '#22C55E' : '#6B7280')} />
                      <Text strong style={{ color: isUnavailable ? '#bfbfbf' : (active ? '#16A34A' : 'inherit') }}>{device.label}</Text>
                    </div>
                    <Switch 
                      checked={active} 
                      onChange={(val) => handleToggle(device.key, val)} 
                      disabled={isUnavailable} 
                    />
                  </div>
                  <Text type="secondary" className="device-pin-text">
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