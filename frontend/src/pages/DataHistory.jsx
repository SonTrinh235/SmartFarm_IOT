import { Card, Table, Button, Tag, Typography, Space, message } from 'antd';
import { Download, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { sensorApi } from '../api/api'; 

const { Title, Text } = Typography;

export function DataHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm chuyển đổi dữ liệu từ cấu trúc MongoDB (Ngang) sang Table Antd (Dọc)
  const formatDataForTable = (rawList) => {
    const formatted = [];
    rawList.forEach((entry) => {
      const time = new Date(entry.timestamp).toLocaleString('vi-VN');
      
      const sensors = [
        { label: 'Nhiệt độ', value: entry.temperature, unit: '°C', id: 'Temp-01' },
        { label: 'Độ ẩm khí', value: entry.airHumidity, unit: '%', id: 'Humi-01' },
        { label: 'Độ ẩm đất', value: entry.soilMoisture, unit: '%', id: 'Soil-01' },
        { label: 'Ánh sáng', value: entry.light, unit: 'lux', id: 'Light-01' }
      ];

      sensors.forEach((s, sIdx) => {
        let status = 'normal';
        if (s.label === 'Nhiệt độ' && (s.value > 35 || s.value < 15)) status = 'warning';
        if (s.label === 'Độ ẩm đất' && s.value < 30) status = 'warning';
        if (s.label === 'Độ ẩm đất' && s.value < 10) status = 'critical';

        formatted.push({
          key: `${entry._id}-${sIdx}`,
          timestamp: time,
          rawTime: new Date(entry.timestamp).getTime(),
          deviceId: s.id,
          parameter: s.label,
          value: s.value,
          unit: s.unit,
          status: status,
        });
      });
    });
    return formatted;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sensorApi.getHistory();
      setData(formatDataForTable(res.data));
    } catch (err) {
      message.error("Không thể tải dữ liệu từ Server!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportToCSV = () => {
    if (data.length === 0) return message.warning("Không có dữ liệu để xuất!");
    
    const headers = ['Thời gian', 'Mã thiết bị', 'Thông số', 'Giá trị', 'Đơn vị', 'Trạng thái'];
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [row.timestamp, row.deviceId, row.parameter, row.value, row.unit, row.status].join(',')
      ),
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement('a'));
    link.href = url;
    link.download = `FarmData_History_${new Date().getTime()}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
      sorter: (a, b) => a.rawTime - b.rawTime,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Mã thiết bị',
      dataIndex: 'deviceId',
      key: 'deviceId',
      filters: [
        { text: 'Temp Sensor', value: 'Temp-01' },
        { text: 'Humi Sensor', value: 'Humi-01' },
        { text: 'Soil Sensor', value: 'Soil-01' },
        { text: 'Light Sensor', value: 'Light-01' },
      ],
      onFilter: (value, record) => record.deviceId === value,
    },
    {
      title: 'Thông số',
      dataIndex: 'parameter',
      key: 'parameter',
    },
    {
      title: 'Giá trị',
      key: 'value',
      render: (_, record) => (
        <Text strong style={{ color: '#1f2937' }}>
          {record.value} {record.unit}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
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
    <div style={{ padding: '2px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
            Lịch sử dữ liệu
          </Title>
          <Text style={{ color: '#6b7280' }}>Dữ liệu chi tiết từ các cảm biến theo thời gian</Text>
        </div>
        <Space>
          <Button 
            icon={<RefreshCw size={16} />} 
            onClick={fetchData} 
            loading={loading}
            style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Làm mới
          </Button>
          <Button
            icon={<Download size={16} />}
            onClick={exportToCSV}
            style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Xuất CSV
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
          loading={loading}
          pagination={{
            pageSize: 12,
            showSizeChanger: true,
            pageSizeOptions: ['12', '24', '48'],
            showTotal: (total) => `Tổng cộng ${total} bản ghi`,
          }}
          scroll={{ x: 800 }}
          style={{ fontSize: '14px' }}
        />
      </Card>
    </div>
  );
}