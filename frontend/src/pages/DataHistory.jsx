import { Card, Table, Button, Tag, Typography, Space, message, Tooltip } from 'antd';
import { Download, RefreshCw, Eye, Bot, Sparkles, Scan, User} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sensorApi } from '../api/api'; 
import './CSS/DataHistory.css';

const { Title, Text } = Typography;

export function DataHistory() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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
        if (s.label === 'Nhiệt độ') {
          if (s.value > 40 || s.value < 10) status = 'critical';
          else if (s.value > 35 || s.value < 15) status = 'warning'; 
        }
        if (s.label === 'Độ ẩm đất') {
          if (s.value < 10 || s.value > 95) status = 'critical';
          else if (s.value < 30 || s.value > 85) status = 'warning'; 
        }
        if (s.label === 'Độ ẩm khí' && (s.value < 20 || s.value > 95)) {
          status = 'warning';
        }
      
        formatted.push({
          key: `${entry._id}-${s.id}`,
          rawId: entry._id,
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

  const handleViewDetail = async (id) => {
    try {
      const res = await sensorApi.getById(id);
      const d = res.data;
      const timeStr = new Date(d.timestamp).toLocaleString('vi-VN');

      message.info({
        content: (
          <div className="detail-content-wrapper">
            <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '8px' }}>
              Thông tin chi tiết tại {timeStr}:
            </Text>
            <div className="detail-item"><span>- Nhiệt độ:</span> <Text strong>{d.temperature}°C</Text></div>
            <div className="detail-item"><span>- Độ ẩm khí:</span> <Text strong>{d.airHumidity}%</Text></div>
            <div className="detail-item"><span>- Độ ẩm đất:</span> <Text strong>{d.soilMoisture}%</Text></div>
            <div className="detail-item"><span>- Ánh sáng:</span> <Text strong>{d.light} lux</Text></div>
            
            <div className="detail-action-footer">
              <Button
                type="primary" 
                className="ai-analyze-btn"
                size="middle"
                icon={<Bot size={16} />}
                onClick={() => {
                  navigate('/assistant', { state: { sensorData: d, analyzeAt: timeStr } });
                  message.destroy();
                }}
              >
                Phân tích
              </Button>
            </div>
          </div>
        ),
        duration: 15,
        icon: <Scan size={36} color= "#22C55E" > <User size={16} x={4} y={4} color="#22C55E" /> </Scan>,
        width: 350
      });
    } catch (err) {
      message.error("Lỗi khi lấy thông tin chi tiết!");
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) return message.warning("Không có dữ liệu để xuất!");
    const headers = ['Thời gian', 'Mã thiết bị', 'Thông số', 'Giá trị', 'Đơn vị', 'Trạng thái'];
    const csvContent = [
      headers.join(','),
      ...data.map((row) => [row.timestamp, row.deviceId, row.parameter, row.value, row.unit, row.status].join(','))
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
    { title: 'Thông số', dataIndex: 'parameter', key: 'parameter' },
    {
      title: 'Giá trị',
      key: 'value',
      render: (_, record) => (
        <Text strong className="value-text">
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
        const colorMap = { normal: '#22C55E', warning: '#F59E0B', critical: '#EF4444' };
        return (
          <Tag color={colorMap[status]} className="history-status-tag">
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<Eye size={18} color="#3B82F6" />} 
              onClick={() => handleViewDetail(record.rawId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>Lịch sử dữ liệu</Title>
          <Text className="history-header-subtitle">Dữ liệu chi tiết từ các cảm biến theo thời gian</Text>
        </div>
        <Space>
          <Button icon={<RefreshCw size={16} />} onClick={fetchData} loading={loading} className="history-refresh-btn">
            Làm mới
          </Button>
          <Button icon={<Download size={16} />} onClick={exportToCSV} className="history-export-btn">
            Xuất CSV
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="history-card">
        <Table
          className="history-table"
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
        />
      </Card>
    </div>
  );
}