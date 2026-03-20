import { RouterProvider } from 'react-router-dom'; 
import { ConfigProvider } from 'antd';
import { YoloBitProvider } from './context/YoloBitContext';
import { router } from './routes';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#22C55E',
          borderRadius: 8,
        },
      }}
    >
      <YoloBitProvider>
        <RouterProvider router={router} />
      </YoloBitProvider>
    </ConfigProvider>
  );
}