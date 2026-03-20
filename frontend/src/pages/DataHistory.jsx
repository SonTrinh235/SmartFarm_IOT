import { Card, Table, Button, Tag, Typography, Space } from 'antd';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

const { Title, Text } = Typography;

// Mock data for the table
const generateMockData = () => {
  const devices = ['Temp Sensor', 'Humidity Sensor', 'Soil Sensor', 'Light Sensor'];
  const parameters = ['Temperature', 'Air Humidity', 'Soil Moisture', 'Light Intensity'];
  const units = ['°C', '%', '%', 'lux'];
  const statuses = ['normal', 'normal', 'normal', 'warning'];

  const data = [];
  const now = Date.now();

  for (let i = 0; i < 50; i++) {
    const index = i % 4;
    const timestamp = new Date(now - i * 15 * 60 * 1000); // Every 15 minutes
    
    let value = 0;
    if (parameters[index] === 'Temperature') value = 20 + Math.random() * 8;
    else if (parameters[index] === 'Air Humidity') value = 55 + Math.random() * 20;
    else if (parameters[index] === 'Soil Moisture') value = 35 + Math.random() * 20;
    else value = 700 + Math.random() * 300;

    data.push({
      key: `data-${i}`,
      timestamp: timestamp.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      deviceId: devices[index],
      parameter: parameters[index],
      value: parseFloat(value.toFixed(1)),
      unit: units[index],
      status: value > 70 || value < 15 ? 'warning' : statuses[index],
    });
  }

  return data;
};

export function DataHistory() {
  const [data] = useState(generateMockData());
  const [loading, setLoading] = useState(false);

  const exportToCSV = () => {
    setLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      const headers = ['Timestamp', 'Device ID', 'Parameter', 'Value', 'Unit', 'Status'];
      const csvContent = [
        headers.join(','),
        ...data.map((row) =>
          [row.timestamp, row.deviceId, row.parameter, row.value, row.unit, row.status].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `farm_data_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLoading(false);
    }, 500);
  };

  const exportToExcel = () => {
    setLoading(true);
    
    // Mock Excel export - in production, use a library like xlsx
    setTimeout(() => {
      console.log('Exporting to Excel format...');
      alert('Excel export would use a library like xlsx in production');
      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      filters: [
        { text: 'Temp Sensor', value: 'Temp Sensor' },
        { text: 'Humidity Sensor', value: 'Humidity Sensor' },
        { text: 'Soil Sensor', value: 'Soil Sensor' },
        { text: 'Light Sensor', value: 'Light Sensor' },
      ],
      onFilter: (value, record) => record.deviceId === value,
    },
    {
      title: 'Parameter',
      dataIndex: 'parameter',
      key: 'parameter',
    },
    {
      title: 'Value',
      key: 'value',
      render: (_, record) => (
        <Text strong style={{ color: '#1f2937' }}>
          {record.value} {record.unit}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Normal', value: 'normal' },
        { text: 'Warning', value: 'warning' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const colorMap = {
          normal: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
        };
        return (
          <Tag color={colorMap[status]} style={{ borderRadius: '6px' }}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
            Data History
          </Title>
          <Text style={{ color: '#6b7280' }}>Historical sensor data and logs</Text>
        </div>
        <Space>
          <Button
            icon={<Download size={16} />}
            onClick={exportToCSV}
            loading={loading}
            style={{
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<FileSpreadsheet size={16} />}
            onClick={exportToExcel}
            loading={loading}
            style={{
              borderRadius: '8px',
              background: '#22C55E',
              borderColor: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Export Excel
          </Button>
        </Space>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
            style: { marginTop: '16px' },
          }}
          scroll={{ x: 800 }}
          style={{
            fontSize: '14px',
          }}
        />
      </Card>
    </div>
  );
}
