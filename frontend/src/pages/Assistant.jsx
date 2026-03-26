import { Card, Input, Button, Typography, Avatar, Space, Tooltip } from 'antd';
import { Send, Bot, User, Droplets, Thermometer, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { assistantApi } from '../api/api';
import './CSS/Assistant.css'; // Import file CSS vừa tạo

const { Title, Text } = Typography;
const { TextArea } = Input;

const quickActions = [
  { icon: <Droplets size={16} />, label: 'Check Soil Health', action: 'soil-health' },
  { icon: <Thermometer size={16} />, label: 'Temperature Alert', action: 'temp-alert' },
  { icon: <AlertCircle size={16} />, label: 'System Status', action: 'system-status' },
  { icon: <CheckCircle size={16} />, label: 'Optimize Settings', action: 'optimize' },
];

export function Assistant() {
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('smart_farm_chat_history');
    if (savedChat) {
      const parsedChat = JSON.parse(savedChat);
      return parsedChat.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [
      {
        id: '1',
        type: 'assistant',
        content: "Hello! I'm your Smart Farm AI Assistant. I can help you monitor your farm, analyze sensor data, and provide recommendations. How can I assist you today?",
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem('smart_farm_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [isTyping]);

  const handleSend = async (messageText) => {
    const textToSend = typeof messageText === 'string' ? messageText : inputValue.trim();
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

    try {
      const res = await assistantApi.chat(textToSend);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: res.data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Assistant Error:", err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting to the AI server.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('smart_farm_chat_history');
    setMessages([{
      id: '1',
      type: 'assistant',
      content: "Chat history has been cleared. How can I assist you today?",
      timestamp: new Date(),
    }]);
  };

  const handleQuickAction = (action) => {
    const actionLabels = {
      'soil-health': 'Phân tích độ ẩm đất hiện tại và cho biết cây có cần tưới không?',
      'temp-alert': 'Kiểm tra nhiệt độ hiện tại có nằm trong ngưỡng an toàn không?',
      'system-status': 'Tóm tắt trạng thái hoạt động của toàn bộ hệ thống farm.',
      'optimize': 'Dựa trên các thông số hiện tại, hãy đưa ra gợi ý tối ưu môi trường.',
    };
    handleSend(actionLabels[action]);
  };

  return (
    <div>
      <div className="assistant-container">
        <div>
          <Title level={3} style={{ margin: 0 }}>AI Assistant</Title>
          <Text className="assistant-header-subtitle">Get intelligent insights and recommendations</Text>
        </div>
        <Tooltip title="Clear chat history">
          <Button 
            danger 
            type="text" 
            icon={<Trash2 size={20} />} 
            onClick={handleClearHistory}
          />
        </Tooltip>
      </div>

      <Card className="assistant-card" styles={{ body: { padding: '20px' } }}>
        <Text strong className="quick-actions-title">Quick Actions</Text>
        <Space wrap>
          {quickActions.map((action) => (
            <Button
              key={action.action}
              icon={action.icon}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action.action)}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      </Card>

      <Card className="chat-window-card" styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}>
        <div className="chat-messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className="message-wrapper"
              style={{ flexDirection: message.type === 'user' ? 'row-reverse' : 'row' }}
            >
              <Avatar
                icon={message.type === 'user' ? <User size={18} /> : <Bot size={18} />}
                style={{ background: message.type === 'user' ? '#3B82F6' : '#22C55E', flexShrink: 0 }}
              />
              <div
                className="message-bubble"
                style={{
                  background: message.type === 'user' ? '#3B82F6' : '#ffffff',
                  color: message.type === 'user' ? '#ffffff' : '#1f2937',
                  boxShadow: message.type === 'assistant' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
                }}
              >
                <Text className="message-text" style={{ color: message.type === 'user' ? '#ffffff' : '#1f2937' }}>
                  {message.content}
                </Text>
                <div className="message-time" style={{ color: message.type === 'user' ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper">
              <Avatar icon={<Bot size={18} />} style={{ background: '#22C55E' }} />
              <div className="message-bubble" style={{ background: '#ffffff' }}>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ borderRadius: '8px' }}
            />
            <Button
              type="primary"
              icon={<Send size={16} />}
              onClick={() => handleSend()}
              loading={isTyping}
              disabled={!inputValue.trim()}
              className="send-btn"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}