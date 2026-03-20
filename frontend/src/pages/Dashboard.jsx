import { Card, Row, Col, Switch, Statistic, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Thermometer, Droplets, Sprout, Sun, Power } from 'lucide-react';
import { useYoloBit } from '../context/YoloBitContext.jsx';
import { useState, useEffect, useMemo } from 'react';

const { Title, Text } = Typography;

const generateHistoricalData = () => {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      temperature: Number((20 + Math.random() * 8).toFixed(1)),
      humidity: Number((55 + Math.random() * 20).toFixed(1)),
      soilMoisture: Number((35 + Math.random() * 20).toFixed(1)),
    });
  }
  return data;
};

export function Dashboard() {
  const { sensorData, deviceControls, updateDeviceControls } = useYoloBit();
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());

  useEffect(() => {
    const interval = setInterval(() => setHistoricalData(generateHistoricalData()), 60000);
    return () => clearInterval(interval);
  }, []);

  const renderStatCard = (title, value, suffix, color, bgColor, description, IconComponent) => (
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
            <Statistic 
              value={Number(value) || 0} 
              suffix={suffix} 
              precision={1}
              styles={{ 
                content: { fontSize: '24px', fontWeight: 600, color: color, lineHeight: 1.2 } 
              }} 
            />
            <Text style={{ fontSize: '12px', color: '#9ca3af' }}>{description}</Text>
          </div>
        </div>
      </Card>
    </Col>
  );

  const devices = useMemo(() => [
    { key: 'waterPump', label: 'Máy bơm', pin: 'P1' },
    { key: 'ledGrowLight', label: 'Đèn LED', pin: 'P2' },
    { key: 'exhaustFan', label: 'Quạt hút', pin: 'P8' },
    { key: 'servoRoof', label: 'Mái che', pin: 'P12' }
  ], []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Hệ thống giám sát</Title>
        <Text type="secondary">Dữ liệu thời gian thực từ trạm Yolo:Bit</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {renderStatCard('Nhiệt độ', sensorData?.temperature, '°C', '#3B82F6', '#EFF6FF', 'Môi trường hiện tại', Thermometer)}
        {renderStatCard('Độ ẩm khí', sensorData?.airHumidity, '%', '#10B981', '#F0FDF4', 'Độ ẩm không khí', Droplets)}
        
        {/* ĐỔI MÀU VÀNG CHO ĐỘ ẨM ĐẤT */}
        {renderStatCard('Độ ẩm đất', sensorData?.soilMoisture, '%', '#F59E0B', '#FFFBEB', 'Cảm biến chân P0', Sprout)}
        
        {renderStatCard('Ánh sáng', sensorData?.light, ' lux', '#6366F1', '#EEF2FF', 'Cảm biến tích hợp', Sun)}
      </Row>

      <Card 
        title={<Text strong>Biểu đồ xu hướng (24h)</Text>} 
        variant="none"
        style={{ borderRadius: '12px', marginBottom: '24px' }}
      >
        <div style={{ width: '100%', height: 350, minWidth: 0 }}> 
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              
              <Line type="monotone" dataKey="temperature" stroke="#3B82F6" strokeWidth={3} dot={false} name="Nhiệt độ (°C)" />
              <Line type="monotone" dataKey="humidity" stroke="#10B981" strokeWidth={3} dot={false} name="Độ ẩm khí (%)" />
              
              {/* ĐƯỜNG MÀU VÀNG CHO ĐỘ ẨM ĐẤT */}
              <Line type="monotone" dataKey="soilMoisture" stroke="#F59E0B" strokeWidth={3} dot={false} name="Độ ẩm đất (%)" />
              
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title={<Text strong>Điều khiển thiết bị</Text>} variant="none" style={{ borderRadius: '12px' }}>
        <Row gutter={[16, 16]}>
          {devices.map(device => {
            const active = !!deviceControls?.[device.key];
            return (
              <Col xs={24} sm={12} lg={6} key={device.key}>
                <div style={{ 
                  padding: '20px', 
                  background: active ? '#F0FDF4' : '#F9FAFB', 
                  borderRadius: '12px', 
                  border: `2px solid ${active ? '#22C55E' : '#E5E7EB'}`,
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Power size={20} color={active ? '#22C55E' : '#6B7280'} />
                      <Text strong style={{ color: active ? '#16A34A' : 'inherit' }}>{device.label}</Text>
                    </div>
                    <Switch 
                      checked={active} 
                      onChange={(val) => updateDeviceControls({ [device.key]: val })} 
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Chân cắm: {device.pin}</Text>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    </div>
  );
}