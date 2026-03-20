import { Outlet, Link, useLocation } from 'react-router-dom';
import { useYoloBit } from '../context/YoloBitContext.jsx';
import { LayoutDashboard, Database, MessageSquare, Leaf, Circle } from 'lucide-react';

// QUAN TRỌNG: Phải có từ khóa export ở đây
export function MainLayout() {
  const { isConnected } = useYoloBit();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/data', label: 'Data History', Icon: Database },
    { path: '/assistant', label: 'AI Assistant', Icon: MessageSquare },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e2e8f0', 
        position: 'fixed', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Logo Section */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#22c55e', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Leaf size={24} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>Smart Farm</span>
        </div>

        {/* Connection Status */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ 
            padding: '10px', 
            borderRadius: '8px', 
            fontSize: '13px',
            backgroundColor: isConnected ? '#f0fdf4' : '#fef2f2',
            color: isConnected ? '#166534' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`
          }}>
            <Circle size={8} fill={isConnected ? '#22c55e' : '#ef4444'} stroke="none" />
            Yolo:Bit {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Menu Section */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navItems.map(({ path, label, Icon }) => {
            const active = location.pathname === path;
            return (
              <Link 
                key={path} 
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  color: active ? '#22c55e' : '#64748b',
                  backgroundColor: active ? '#f0fdf4' : 'transparent',
                  fontWeight: active ? 600 : 500
                }}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  );
}