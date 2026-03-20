import { Card, Input, Button, Typography, Avatar, Space } from 'antd';
import { Send, Bot, User, Droplets, Thermometer, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const quickActions = [
  { icon: <Droplets size={16} />, label: 'Check Soil Health', action: 'soil-health' },
  { icon: <Thermometer size={16} />, label: 'Temperature Alert', action: 'temp-alert' },
  { icon: <AlertCircle size={16} />, label: 'System Status', action: 'system-status' },
  { icon: <CheckCircle size={16} />, label: 'Optimize Settings', action: 'optimize' },
];

const mockResponses = {
  'soil-health': 'Based on current readings, your soil moisture is at 42%, which is optimal for most vegetables. The sensor on pin P0 shows stable readings. Consider watering when it drops below 35%.',
  'temp-alert': 'Current temperature is 24.5°C, which is within the ideal range (20-28°C) for most crops. No alerts at this time. The system will notify you if temperature exceeds safe thresholds.',
  'system-status': 'All systems operational:\n✓ Water Pump (P1): Ready\n✓ LED Grow Light (P2): Active\n✓ Exhaust Fan (P8): Standby\n✓ Servo Roof (P12): Open\n✓ All sensors: Connected',
  'optimize': 'Recommendation: Your current light intensity (850 lux) is good for vegetative growth. Consider increasing LED brightness by 15% during morning hours for optimal photosynthesis. Soil moisture is stable.',
};

export function Assistant() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your Smart Farm AI Assistant. I can help you monitor your farm, analyze sensor data, and provide recommendations. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (message) => {
    const textToSend = message || inputValue.trim();
    if (!textToSend) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(textToSend);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('soil') || input.includes('moisture')) {
      return mockResponses['soil-health'];
    }
    if (input.includes('temperature') || input.includes('temp')) {
      return mockResponses['temp-alert'];
    }
    if (input.includes('status') || input.includes('system')) {
      return mockResponses['system-status'];
    }
    if (input.includes('optimize') || input.includes('recommend')) {
      return mockResponses['optimize'];
    }
    if (input.includes('water')) {
      return 'Based on the current soil moisture level of 42%, your plants are adequately hydrated. The water pump (P1) is ready to activate when moisture drops below 35%. Would you like me to schedule an automatic watering routine?';
    }
    if (input.includes('light')) {
      return 'Your LED grow light (P2) is currently active, providing 850 lux of illumination. This is suitable for most leafy greens and herbs. For flowering plants, you might want to increase intensity by 20-30%.';
    }
    
    return 'I understand you\'re asking about your farm system. Could you please be more specific? I can help with:\n• Sensor data analysis\n• Device control recommendations\n• Alert notifications\n• Optimization suggestions\n• Troubleshooting';
  };

  const handleQuickAction = (action) => {
    const actionLabels = {
      'soil-health': 'Check Soil Health',
      'temp-alert': 'Check Temperature Status',
      'system-status': 'Show System Status',
      'optimize': 'Provide Optimization Tips',
    };
    
    handleSend(actionLabels[action]);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
          AI Assistant
        </Title>
        <Text style={{ color: '#6b7280' }}>Get intelligent insights and recommendations</Text>
      </div>

      {/* Quick Actions */}
      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          marginBottom: '16px',
        }}
      >
        <Text strong style={{ display: 'block', marginBottom: '12px', color: '#1f2937' }}>
          Quick Actions
        </Text>
        <Space wrap>
          {quickActions.map((action) => (
            <Button
              key={action.action}
              icon={action.icon}
              onClick={() => handleQuickAction(action.action)}
              style={{
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      </Card>

      {/* Chat Interface */}
      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          height: 'calc(100vh - 320px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{
          padding: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: '#F8FAFC',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px',
                flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                icon={message.type === 'user' ? <User size={18} /> : <Bot size={18} />}
                style={{
                  background: message.type === 'user' ? '#3B82F6' : '#22C55E',
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  maxWidth: '70%',
                  background: message.type === 'user' ? '#3B82F6' : '#ffffff',
                  color: message.type === 'user' ? '#ffffff' : '#1f2937',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  boxShadow: message.type === 'assistant' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
                }}
              >
                <Text
                  style={{
                    color: message.type === 'user' ? '#ffffff' : '#1f2937',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {message.content}
                </Text>
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '11px',
                    color: message.type === 'user' ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                  }}
                >
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <Avatar icon={<Bot size={18} />} style={{ background: '#22C55E' }} />
              <div
                style={{
                  background: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#9ca3af',
                      borderRadius: '50%',
                      animation: 'pulse 1.4s ease-in-out infinite',
                    }}
                  />
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#9ca3af',
                      borderRadius: '50%',
                      animation: 'pulse 1.4s ease-in-out 0.2s infinite',
                    }}
                  />
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      background: '#9ca3af',
                      borderRadius: '50%',
                      animation: 'pulse 1.4s ease-in-out 0.4s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: '16px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Button
              type="primary"
              icon={<Send size={16} />}
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              style={{
                height: '40px',
                background: '#22C55E',
                borderColor: '#22C55E',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
